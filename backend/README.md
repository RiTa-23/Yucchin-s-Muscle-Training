# 筋トレアプリ - バックエンド (Backend)

このディレクトリは、筋トレアプリのバックエンド部分です。
**FastAPI** を使用して構築されており、リアルタイム通信用の **WebSocket** エンドポイントを提供します。パッケージ管理には **uv** を使用しています。

## 技術スタック

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Protocol**: HTTP & WebSocket
- **Package Manager**: [uv](https://github.com/astral-sh/uv)

## ディレクトリ構成

```
backend/
├── main.py            # アプリケーションのエントリーポイント
├── pyproject.toml     # 依存関係の定義
├── uv.lock            # 依存関係のロックファイル
└── README.md
```

## セットアップと実行

### 1. 依存関係のインストール

`uv` がセットアップされている前提です。

```bash
uv sync
```
または、仮想環境を作成してインストールします。

### 2. サーバーの起動

開発モード（ホットリロード有効）で起動します。

```bash
uv run uvicorn main:app --reload
```

サーバーは `http://localhost:8000` で起動します。

## API エンドポイント

### HTTP

- `GET /`
    - ヘルスチェック用。`{"message": "Hello from FastAPI on Railway"}` を返します。

### WebSocket

- `WS /pose`
    - クライアントからの画像データ（将来的に）を受け取り、解析結果を返します。
    -現在はエコーバックサーバーとして動作します。

## 今後の実装予定

- **MediaPipe統合**: 受信した画像から姿勢推定を行う。
- **データベース接続**: PostgreSQLへの接続とORM (SQLAlchemy等) の導入。
- **認証**: FastAPI Usersを用いた認証機能の追加。
