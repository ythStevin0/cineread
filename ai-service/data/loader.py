"""
Data Loader - Memuat dan memproses dataset MovieLens 25M + TMDB Metadata.

Fungsi utama:
1. Download dan extract dataset MovieLens 25M
2. Mapping movieId → tmdbId menggunakan links.csv
3. Fetch metadata TMDB (genre, cast, keywords) 
4. Merge menjadi satu dataset bersih
5. Split train/val/test
"""

import os
import zipfile
import pandas as pd
import numpy as np
from collections import defaultdict

# Direktori data
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)))


def download_movielens(size='25m', data_dir=None):
    """
    Download dataset MovieLens.

    Parameters:
    -----------
    size : str
        Ukuran dataset: '25m' (default), '1m', '100k'
    data_dir : str
        Folder penyimpanan (default: folder data/)

    Returns:
    --------
    str
        Path ke folder dataset yang sudah di-extract
    """
    import requests

    if data_dir is None:
        data_dir = DATA_DIR

    urls = {
        '100k': 'https://files.grouplens.org/datasets/movielens/ml-100k.zip',
        '1m':   'https://files.grouplens.org/datasets/movielens/ml-1m.zip',
        '25m':  'https://files.grouplens.org/datasets/movielens/ml-25m.zip',
    }

    url = urls.get(size)
    if not url:
        raise ValueError(f"Ukuran dataset '{size}' tidak dikenali. Pilih: {list(urls.keys())}")

    zip_path = os.path.join(data_dir, f'ml-{size}.zip')
    extract_path = os.path.join(data_dir, f'ml-{size}')

    if os.path.exists(extract_path):
        print(f"✅ Dataset ml-{size} sudah ada di {extract_path}")
        return extract_path

    print(f"⬇️ Mengunduh MovieLens {size}...")
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))

    with open(zip_path, 'wb') as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                pct = (downloaded / total_size) * 100
                print(f"\r  {pct:.1f}% ({downloaded // (1024*1024)}MB / {total_size // (1024*1024)}MB)", end='')
    print()

    print("📦 Mengekstrak...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(data_dir)

    os.remove(zip_path)
    print(f"✅ Dataset tersimpan di {extract_path}")
    return extract_path


def load_ratings(dataset_path):
    """
    Load file ratings.csv dari MovieLens.

    Returns:
    --------
    pd.DataFrame
        Kolom: userId, movieId, rating, timestamp
    """
    ratings_file = os.path.join(dataset_path, 'ratings.csv')
    print(f"📊 Memuat ratings dari {ratings_file}...")
    df = pd.read_csv(ratings_file)
    print(f"  → {len(df):,} ratings dari {df['userId'].nunique():,} users dan {df['movieId'].nunique():,} movies")
    return df


def load_links(dataset_path):
    """
    Load file links.csv untuk mapping movieId → tmdbId.

    Returns:
    --------
    dict
        Mapping {movieId: tmdbId}
    """
    links_file = os.path.join(dataset_path, 'links.csv')
    df = pd.read_csv(links_file)
    # tmdbId bisa NaN, filter yang valid saja
    valid = df.dropna(subset=['tmdbId'])
    mapping = dict(zip(valid['movieId'].astype(int), valid['tmdbId'].astype(int)))
    print(f"🔗 Mapping movieId → tmdbId: {len(mapping):,} film")
    return mapping


def load_movies(dataset_path):
    """
    Load file movies.csv untuk metadata dasar (title, genres).

    Returns:
    --------
    pd.DataFrame
        Kolom: movieId, title, genres (pipe-separated)
    """
    movies_file = os.path.join(dataset_path, 'movies.csv')
    df = pd.read_csv(movies_file)
    print(f"🎬 Memuat {len(df):,} metadata film")
    return df


def convert_to_implicit(ratings_df, threshold=3.5):
    """
    Konversi explicit ratings menjadi implicit feedback.

    Rating >= threshold → positif (1)
    Rating < threshold  → negatif (0) / diabaikan

    Parameters:
    -----------
    ratings_df : pd.DataFrame
        DataFrame dengan kolom rating
    threshold : float
        Batas untuk dianggap 'suka' (default: 3.5)

    Returns:
    --------
    pd.DataFrame
        DataFrame hanya dengan interaksi positif
    """
    positive = ratings_df[ratings_df['rating'] >= threshold].copy()
    positive['implicit'] = 1
    print(f"👍 {len(positive):,} interaksi positif (rating >= {threshold}) dari {len(ratings_df):,} total")
    return positive


def create_user_sequences(ratings_df, maxlen=50):
    """
    Buat urutan item per user berdasarkan timestamp untuk SASRec.

    Parameters:
    -----------
    ratings_df : pd.DataFrame
        DataFrame sorted by timestamp
    maxlen : int
        Panjang maksimum sekuensi (default: 50)

    Returns:
    --------
    dict
        {userId: [item1, item2, ..., itemN]} urut berdasarkan waktu
    """
    # Sort by timestamp
    df_sorted = ratings_df.sort_values(['userId', 'timestamp'])

    sequences = defaultdict(list)
    for _, row in df_sorted.iterrows():
        sequences[row['userId']].append(row['movieId'])

    # Truncate ke maxlen (ambil yang terbaru)
    for uid in sequences:
        if len(sequences[uid]) > maxlen:
            sequences[uid] = sequences[uid][-maxlen:]

    print(f"📋 {len(sequences):,} sekuensi user dibuat (max {maxlen} item/user)")
    return dict(sequences)


def split_data(ratings_df, test_ratio=0.1, val_ratio=0.1):
    """
    Split data berdasarkan timestamp (time-based split).
    Interaksi terbaru jadi test, sebelumnya jadi train.

    Returns:
    --------
    tuple of pd.DataFrame
        (train_df, val_df, test_df)
    """
    df_sorted = ratings_df.sort_values('timestamp')
    n = len(df_sorted)

    test_start = int(n * (1 - test_ratio))
    val_start = int(n * (1 - test_ratio - val_ratio))

    train_df = df_sorted.iloc[:val_start]
    val_df = df_sorted.iloc[val_start:test_start]
    test_df = df_sorted.iloc[test_start:]

    print(f"📊 Split data:")
    print(f"  Train: {len(train_df):,} ({len(train_df)/n*100:.1f}%)")
    print(f"  Val:   {len(val_df):,} ({len(val_df)/n*100:.1f}%)")
    print(f"  Test:  {len(test_df):,} ({len(test_df)/n*100:.1f}%)")

    return train_df, val_df, test_df


def negative_sampling(positive_df, num_items, neg_ratio=4):
    """
    Generate negative samples untuk training NCF.
    Untuk setiap interaksi positif, ambil neg_ratio item yang
    belum pernah di-interaksi user sebagai negative sample.

    Parameters:
    -----------
    positive_df : pd.DataFrame
        DataFrame dengan interaksi positif
    num_items : int
        Total jumlah item unik
    neg_ratio : int
        Jumlah negative per positive (default: 4)

    Returns:
    --------
    pd.DataFrame
        DataFrame dengan kolom: userId, movieId, label (1=positif, 0=negatif)
    """
    user_items = defaultdict(set)
    for _, row in positive_df.iterrows():
        user_items[row['userId']].add(row['movieId'])

    all_items = set(range(1, num_items + 1))
    rows = []

    for _, row in positive_df.iterrows():
        uid = row['userId']
        # Positive
        rows.append({'userId': uid, 'movieId': row['movieId'], 'label': 1})

        # Negatives
        neg_candidates = list(all_items - user_items[uid])
        if len(neg_candidates) >= neg_ratio:
            neg_items = np.random.choice(neg_candidates, size=neg_ratio, replace=False)
        else:
            neg_items = neg_candidates
        for neg_id in neg_items:
            rows.append({'userId': uid, 'movieId': neg_id, 'label': 0})

    result = pd.DataFrame(rows)
    print(f"🔀 Negative sampling: {len(result):,} samples (pos: {(result['label']==1).sum():,}, neg: {(result['label']==0).sum():,})")
    return result
