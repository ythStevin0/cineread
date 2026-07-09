"""
SASRec - Self-Attentive Sequential Recommendation
Referensi: Kang & McAuley, "Self-Attentive Sequential Recommendation" (ICDM 2018)

Model ini memprediksi item berikutnya yang akan dilihat user berdasarkan
urutan interaksi sebelumnya, menggunakan mekanisme Self-Attention (Transformer).
"""

import torch
import torch.nn as nn
import numpy as np


class PointWiseFeedForward(nn.Module):
    """Feed-forward layer per posisi di dalam Transformer block."""

    def __init__(self, hidden_units, dropout_rate):
        super().__init__()
        self.conv1 = nn.Conv1d(hidden_units, hidden_units, kernel_size=1)
        self.dropout1 = nn.Dropout(p=dropout_rate)
        self.relu = nn.ReLU()
        self.conv2 = nn.Conv1d(hidden_units, hidden_units, kernel_size=1)
        self.dropout2 = nn.Dropout(p=dropout_rate)

    def forward(self, inputs):
        # inputs: (batch_size, seq_len, hidden_units)
        outputs = self.dropout2(
            self.conv2(self.relu(self.dropout1(self.conv1(inputs.transpose(-1, -2)))))
        )
        outputs = outputs.transpose(-1, -2)  # back to (batch, seq_len, hidden)
        outputs += inputs  # Residual connection
        return outputs


class SASRec(nn.Module):
    """
    Self-Attentive Sequential Recommendation Model.

    Parameters:
    -----------
    num_items : int
        Jumlah total item unik dalam dataset
    hidden_units : int
        Dimensi embedding dan hidden layer (default: 64)
    maxlen : int
        Panjang maksimum sekuensi input (default: 50)
    num_blocks : int
        Jumlah Transformer block/layer (default: 2)
    num_heads : int
        Jumlah attention heads (default: 1)
    dropout_rate : float
        Dropout rate (default: 0.2)
    """

    def __init__(self, num_items, hidden_units=64, maxlen=50,
                 num_blocks=2, num_heads=1, dropout_rate=0.2):
        super().__init__()

        self.num_items = num_items
        self.hidden_units = hidden_units
        self.maxlen = maxlen

        # Embedding layers
        self.item_emb = nn.Embedding(num_items + 1, hidden_units, padding_idx=0)
        self.pos_emb = nn.Embedding(maxlen, hidden_units)
        self.emb_dropout = nn.Dropout(p=dropout_rate)

        # Transformer blocks
        self.attention_layernorms = nn.ModuleList()
        self.attention_layers = nn.ModuleList()
        self.forward_layernorms = nn.ModuleList()
        self.forward_layers = nn.ModuleList()

        for _ in range(num_blocks):
            self.attention_layernorms.append(nn.LayerNorm(hidden_units, eps=1e-8))
            self.attention_layers.append(
                nn.MultiheadAttention(hidden_units, num_heads, dropout=dropout_rate, batch_first=True)
            )
            self.forward_layernorms.append(nn.LayerNorm(hidden_units, eps=1e-8))
            self.forward_layers.append(PointWiseFeedForward(hidden_units, dropout_rate))

        self.last_layernorm = nn.LayerNorm(hidden_units, eps=1e-8)

    def _generate_causal_mask(self, seq_len, device):
        """Buat causal mask agar posisi i hanya bisa attend ke posisi <= i."""
        mask = torch.triu(torch.ones(seq_len, seq_len, device=device), diagonal=1).bool()
        return mask

    def forward(self, input_seq):
        """
        Forward pass.

        Parameters:
        -----------
        input_seq : torch.Tensor
            Sequence of item IDs, shape (batch_size, maxlen)

        Returns:
        --------
        torch.Tensor
            Output embeddings, shape (batch_size, maxlen, hidden_units)
        """
        # Item embedding + positional embedding
        seq_emb = self.item_emb(input_seq)
        positions = torch.arange(input_seq.shape[1], device=input_seq.device).unsqueeze(0)
        seq_emb += self.pos_emb(positions)
        seq_emb = self.emb_dropout(seq_emb)

        # Mask: padding positions (item_id == 0)
        padding_mask = (input_seq == 0)  # True for padded positions

        # Causal mask untuk mencegah melihat masa depan
        causal_mask = self._generate_causal_mask(input_seq.shape[1], input_seq.device)

        # Transformer blocks
        seqs = seq_emb
        for i in range(len(self.attention_layers)):
            seqs_norm = self.attention_layernorms[i](seqs)
            attn_output, _ = self.attention_layers[i](
                seqs_norm, seqs_norm, seqs_norm,
                attn_mask=causal_mask,
                key_padding_mask=padding_mask
            )
            seqs = seqs + attn_output  # Residual
            seqs = self.forward_layernorms[i](seqs)
            seqs = self.forward_layers[i](seqs)

        output = self.last_layernorm(seqs)
        return output

    def predict(self, input_seq, candidate_items):
        """
        Prediksi skor untuk candidate items berdasarkan sekuensi user.

        Parameters:
        -----------
        input_seq : torch.Tensor
            Shape (batch_size, maxlen) — sekuensi item yang sudah ditonton
        candidate_items : torch.Tensor
            Shape (batch_size, num_candidates) — item yang ingin diprediksi

        Returns:
        --------
        torch.Tensor
            Skor prediksi, shape (batch_size, num_candidates)
        """
        seq_output = self.forward(input_seq)  # (batch, maxlen, hidden)
        # Ambil output dari posisi terakhir yang bukan padding
        seq_output = seq_output[:, -1, :]  # (batch, hidden)

        # Dapatkan embedding candidate items
        candidate_emb = self.item_emb(candidate_items)  # (batch, num_candidates, hidden)

        # Hitung dot product sebagai skor prediksi
        scores = torch.bmm(candidate_emb, seq_output.unsqueeze(-1)).squeeze(-1)
        return scores
