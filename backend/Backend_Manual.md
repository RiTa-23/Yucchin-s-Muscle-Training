## 📂 ディレクトリ構成

```
backend/
├── app/
│   ├── routers/        # APIエンドポイントの定義
│   │   ├── auth.py
│   │   └── users.py
│   ├── models/         # データベースのモデル定義 (SQLAlchemyなど)
│   ├── schemas/        # 入出力データの定義 (Pydantic)
│   └── crud/           # データベース操作のロジック
├── main.py             # アプリのエントリーポイント
└── pyproject.toml      # 依存パッケージ管理
```

### 各ディレクトリの役割

- **`routers/`**: API の URL (エンドポイント) と、リクエストを受け取ったときの処理を記述します。`main.py` が肥大化しないように、機能ごとにファイルを分けます。
- **`models/`**: データベースのテーブル構造を定義するクラス (SQLAlchemy のモデルなど) を置きます。データベースとのやり取りの基盤になります。
- **`schemas/`**: API で受け取るデータや返すデータの「型」や「構造」を定義します (Pydantic モデル)。入力データのバリデーション (チェック) もここで行われます。
- **`crud/`**: データベースに対する Create, Read, Update, Delete (CRUD) 操作を行う関数をまとめます。API のロジックとデータベース操作を分離して、再利用しやすくします。
- **`main.py`**: アプリケーション全体のエントリーポイント（入り口）です。FastAPI アプリケーションのインスタンス作成、データベース接続設定、CORS 設定（フロントエンドからのアクセス許可）、そして各ルーターの登録（`include_router`）など、アプリ全体の初期設定を行います。
- **`__init__.py`**: そのディレクトリを「Pythonのパッケージ」として扱うためのマーカーファイルです。中身は空で構いませんが、これがあることで他のファイルから `from app.routers import ...` のようにインポートできるようになります。

---

## ⚡ 新規APIの作り方

新しいエンドポイントを追加する手順です。
規模が小さい間は `main.py` に直接書いても構いませんが、整理するために `routers` を使う方法を紹介します。

### 1. ルーターの作成

`app/routers/demo.py` のようにファイルを作成します。

```python
# app/routers/demo.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/demo")
async def read_demo():
    return {"message": "これはデモAPIです"}
```

### 2. メインファイルへの登録

`main.py` で作成したルーターを読み込みます。

```python
# main.py
from fastapi import FastAPI
from app.routers import demo # 追加

app = FastAPI()

# ルーターの追加
app.include_router(demo.router)
```

これで `http://localhost:8000/demo` にアクセスできるようになります。

---

## 📦 データの受け渡し (Pydantic)

データの入力チェックや型の定義には Pydantic モデルを使います。

```python
from pydantic import BaseModel

# データ構造の定義
class Item(BaseModel):
    name: str
    price: int
    is_offer: bool = None

@app.post("/items/")
async def create_item(item: Item):
    # item.name や item.price としてデータにアクセス可能
    return {"item_name": item.name, "item_price": item.price}
```

---

## 🗄 データベース接続

PostgreSQLを導入済みです。
非同期処理のために `SQLAlchemy` (ORM) と `asyncpg` (ドライバ) を使用しています。

### 設定ファイル (.env)

`backend/.env` ファイルに以下の設定が必要です。

```env
POSTGRES_USER=user
POSTGRES_PASSWORD=password
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/muscle_training_db
```

### 接続の仕組み (`app/database.py`)

- `AsyncSession` を使用して非同期にDBアクセスを行います。
- APIエンドポイントでは `get_db` 依存関係を使用します。

```python
@router.get("/users/")
async def read_users(db: AsyncSession = Depends(get_db)):
    ...
```

---

## 🛠 便利なコマンド

### サーバー起動 (ホットリロード有効)

```bash
uv run uvicorn main:app --reload
```

### パッケージの追加

```bash
uv add [パッケージ名]
```
