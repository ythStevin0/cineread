const ItemSimilarity = require('../models/ItemSimilarity');
const History         = require('../models/History');
const Favorite        = require('../models/Favorite');
const { fetchFromTmdb } = require('../utils/tmdbService');
const { mapMovieData }  = require('../utils/movieHelpers');
const { mapTvData }     = require('../utils/tvHelpers');

// ── FILM/TV SERUPA (Content-Based) ─────────────────────────
// Tidak butuh login — berdasarkan metadata film

/**
 * GET /api/recommend/similar/:tmdbId
 * Ambil film/TV yang mirip berdasarkan pre-computed similarity.
 * Fallback ke TMDB /similar endpoint jika data AI belum tersedia.
 */
const getSimilarItems = async (req, res, next) => {
  const { tmdbId } = req.params;
  const { type = 'movie' } = req.query; // 'movie' atau 'tv'

  try {
    // 1. Coba ambil dari pre-computed AI data di MongoDB
    const aiData = await ItemSimilarity.findOne({ tmdbId: Number(tmdbId) });

    if (aiData && aiData.similarItems.length > 0) {
      // Ambil detail dari TMDB untuk setiap similar item
      const detailedItems = await Promise.all(
        aiData.similarItems.slice(0, 10).map(async (item) => {
          try {
            const endpoint = item.mediaType === 'tv' ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`;
            const { data } = await fetchFromTmdb(endpoint, {}, `${item.mediaType}:detail:${item.tmdbId}`, 21600);
            const mapped = item.mediaType === 'tv' ? mapTvData(data) : mapMovieData(data);
            return { ...mapped, similarityScore: item.score, source: 'ai' };
          } catch {
            // Jika film tidak ditemukan di TMDB, skip
            return null;
          }
        })
      );

      const validItems = detailedItems.filter(Boolean);

      if (validItems.length > 0) {
        return res.json({
          success: true,
          data: validItems,
          source: 'ai-hybrid',
          message: 'Rekomendasi dari AI Hybrid Model',
        });
      }
    }

    // 2. Fallback: gunakan TMDB /similar endpoint
    const endpoint = type === 'tv' ? `/tv/${tmdbId}/similar` : `/movie/${tmdbId}/similar`;
    const { data } = await fetchFromTmdb(endpoint, {}, `${type}:similar:${tmdbId}`, 3600);
    const mapFn = type === 'tv' ? mapTvData : mapMovieData;
    const items = data.results.slice(0, 10).map(item => ({
      ...mapFn(item),
      source: 'tmdb-fallback',
    }));

    res.json({
      success: true,
      data: items,
      source: 'tmdb-similar',
      message: 'Rekomendasi dari TMDB (AI data belum tersedia)',
    });
  } catch (error) { next(error); }
};


// ── REKOMENDASI PERSONAL (Hybrid) ──────────────────────────
// Butuh login — berdasarkan history + favorites user

/**
 * GET /api/recommend
 * Rekomendasi personal berdasarkan history & favorites user.
 * 
 * Logika:
 * 1. Ambil history + favorites user
 * 2. Untuk setiap item di history/favorites, ambil similar items dari AI
 * 3. Gabungkan, beri skor, hapus duplikat & yang sudah ditonton
 * 4. Return Top-10
 */
const getPersonalRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Ambil data user
    const [history, favorites] = await Promise.all([
      History.find({ user: userId }).sort({ viewedAt: -1 }).limit(20),
      Favorite.find({ user: userId }),
    ]);

    // Jika user belum punya history, kembalikan array kosong
    if (history.length === 0 && favorites.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'Belum ada riwayat. Mulai jelajahi film untuk mendapatkan rekomendasi!',
      });
    }

    // 2. Kumpulkan semua tmdbId yang sudah ditonton/difavorit
    const seenItems = new Set();
    const sourceItems = [];

    // Favorites mendapat bobot lebih tinggi
    favorites.forEach(f => {
      if (f.itemType === 'movie' || f.itemType === 'tv') {
        seenItems.add(f.itemId);
        sourceItems.push({ tmdbId: Number(f.itemId), weight: 3, type: f.itemType });
      }
    });

    // History (yang belum ada di favorites)
    history.forEach(h => {
      if ((h.itemType === 'movie' || h.itemType === 'tv') && !seenItems.has(h.itemId)) {
        seenItems.add(h.itemId);
        sourceItems.push({ tmdbId: Number(h.itemId), weight: 1, type: h.itemType });
      }
    });

    // 3. Ambil similar items dari AI data untuk setiap source
    const candidateMap = new Map(); // tmdbId → { score, mediaType }

    await Promise.all(
      sourceItems.slice(0, 10).map(async (source) => {
        const aiData = await ItemSimilarity.findOne({ tmdbId: source.tmdbId });
        if (aiData && aiData.similarItems) {
          aiData.similarItems.forEach(similar => {
            const key = String(similar.tmdbId);
            if (!seenItems.has(key)) {
              const weightedScore = similar.score * source.weight;
              const existing = candidateMap.get(key);
              if (!existing || existing.score < weightedScore) {
                candidateMap.set(key, {
                  tmdbId: similar.tmdbId,
                  score: weightedScore,
                  mediaType: similar.mediaType || source.type,
                });
              }
            }
          });
        }
      })
    );

    // 4. Sort by score, ambil top 10
    const topCandidates = Array.from(candidateMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Jika tidak ada kandidat dari AI, fallback ke TMDB similar
    if (topCandidates.length === 0) {
      // Gunakan film terakhir yang ditonton sebagai basis
      const lastItem = sourceItems[0];
      if (lastItem) {
        const endpoint = lastItem.type === 'tv'
          ? `/tv/${lastItem.tmdbId}/similar`
          : `/movie/${lastItem.tmdbId}/similar`;
        const { data } = await fetchFromTmdb(endpoint, {}, `${lastItem.type}:similar:${lastItem.tmdbId}`, 3600);
        const mapFn = lastItem.type === 'tv' ? mapTvData : mapMovieData;
        const fallbackItems = data.results
          .filter(item => !seenItems.has(String(item.id)))
          .slice(0, 10)
          .map(item => ({ ...mapFn(item), source: 'tmdb-fallback' }));

        return res.json({
          success: true,
          data: fallbackItems,
          source: 'tmdb-similar',
          message: 'Rekomendasi berdasarkan film terakhir yang kamu tonton',
        });
      }

      return res.json({ success: true, data: [], message: 'Belum cukup data untuk rekomendasi' });
    }

    // 5. Fetch detail dari TMDB
    const detailedItems = await Promise.all(
      topCandidates.map(async (candidate) => {
        try {
          const endpoint = candidate.mediaType === 'tv'
            ? `/tv/${candidate.tmdbId}`
            : `/movie/${candidate.tmdbId}`;
          const { data } = await fetchFromTmdb(endpoint, {}, `${candidate.mediaType}:detail:${candidate.tmdbId}`, 21600);
          const mapFn = candidate.mediaType === 'tv' ? mapTvData : mapMovieData;
          return {
            ...mapFn(data),
            recommendScore: candidate.score,
            source: 'ai-hybrid',
          };
        } catch {
          return null;
        }
      })
    );

    const validItems = detailedItems.filter(Boolean);

    res.json({
      success: true,
      data: validItems,
      source: 'ai-hybrid',
      message: `Rekomendasi personal berdasarkan ${sourceItems.length} film/serial yang kamu tonton`,
    });
  } catch (error) { next(error); }
};

module.exports = { getSimilarItems, getPersonalRecommendations };
