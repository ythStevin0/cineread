# AI Service - CineRead Recommendation System

Folder ini berisi **script training** untuk sistem rekomendasi AI hybrid CineRead.

> ⚠️ Folder ini **TIDAK di-deploy** ke server manapun. 
> Gunakan Google Colab atau jalankan lokal untuk training model.

## Arsitektur Model

Model hybrid menggabungkan 3 pendekatan:
1. **SASRec** - Self-Attentive Sequential Recommendation
2. **NCF** - Neural Collaborative Filtering (Implicit Feedback)
3. **Content-Based** - TF-IDF dari metadata TMDB (genre, cast, keywords)

## Cara Menggunakan

### 1. Di Google Colab (Recommended)
- Upload notebook dari folder `notebooks/` ke Google Colab
- Jalankan notebook secara berurutan (01 → 06)
- Hasil training akan di-export ke MongoDB Atlas

### 2. Di Lokal
```bash
cd ai-service
pip install -r requirements.txt
python -m jupyter notebook
```

## Struktur Folder

```
ai-service/
├── requirements.txt          ← dependensi Python
├── models/
│   ├── sasrec.py             ← model SASRec (Sequential)
│   ├── ncf.py                ← model NCF (Collaborative Filtering)
│   └── hybrid.py             ← Hybrid Fusion Layer
├── data/
│   └── loader.py             ← load & preprocess dataset
├── training/
│   ├── train.py              ← script training model
│   └── evaluate.py           ← evaluasi metrik
├── notebooks/                ← Jupyter notebook untuk Colab
└── saved_models/             ← file .pt hasil training
```
