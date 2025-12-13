## 📂 ディレクトリ構成

主要なファイルやフォルダの役割です。

```
frontend/src/
├── components/     # 再利用可能なUIパーツ
│   └── ui/         # shadcn/ui のコンポーネント (Buttonなど)
├── pages/          # ページ単位のコンポーネント
│   ├── auth/       # 認証・ログイン画面
│   ├── dashboard/  # ホーム画面など
│   └── ...
├── App.tsx         # ルーティング設定 (画面遷移の定義)
└── main.tsx        # アプリのエントリーポイント

```

---

## 📄 新規ページの作り方

新しい画面を追加する手順です。

### 1. ページコンポーネントの作成

`src/pages` フォルダ内に新しいフォルダとファイルを作成します。例: `src/pages/demo/DemoPage.tsx`

```tsx
// src/pages/demo/DemoPage.tsx

export default function DemoPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">デモページ</h1>
      <p>ここは新しいページです。</p>
    </div>
  );
}
```

### 2. ルーティングの追加

`src/App.tsx` を編集して、作成したページへのURLを設定します。

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DemoPage from './pages/demo/DemoPage'; // インポートを追加

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ...他のルート... */}
        <Route path="/demo" element={<DemoPage />} /> {/* 追加 */}
      </Routes>
    </BrowserRouter>
  );
}

```

これで `http://localhost:5173/demo` にアクセスできるようになります。

---

## 🔗 画面遷移の実装

### リンクによる遷移 (`<Link>`)

ボタンやテキストをクリックして**単にページを移動する場合**は、`<Link>` を使うのが基本です

shadcn/ui の `Button` をリンクとして使う場合は `asChild` プロパティを使うときれいに書けます。

```tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// 推奨: Buttonをリンク化する
<Button asChild>
  <Link to="/home">ホームへ戻る</Link>
</Button>
```

### プログラムによる遷移 (`useNavigate`)

**処理の完了後**などに自動で遷移させる場合に使います（例：フォーム送信後、ログアウト処理後など）。

```tsx
import { useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 1. ログイン処理などをここで実行
    console.log("Logged in!");
    
    // 2. 処理が終わったら遷移
    navigate('/home'); 
  };

  return <Button onClick={handleLogin}>ログイン</Button>;
};
```

---

## 🎨 UIの実装

### Tailwind CSS の使い方

クラス名 (`className`) を指定してスタイルを適用します。CSSファイルを書く必要はありません。

- `p-4`: padding 1rem (16px)
- `bg-blue-500`: 背景色 青
- `text-white`: 文字色 白
- `rounded-md`: 角丸
- `hover:opacity-80`: ホバー時に透明度を変更

```tsx
<div className="bg-blue-500 text-white p-4 rounded-md hover:opacity-80">
  スタイリッシュなボックス
</div>

```

### shadcn/ui の使い方

`src/components/ui` にあるコンポーネントをインポートして使います。

例：ボタンのコンポーネントを使用する場合

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" onClick={() => alert('Clicked!')}>
  ボタン
</Button>

```

- **variant**: `default`, `destructive` (赤), `outline` (枠線のみ), `ghost` (背景なし) などが選べます。

### その他の shadcn/ui コンポーネント

Button 以外にも、さまざまなUIコンポーネントが用意されています。

- **Input**: テキスト入力欄
- **Card**: コンテンツをまとめる枠
- **Dialog**: モーダル(ポップアップ)ダイアログ
- **Select**: ドロップダウン選択
- **Checkbox**: チェックボックス
- **Toast**: 通知メッセージ

他にも `Badge`, `Alert`, `Tabs`, `Switch` など多数あります。詳しくは [shadcn/ui ドキュメント](https://ui.shadcn.com/docs/components) を参照してください。

---

## 🖼 素材・アセットの利用 (Assets & Media)

### アイコン (`lucide-react`)

[Lucide Icons](https://lucide.dev/icons) からアイコンを選んで使えます。

```tsx
import { Camera, Home, Settings } from 'lucide-react';

<Camera className="w-6 h-6 text-gray-500" />

```

⬇️ここも良さそう

https://phosphoricons.com/

Reactで使えるアイコン素材提供してるサイト探せば色々出てくると思うので思ってたのと違う…ってなったら探してみるといいかも

### 画像の表示

画像ファイルは `src/assets/img` フォルダに配置してください。

**ディレクトリ構成:**
```
src/
└── assets/
    └── img/         # ここに画像ファイルを置く
        └── logo.png
```

```tsx
import logoParams from '@/assets/img/logo.png';

<img src={logoParams} alt="ロゴ" className="w-32" />

```

https://zenn.dev/kiriyama/articles/20480ad223d36e#%E7%94%BB%E5%83%8F%E3%82%92%E8%A1%A8%E7%A4%BA%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95

### 効果音を鳴らす (`use-sound`)

効果音ファイルは `src/assets/sounds` フォルダに配置してください。

**ディレクトリ構成:**
```
src/
└── assets/
    └── sounds/      # ここにmp3やwavファイルを置く
        ├── alert.mp3
        └── success.mp3
```

Reactで効果音を扱う場合、[use-sound](https://github.com/joshwcomeau/use-sound) ライブラリを使うのが便利です。

まずはインストールします。

```bash
npm install use-sound
```

使い方は以下の通りです。

```tsx
import useSound from 'use-sound';
import soundFile from '@/assets/sounds/alert.mp3';

const Component = () => {
  // play関数を取り出す
  const [play] = useSound(soundFile);

  return (
    <button onClick={() => play()}>
      音を鳴らす
    </button>
  );
};
```

`volume` オプションで音量を調整したり、`onend` で再生終了時の処理を書くこともできます。

```tsx
const [play] = useSound(soundFile, { volume: 0.5 });
```

---

## 🛠 便利なコマンド集

開発時によく使うコマンドです。

### サーバー起動 (ホットリロード有効)

```bash
npm run dev
```

### 依存パッケージのインストール

`package.json` に記載されているパッケージを一括インストールします。

```bash
npm install
```

特定のパッケージを追加する場合：

```bash
npm install [パッケージ名]
# 例: npm install use-sound
```

### ビルド (本番用ファイルの生成)

`dist` フォルダに最適化されたファイルが生成されます。

```bash
npm run build
```

### ビルド結果のプレビュー

ビルドされたアプリケーションをローカルで確認します。

```bash
npm run preview
```

### shadcn/ui コンポーネントの追加

必要なUIパーツを個別にインストールします。

```bash
npx shadcn@latest add [コンポーネント名]
# 例: npx shadcn@latest add button input
```
