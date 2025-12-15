# Yucchin's Muscle Training
リアルタイムフォーム矯正・筋トレ支援アプリケーションです。
カメラ映像からユーザーの姿勢をリアルタイムで分析し、適切なトレーニングフォームを指導します。

## 🚀 アプリの概要
- **リアルタイムフォーム分析**: Webカメラを使用して、ユーザーの筋トレフォームをリアルタイムで解析。
- **トレーナー**: 姿勢推定モデル（MediaPipeなど）を使用し、フィードバックを提供。
- **安心の認証機能**: メールアドレスによる安全なログイン・新規登録（詳細な日本語エラー表示付き）。
- **カスタマイズ設定**: 通知音やキャラクター表示の切り替えなど、詳細なユーザー設定が可能。
- **モダンなUI**: shadcn/ui を採用した直感的で美しいユーザーインターフェース。

## 🛠 技術スタック

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4), shadcn/ui
- **Routing**: React Router DOM (v7)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.14+
- **Communication**: WebSocket (リアルタイム映像・データ転送)
- **AI/ML**: MediaPipe (姿勢推定)

## 📂 ディレクトリ構成

```
.
├── backend/            # Python FastAPI バックエンド
│   ├── main.py         # エントリーポイント & WebSocket ハンドラー
│   └── ...
└── frontend/           # React Vite フロントエンド
    ├── src/
    │   ├── components/ui/  # shadcn/ui コンポーネント
    │   ├── pages/          # 各画面 (Landing, Auth, Home, Camera)
    │   ├── App.tsx         # ルーティング設定
    │   └── ...
    ├── package.json
    └── ...
```

## ⚡ 環境構築と実行

### 環境構築
初回のみ必要な環境構築手順は [SETUP.md](./SETUP.md) を参照してください。

> [!IMPORTANT]
> 初回起動前に、バックエンドディレクトリに `.env` ファイルを作成する必要があります（SETUP.mdの手順4を参照）。

### 1. データベースの起動

```bash
docker-compose up -d
```

### 2. バックエンドの起動

```bash
# Backend
cd backend
# 依存関係のインストール (初回のみ)
uv sync
# サーバー起動 (ポート8000)
uv run uvicorn main:app --reload
```

### 3. フロントエンドの起動

新しいターミナルを開いて実行してください。
```bash
cd frontend
# 依存関係のインストール (初回のみ)
npm install
# 開発サーバー起動
npm run dev
```

> - **データベース未起動**: ログイン・新規登録・設定保存などができません（Internal Server Errorなどのエラーになります）。

> - **バックエンド未起動**: アプリ自体は開きますが、サーバーとの通信に失敗するため、ログインやカメラ機能など主要機能が一切動作しません。

### 4. アプリへのアクセス
ブラウザで [http://localhost:5173](http://localhost:5173) にアクセスしてください。
- バックエンドが起動していないとカメラ機能は動作しません。