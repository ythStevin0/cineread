"""
NCF - Neural Collaborative Filtering (Implicit Feedback)
Referensi: He et al., "Neural Collaborative Filtering" (WWW 2017)

Model ini menggabungkan GMF (Generalized Matrix Factorization) dan
MLP (Multi-Layer Perceptron) untuk memprediksi preferensi user
terhadap item berdasarkan sinyal implicit (view, favorite).
"""

import torch
import torch.nn as nn


class NCF(nn.Module):
    """
    Neural Collaborative Filtering dengan Implicit Feedback.

    Menggabungkan dua jalur:
    1. GMF: Element-wise product dari user & item embedding (linear interaction)
    2. MLP: Concatenation + deep layers (non-linear interaction)

    Parameters:
    -----------
    num_users : int
        Jumlah total user unik
    num_items : int
        Jumlah total item unik
    embedding_dim : int
        Dimensi embedding untuk GMF (default: 32)
    mlp_layers : list of int
        Dimensi hidden layers untuk jalur MLP (default: [64, 32, 16])
    dropout_rate : float
        Dropout rate untuk regularisasi (default: 0.2)
    """

    def __init__(self, num_users, num_items, embedding_dim=32,
                 mlp_layers=None, dropout_rate=0.2):
        super().__init__()

        if mlp_layers is None:
            mlp_layers = [64, 32, 16]

        self.num_users = num_users
        self.num_items = num_items

        # ── GMF Path ─────────────────────────────────────────
        self.gmf_user_emb = nn.Embedding(num_users, embedding_dim)
        self.gmf_item_emb = nn.Embedding(num_items, embedding_dim)

        # ── MLP Path ─────────────────────────────────────────
        self.mlp_user_emb = nn.Embedding(num_users, mlp_layers[0] // 2)
        self.mlp_item_emb = nn.Embedding(num_items, mlp_layers[0] // 2)

        mlp_modules = []
        for i in range(len(mlp_layers) - 1):
            mlp_modules.append(nn.Linear(mlp_layers[i], mlp_layers[i + 1]))
            mlp_modules.append(nn.ReLU())
            mlp_modules.append(nn.Dropout(p=dropout_rate))
        self.mlp = nn.Sequential(*mlp_modules)

        # ── NeuMF (Fusion) ───────────────────────────────────
        # Output: gabungan GMF (embedding_dim) + MLP (mlp_layers[-1])
        self.output_layer = nn.Linear(embedding_dim + mlp_layers[-1], 1)
        self.sigmoid = nn.Sigmoid()

        self._init_weights()

    def _init_weights(self):
        """Inisialisasi weights dengan Xavier uniform."""
        for module in self.modules():
            if isinstance(module, nn.Embedding):
                nn.init.xavier_uniform_(module.weight)
            elif isinstance(module, nn.Linear):
                nn.init.xavier_uniform_(module.weight)
                if module.bias is not None:
                    module.bias.data.zero_()

    def forward(self, user_ids, item_ids):
        """
        Forward pass.

        Parameters:
        -----------
        user_ids : torch.Tensor
            User IDs, shape (batch_size,)
        item_ids : torch.Tensor
            Item IDs, shape (batch_size,)

        Returns:
        --------
        torch.Tensor
            Predicted scores (0-1), shape (batch_size,)
        """
        # GMF path: element-wise product
        gmf_user = self.gmf_user_emb(user_ids)
        gmf_item = self.gmf_item_emb(item_ids)
        gmf_output = gmf_user * gmf_item  # (batch, embedding_dim)

        # MLP path: concatenation + deep layers
        mlp_user = self.mlp_user_emb(user_ids)
        mlp_item = self.mlp_item_emb(item_ids)
        mlp_input = torch.cat([mlp_user, mlp_item], dim=-1)
        mlp_output = self.mlp(mlp_input)  # (batch, mlp_layers[-1])

        # NeuMF: concatenate GMF + MLP outputs
        concat = torch.cat([gmf_output, mlp_output], dim=-1)
        output = self.sigmoid(self.output_layer(concat)).squeeze(-1)
        return output

    def get_item_embeddings(self):
        """Ambil combined item embeddings (GMF + MLP) untuk similarity."""
        gmf_emb = self.gmf_item_emb.weight.data
        mlp_emb = self.mlp_item_emb.weight.data
        return torch.cat([gmf_emb, mlp_emb], dim=-1)
