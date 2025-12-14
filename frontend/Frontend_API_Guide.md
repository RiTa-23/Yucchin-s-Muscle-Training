# ReactからFastAPIを呼び出す手順マニュアル (初心者向け)

React（フロントエンド）からFastAPI（バックエンド）のデータを取得したり、データを送信したりする手順を、初心者向けにステップバイステップで解説します。

---

## 🚀 1. 準備：Axios（アクシオス）のインストール

JavaScript標準の `fetch` でも通信はできますが、より簡単で便利な **Axios** というライブラリを使うのが一般的です。

ターミナル（`frontend` ディレクトリ）で以下のコマンドを実行してインストールします。

```bash
npm install axios
```

---

## 🛠 2. APIクライアントの作成

毎回 `http://localhost:8000/...` と書くのは大変なので、**設定済みの「専用の通信窓口（APIクライアント）」** を作ります。

`src/api/client.ts` ファイルを新規作成します。

```typescript
// src/api/client.ts
import axios from "axios";

// 共通設定をしたインスタンスを作成
const client = axios.create({
  baseURL: "http://localhost:8000", // バックエンドのURL
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
```

---

## 📡 3. データを送信する (POSTリクエスト)

ユーザー登録やログインなど、データをサーバーに送る場合に使います。

### 例：ログイン機能の実装

```typescript
import { useState } from "react";
import client from "../api/client"; // 作成したクライアントを読み込む

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // client.post("エンドポイント", { 送りたいデータ })
      const response = await client.post("/token", {
        username: username,
        password: password,
      }, {
        // FastAPIのOAuth2は Formデータ(x-www-form-urlencoded) を期待するため
        // 通常のJSONではなく以下のように送る必要がある場合がありますが、
        // 今回はとりあえず基本の形を説明します。
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log("成功！トークンゲット:", response.data.access_token);

    } catch (error) {
      console.error("エラー発生:", error);
      alert("ログインに失敗しました");
    }
  };

  return (
    <button onClick={handleLogin}>ログイン</button>
  );
};
```

---

## 📥 4. データを取得する (GETリクエスト)

ユーザー情報や商品リストなど、データをサーバーから受け取る場合に使います。
Reactでは `useEffect` を使って、画面が表示されたタイミングで受け取るのが基本です。

### 例：自分の・プロフィール取得

```typescript
import { useEffect, useState } from "react";
import client from "../api/client";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 非同期関数を定義して実行
    const fetchUser = async () => {
      try {
        // トークンが必要な場合（実装例）
        const token = localStorage.getItem("token"); 
        
        const response = await client.get("/users/me", {
            headers: {
                Authorization: `Bearer ${token}` // トークンをヘッダーに乗せる
            }
        });

        setUser(response.data); // データをstateに保存
      } catch (error) {
        console.error("取得失敗", error);
      }
    };

    fetchUser();
  }, []); // [] は「最初の1回だけ実行」の意味

  if (!user) return <div>読み込み中...</div>;

  return <div>こんにちは、{user.username}さん！</div>;
};
```

---

## ✅ まとめ

1. **`npm install axios`** でライブラリを入れる。
2. **`client.ts`** を作ってURLを一括管理する。
3. **`client.get`** や **`client.post`** で通信する。
4. **`async/await`** を使って、結果が返ってくるのを待ってから処理する。

これでバックエンドと自由にお話しできるようになります！
