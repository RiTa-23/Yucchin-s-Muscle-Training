# 環境構築ガイド
このプロジェクトをローカル環境で実行するための手順を、MacとWindows向けに解説します。

## 📋 前提条件

以下のツールがインストールされている必要があります。

- **Node.js**: v18以上推奨
- **Python**: 3.14以上推奨 (uvを使用する場合は自動管理可能)
- **uv**: 高速なPythonパッケージマネージャー
- **Docker**: データベース(PostgreSQL)の実行に必要

### バージョン確認 (Check Versions)
すでにツールがインストールされているか確認するには、ターミナル(Mac)またはPowerShell(Windows)で以下のコマンドを実行してください。

```bash
# Node.js (v18.0.0以上が表示されればOK)
node -v

# Python (3.14.xなどが表示されればOK)
python --version
# または
python3 --version

# uv
uv --version

# Docker (バージョン情報が表示されればOK)
docker --version
docker-compose --version
```

インストールされていない、またはバージョンが古い場合は、以下の手順に進んでください。

---

## 🛠 インストール手順

### 1. `uv` (Python Package Manager) のインストール

#### 🍎 Mac (Terminal)
```bash
# curlを使用してインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# シェルの再読み込み (またはターミナル再起動)
# source ~/.zshrc  (または ~/.bashrc など、お使いのシェルに合わせて)
```

#### 🪟 Windows (PowerShell)
```powershell
# PowerShellスクリプトを使用してインストール
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 注意: エラーが出る場合は、一度PowerShellを管理者権限で開き直してください。
```

### 2. Node.js のインストール

まだインストールしていない場合は、以下の方法でインストールしてください。

- **Mac**: `brew install node` または [nvm](https://github.com/nvm-sh/nvm) を使用
- **Windows**: [公式サイト](https://nodejs.org/) からインストーラーをダウンロード、または [nvm-windows](https://github.com/coreybutler/nvm-windows) を使用

### 3. リポジトリのクローン

```bash
git clone https://github.com/Team-Yucchin/Yucchin-s-Muscle-Training.git
cd Yucchin-s-Muscle-Training
```

### 4. 依存関係のインストール

#### Backend (Python)
`uv` を使用して依存関係を同期します。仮想環境も自動的に作成されます。

```bash
cd backend
uv sync
```

#### データベース設定 (Environment & DB)

1. **環境変数の作成**: `backend` ディレクトリに `.env` ファイルを作成します。

```bash
# backend/.env
POSTGRES_USER=user
POSTGRES_PASSWORD=password
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/muscle_training_db
SECRET_KEY=your_super_secret_key_change_this_in_production
```

> [!TIP]
> `SECRET_KEY` はセキュリティ上重要です。以下のコマンドで安全なキーを生成できます（本番環境では必須）：
> `openssl rand -hex 32`


2. **データベースの起動**: Dockerを使ってPostgreSQLを起動します。

```bash
# プロジェクトルートで実行
docker-compose up -d
```

#### Frontend (React)
`npm` を使用してパッケージをインストールします。

```bash
cd ../frontend
npm install
```

---

## 🚀 アプリケーションの起動 (Running the App)

バックエンドとフロントエンドを別々のターミナルで起動します。

### Backend (FastAPI)

```bash
# プロジェクトルートから
cd backend

# サーバー起動 (ポート 8000)
# uv run を使うと、仮想環境の有効化なしでコマンド実行可能
uv run uvicorn main:app --reload
```
起動確認: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend (Vite)

```bash
# プロジェクトルートから (新しいターミナルで)
cd frontend

# 開発サーバー起動
npm run dev
```
起動確認: [http://localhost:5173](http://localhost:5173)

---

## ⚠️ トラブルシューティング

- **`uv` コマンドが見つからない**: 
    - インストール後にターミナルを再起動していない可能性があります。一度閉じて開き直してください。
    - パスが通っていない場合、各OSの手順に従ってPATHを追加してください。
- **Pythonのバージョンエラー**:
    - `uv` はプロジェクトで指定されたPythonバージョンを自動でダウンロードしようとします。インターネット接続を確認してください。
- **ポート競合**:
    - 既に `8000` や `5173` が使われている場合、それぞれのエラーメッセージに従ってプロセスを終了するか、ポート設定を変更してください。
