"""
Hybrid Fusion Layer - Menggabungkan SASRec + NCF + Content-Based
Referensi: Konsep PPT Kelompok 5

Module ini mengambil skor/embedding dari ketiga model individual
dan menggabungkannya menjadi satu skor rekomendasi final.
"""

import torch
import torch.nn as nn
import numpy as np


class HybridFusionLayer(nn.Module):
    """
    Attention-based Hybrid Fusion Layer.

    Menggabungkan skor dari 3 sumber:
    1. SASRec score (sequential)
    2. NCF score (collaborative)
    3. Content similarity score (content-based)

    Menggunakan learned attention weights untuk menentukan
    kontribusi masing-masing model secara dinamis.

    Parameters:
    -----------
    hidden_dim : int
        Dimensi hidden layer (default: 32)
    """

    def __init__(self, hidden_dim=32):
        super().__init__()

        # Setiap skor (skalar) di-project ke hidden_dim
        self.sasrec_proj = nn.Linear(1, hidden_dim)
        self.ncf_proj = nn.Linear(1, hidden_dim)
        self.content_proj = nn.Linear(1, hidden_dim)

        # Attention mechanism untuk menentukan bobot
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim * 3, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 3),  # 3 weights untuk 3 sumber
            nn.Softmax(dim=-1)
        )

        # Final prediction layer
        self.output = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid()
        )

    def forward(self, sasrec_score, ncf_score, content_score):
        """
        Forward pass - gabungkan 3 skor menjadi 1 prediksi final.

        Parameters:
        -----------
        sasrec_score : torch.Tensor
            Skor dari SASRec, shape (batch_size, 1)
        ncf_score : torch.Tensor
            Skor dari NCF, shape (batch_size, 1)
        content_score : torch.Tensor
            Skor similarity dari Content-Based, shape (batch_size, 1)

        Returns:
        --------
        torch.Tensor
            Skor hybrid final (0-1), shape (batch_size, 1)
        dict
            Attention weights untuk interpretabilitas
        """
        # Project setiap skor ke hidden space
        s_proj = self.sasrec_proj(sasrec_score)    # (batch, hidden_dim)
        n_proj = self.ncf_proj(ncf_score)          # (batch, hidden_dim)
        c_proj = self.content_proj(content_score)  # (batch, hidden_dim)

        # Hitung attention weights
        concat = torch.cat([s_proj, n_proj, c_proj], dim=-1)  # (batch, hidden_dim*3)
        attn_weights = self.attention(concat)  # (batch, 3)

        # Weighted combination
        weighted = (
            attn_weights[:, 0:1] * s_proj +
            attn_weights[:, 1:2] * n_proj +
            attn_weights[:, 2:3] * c_proj
        )

        # Final prediction
        output = self.output(weighted)

        weights_dict = {
            'sasrec': attn_weights[:, 0].mean().item(),
            'ncf': attn_weights[:, 1].mean().item(),
            'content': attn_weights[:, 2].mean().item()
        }

        return output, weights_dict


class SimpleHybridFusion:
    """
    Versi sederhana tanpa deep learning — weighted average.

    Berguna untuk baseline atau ketika data training terbatas.
    Bobot bisa diatur manual atau di-tune berdasarkan evaluasi.
    """

    def __init__(self, w_sasrec=0.3, w_ncf=0.3, w_content=0.4):
        self.w_sasrec = w_sasrec
        self.w_ncf = w_ncf
        self.w_content = w_content

    def predict(self, sasrec_scores, ncf_scores, content_scores):
        """
        Gabungkan skor dengan weighted average.

        Parameters:
        -----------
        sasrec_scores : np.ndarray
            Skor dari SASRec, normalized 0-1
        ncf_scores : np.ndarray
            Skor dari NCF, normalized 0-1
        content_scores : np.ndarray
            Skor dari Content-Based, normalized 0-1

        Returns:
        --------
        np.ndarray
            Skor hybrid final
        """
        return (
            self.w_sasrec * np.array(sasrec_scores) +
            self.w_ncf * np.array(ncf_scores) +
            self.w_content * np.array(content_scores)
        )
