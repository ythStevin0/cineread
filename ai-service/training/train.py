"""
Training Script - Melatih model SASRec, NCF, dan Hybrid.

Cara penggunaan:
    python train.py --model sasrec --epochs 20 --batch_size 256
    python train.py --model ncf --epochs 10
    python train.py --model hybrid --epochs 15
"""

import os
import sys
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

# Tambah parent directory ke path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.sasrec import SASRec
from models.ncf import NCF
from models.hybrid import HybridFusionLayer
from data.loader import (
    download_movielens, load_ratings, load_links, load_movies,
    convert_to_implicit, create_user_sequences, split_data, negative_sampling
)
from training.evaluate import evaluate_topk


SAVE_DIR = os.path.join(os.path.dirname(__file__), '..', 'saved_models')


def train_ncf(train_df, val_df, num_users, num_items, epochs=10, batch_size=256, lr=0.001):
    """Training NCF dengan implicit feedback."""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\n🧠 Training NCF pada {device}...")

    model = NCF(num_users + 1, num_items + 1, embedding_dim=32, mlp_layers=[64, 32, 16]).to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.BCELoss()

    # Prepare data
    train_samples = negative_sampling(train_df, num_items, neg_ratio=4)
    train_users = torch.LongTensor(train_samples['userId'].values)
    train_items = torch.LongTensor(train_samples['movieId'].values)
    train_labels = torch.FloatTensor(train_samples['label'].values)
    train_dataset = TensorDataset(train_users, train_items, train_labels)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    best_val_loss = float('inf')
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for users, items, labels in train_loader:
            users, items, labels = users.to(device), items.to(device), labels.to(device)
            predictions = model(users, items)
            loss = criterion(predictions, labels)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"  Epoch {epoch+1}/{epochs} — Loss: {avg_loss:.4f}")

        # Simple validation
        if avg_loss < best_val_loss:
            best_val_loss = avg_loss
            os.makedirs(SAVE_DIR, exist_ok=True)
            torch.save(model.state_dict(), os.path.join(SAVE_DIR, 'ncf_model.pt'))

    print(f"✅ NCF training selesai. Best loss: {best_val_loss:.4f}")
    return model


def train_sasrec(sequences, num_items, epochs=20, batch_size=128, lr=0.001, maxlen=50):
    """Training SASRec dengan user sequences."""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\n🧠 Training SASRec pada {device}...")

    model = SASRec(num_items, hidden_units=64, maxlen=maxlen, num_blocks=2, num_heads=2).to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr, betas=(0.9, 0.98))
    criterion = nn.BCEWithLogitsLoss()

    # Prepare sequences
    user_ids = list(sequences.keys())

    best_loss = float('inf')
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        np.random.shuffle(user_ids)

        batch_count = 0
        for start in range(0, len(user_ids), batch_size):
            batch_users = user_ids[start:start + batch_size]

            # Prepare input (semua item kecuali terakhir) dan target (semua item kecuali pertama)
            input_seqs = []
            pos_items = []
            neg_items = []

            for uid in batch_users:
                seq = sequences[uid]
                if len(seq) < 2:
                    continue

                # Pad sequence
                padded = [0] * (maxlen - len(seq) + 1) + seq[:-1]
                padded = padded[-maxlen:]
                input_seqs.append(padded)

                # Positive: item berikutnya
                pos_items.append(seq[-1])

                # Negative: random item yang tidak ada di sequence
                neg = np.random.randint(1, num_items + 1)
                while neg in seq:
                    neg = np.random.randint(1, num_items + 1)
                neg_items.append(neg)

            if not input_seqs:
                continue

            input_seqs = torch.LongTensor(input_seqs).to(device)
            pos_items = torch.LongTensor(pos_items).to(device)
            neg_items = torch.LongTensor(neg_items).to(device)

            # Forward
            seq_output = model(input_seqs)[:, -1, :]  # Last position
            pos_emb = model.item_emb(pos_items)
            neg_emb = model.item_emb(neg_items)

            pos_scores = (seq_output * pos_emb).sum(dim=-1)
            neg_scores = (seq_output * neg_emb).sum(dim=-1)

            pos_labels = torch.ones_like(pos_scores)
            neg_labels = torch.zeros_like(neg_scores)

            loss = criterion(pos_scores, pos_labels) + criterion(neg_scores, neg_labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            batch_count += 1

        avg_loss = total_loss / max(batch_count, 1)
        print(f"  Epoch {epoch+1}/{epochs} — Loss: {avg_loss:.4f}")

        if avg_loss < best_loss:
            best_loss = avg_loss
            os.makedirs(SAVE_DIR, exist_ok=True)
            torch.save(model.state_dict(), os.path.join(SAVE_DIR, 'sasrec_model.pt'))

    print(f"✅ SASRec training selesai. Best loss: {best_loss:.4f}")
    return model


def main():
    parser = argparse.ArgumentParser(description='Training model rekomendasi CineRead')
    parser.add_argument('--model', type=str, default='all', choices=['sasrec', 'ncf', 'all'],
                        help='Model yang akan di-training')
    parser.add_argument('--dataset', type=str, default='25m', choices=['100k', '1m', '25m'],
                        help='Ukuran dataset MovieLens')
    parser.add_argument('--epochs', type=int, default=10, help='Jumlah epoch training')
    parser.add_argument('--batch_size', type=int, default=256, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    args = parser.parse_args()

    # 1. Load data
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    dataset_path = download_movielens(args.dataset, data_dir)

    ratings = load_ratings(dataset_path)
    links = load_links(dataset_path)
    movies = load_movies(dataset_path)

    # 2. Preprocess
    implicit = convert_to_implicit(ratings, threshold=3.5)
    train_df, val_df, test_df = split_data(implicit)

    num_users = ratings['userId'].max()
    num_items = ratings['movieId'].max()

    # 3. Training
    if args.model in ('ncf', 'all'):
        ncf_model = train_ncf(train_df, val_df, num_users, num_items,
                              epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)

    if args.model in ('sasrec', 'all'):
        sequences = create_user_sequences(implicit, maxlen=50)
        sasrec_model = train_sasrec(sequences, num_items,
                                    epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)

    print("\n🎉 Training selesai! Model tersimpan di folder saved_models/")


if __name__ == '__main__':
    main()
