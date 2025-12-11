## 📂 ディレクトリ構成

推奨される構成です。規模が大きくなったらこの形に整理していくと良いでしょう。

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

## 🗄 データベース接続 (今後の予定)

今後データベース (PostgreSQL) を導入する場合は、非同期対応のドライバ (`asyncpg`) と ORM (`SQLAlchemy`) を使用するのが一般的です。

```bash
uv add sqlalchemy asyncpg
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
