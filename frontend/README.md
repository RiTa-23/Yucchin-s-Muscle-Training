# 筋トレアプリ - フロントエンド (Frontend)

このディレクトリは、筋トレアプリのフロントエンド部分です。
**React**、**TypeScript**、**Vite**、および **Tailwind CSS (v4)** を使用して構築されています。

## 技術スタック

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **WebSocket**: Native WebSocket API

## ディレクトリ構成

```
frontend/
├── src/
│   ├── App.tsx       # メインコンポーネント (カメラ & WebSocketロジック)
│   ├── index.css     # CSS (Tailwindのインポート)
│   └── main.tsx      # エントリーポイント
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## セットアップと実行

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```
ブラウザで [http://localhost:5173](http://localhost:5173) を開きます。

### 3. ビルド (本番用)

```bash
npm run build
```
`dist` フォルダに静的ファイルが生成されます。

## 機能

- **カメラ映像の取得**: `getUserMedia` を使用してブラウザでカメラ映像を表示します。
- **WebSocket通信**: バックエンド (`ws://localhost:8000/pose`) に接続し、双方向通信を行います。
- **UI**: Tailwind CSS を使用したレスポンシブなデザイン。

## 設定

もしバックエンドのURLを変更する場合は、`src/App.tsx` 内の `ws://localhost:8000/pose` を修正してください。
