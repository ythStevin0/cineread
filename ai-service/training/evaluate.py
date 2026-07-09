"""
Evaluation Script - Mengevaluasi model dengan metrik standar.

Metrik yang digunakan (sesuai PPT):
1. Precision@K — Berapa persen item yang direkomendasikan yang relevan
2. Recall@K    — Berapa persen item relevan yang berhasil direkomendasikan
3. NDCG@K      — Normalized Discounted Cumulative Gain (mempertimbangkan urutan)
"""

import numpy as np


def precision_at_k(recommended, relevant, k=10):
    """
    Precision@K: berapa banyak item dalam top-K yang relevan.

    Parameters:
    -----------
    recommended : list
        Daftar item ID yang direkomendasikan (sudah urut)
    relevant : set
        Set item ID yang benar-benar relevan
    k : int
        Jumlah top item yang dievaluasi

    Returns:
    --------
    float
        Precision@K score (0-1)
    """
    top_k = recommended[:k]
    relevant_in_topk = len(set(top_k) & relevant)
    return relevant_in_topk / k


def recall_at_k(recommended, relevant, k=10):
    """
    Recall@K: berapa banyak item relevan yang muncul di top-K.

    Returns:
    --------
    float
        Recall@K score (0-1)
    """
    if len(relevant) == 0:
        return 0.0
    top_k = recommended[:k]
    relevant_in_topk = len(set(top_k) & relevant)
    return relevant_in_topk / len(relevant)


def ndcg_at_k(recommended, relevant, k=10):
    """
    NDCG@K: Normalized Discounted Cumulative Gain.
    Memberikan skor lebih tinggi jika item relevan muncul di posisi awal.

    Returns:
    --------
    float
        NDCG@K score (0-1)
    """
    top_k = recommended[:k]

    # DCG
    dcg = 0.0
    for i, item in enumerate(top_k):
        if item in relevant:
            dcg += 1.0 / np.log2(i + 2)  # i+2 karena posisi 1-indexed

    # Ideal DCG (semua relevan di posisi teratas)
    ideal_hits = min(len(relevant), k)
    idcg = sum(1.0 / np.log2(i + 2) for i in range(ideal_hits))

    if idcg == 0:
        return 0.0
    return dcg / idcg


def hit_rate_at_k(recommended, relevant, k=10):
    """
    Hit Rate@K: apakah setidaknya satu item relevan ada di top-K.

    Returns:
    --------
    float
        1.0 jika ada hit, 0.0 jika tidak
    """
    top_k = recommended[:k]
    return 1.0 if len(set(top_k) & relevant) > 0 else 0.0


def evaluate_topk(model_recommendations, ground_truth, k=10):
    """
    Evaluasi batch seluruh user.

    Parameters:
    -----------
    model_recommendations : dict
        {userId: [item1, item2, ...]} — top-K rekomendasi per user
    ground_truth : dict
        {userId: set(item1, item2, ...)} — item yang benar-benar dilihat/suka

    Returns:
    --------
    dict
        Rata-rata metrik: precision, recall, ndcg, hit_rate
    """
    metrics = {
        'precision': [],
        'recall': [],
        'ndcg': [],
        'hit_rate': [],
    }

    for user_id in model_recommendations:
        if user_id not in ground_truth or len(ground_truth[user_id]) == 0:
            continue

        rec = model_recommendations[user_id]
        rel = ground_truth[user_id]

        metrics['precision'].append(precision_at_k(rec, rel, k))
        metrics['recall'].append(recall_at_k(rec, rel, k))
        metrics['ndcg'].append(ndcg_at_k(rec, rel, k))
        metrics['hit_rate'].append(hit_rate_at_k(rec, rel, k))

    result = {}
    for metric_name, values in metrics.items():
        result[f'{metric_name}@{k}'] = np.mean(values) if values else 0.0

    print(f"\n📊 Evaluasi Top-{k}:")
    print(f"  Precision@{k}: {result[f'precision@{k}']:.4f}")
    print(f"  Recall@{k}:    {result[f'recall@{k}']:.4f}")
    print(f"  NDCG@{k}:      {result[f'ndcg@{k}']:.4f}")
    print(f"  Hit Rate@{k}:  {result[f'hit_rate@{k}']:.4f}")
    print(f"  Dievaluasi pada {len(metrics['precision'])} users")

    return result
