# Yucchin's Muscle Training
リアルタイムフォーム矯正・筋トレ支援アプリケーションです。
カメラ映像からユーザーの姿勢をリアルタイムで分析し、適切なトレーニングフォームを指導します。

## 🚀 アプリの概要
- **リアルタイムフォーム分析**: Webカメラを使用して、ユーザーの筋トレフォームをリアルタイムで解析。
- **AIトレーナー**: 姿勢推定モデル（MediaPipeなど）を使用し、フィードバックを提供。
- **モダンなUI**: shadcn/ui を採用した直感的で美しいユーザーインターフェース。

## 🛠 技術スタック

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4), shadcn/ui
- **Routing**: React Router DOM (v7)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12+
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

## ⚡ セットアップと実行

### 前提条件
- Node.js (v18+)
- Python (3.12+)
- uv (Pythonパッケージマネージャー)

### 1. バックエンドの起動

```bash
cd backend
# 依存関係のインストール (初回のみ)
uv sync

# サーバー起動 (ポート8000)
uv run uvicorn main:app --reload
```

### 2. フロントエンドの起動

新しいターミナルを開いて実行してください。

```bash
cd frontend
# 依存関係のインストール (初回のみ)
npm install

# 開発サーバー起動
npm run dev
```

### 3. アプリへのアクセス
ブラウザで [http://localhost:5173](http://localhost:5173) にアクセスしてください。
- バックエンドが起動していないとカメラ機能は動作しません。
