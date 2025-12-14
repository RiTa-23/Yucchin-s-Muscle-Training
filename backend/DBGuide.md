# DB実装ガイド
## SQLAlchemy （＋**PostgreSQL ）実装ロードマップ**

データベースを使った機能を実装するための「4つのステップ」を解説します。 初心者が迷わないよう、各ファイルが「何の役割」を持っているかを明確にします。

## **全体の流れ**

1. **Model (モデル)**: データベースの表（テーブル）の形を決める
2. **Schema (スキーマ)**: アプリとやり取りするデータの形を決める
3. **CRUD**: データの保存・取得などの具体的な処理を書く
4. **Router (ルーター)**: URL（API）を作って、CRUDを呼び出す

---

## **1. Model（モデル）の作成**

**場所**: `backend/app/models/` **役割**: 「データベースにどんなデータを保存するか」を定義します。

例: `User` モデル（ユーザー情報を保存する）

```python
# app/models/user.py
from sqlalchemy import Column, Integer, String
from app.database import Base
class User(Base):
    __tablename__ = "users"  # DB上のテーブル名
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)

```

## **2. DBへの反映（テーブル作成）**

### テーブル自動作成 `（※ この作業はすでに行っているのでやらなくてよい）`

モデルを書いただけではデータベースに箱（テーブル）は作られません。 簡単な方法は、**アプリ起動時に自動で作る** 設定をすることです。

`backend/app/main.py` に以下のコードを追加すると、起動時に自動でテーブルが作られます。

```python
from app.database import engine, Base
from app.models import user  # モデルを読み込む必要がある
# 起動時に実行される処理
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

```

### app/models/__init__.py に追記する`（こっちはやってね！）`

**このファイルの役割**: `app/models/__init__.py` は、モデルを一括で管理するための「エントリーポイント」です。新しいモデル（例: `User`、`PoseLog` など）を作成したら、このファイルに追記することで、アプリ全体でそのモデルを認識できるようになります。

**なぜ必要？**

- **テーブル作成時に必要**: `Base.metadata.create_all()` を実行する際、ここに書かれたモデルだけがテーブルとして作成されます。

**例**:  `User` モデルの追加

```python
from .user import User 
```

**from .ファイル名 import モデル名 という形式で書く**

## **3. Schema（スキーマ）の作成**

**場所**: `backend/app/schemas/` **役割**: 「クライアント（フロントエンド）とやり取りするデータのルール」を決めます。 `Pydantic` というライブラリを使います。

例: ユーザー作成時に受け取るデータ

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
```

### app/schemas/__init__.py に追記する `（任意だけど推奨）`

**役割**: インポートを簡単にするため。
これを書くと、他のファイルで `from app.schemas.user import UserCreate` と書く代わりに、`from app.schemas import UserCreate` と短く書けるようになります。

**例**:

```python
from .user import UserCreate
```

## **4. CRUD処理の作成**

**場所**: `backend/app/crud/` **役割**: データベースに対する「作成・読み込み・更新・削除」のロジックをここに書きます。

例: ユーザーを保存する関数

```python
# app/crud/user.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate
async def create_user(db: AsyncSession, user: UserCreate):
    db_user = User(username=user.username, email=user.email)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

```

### app/crud/__init__.py に追記する `（任意だけど推奨）`

**役割**: インポートを簡単にするため。
例: `from app.crud.user import create_user` → `from app.crud import create_user`

**例**:

```python
from .user import create_user
```

## **5. Router（API）の作成**

**場所**: `backend/app/routers/` **役割**: URL（例: `/users/`）を作り、外からアクセスできるようにします。

```python
# app/routers/users.py 
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud import user as user_crud

router = APIRouter()

@router.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await user_crud.create_user(db=db, user=user)
```

## **6. よく使うDB関連コマンド**

| 目的 | コマンド (ターミナルで実行) |
| --- | --- |
| **DBを起動 (最初にこれ！)** | `docker-compose up -d` |
| **DBに接続 (SQLを実行)** | `docker-compose exec db psql -U user -d muscle_training_db` |
| **全テーブルを確認** | `\dt` (接続後に実行) |
| **ユーザー一覧を見る** | `SELECT * FROM users;` (接続後に実行) |
| **DBから切断** | `\q` (接続後に実行) |
| **DBをリセット (データ全消去)** | `docker-compose down -v` → `docker-compose up -d` |
| **コンテナのログ確認** | `docker-compose logs -f db` |