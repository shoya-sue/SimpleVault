# SimpleVault GUI

このディレクトリは、SimpleVaultプロジェクトのフロントエンド（GUI）アプリケーションのソースコードを格納します。

## 主な機能

1. Solanaウォレット（Phantom等）接続
2. SPLトークンの預け入れ（Deposit）
3. SPLトークンの引き出し（Withdraw）
4. 残高確認（Query Balance）

## 技術スタック

- React / Next.js
- TypeScript
- Tailwind CSS
- Solana Web3.js
- Solana Wallet Adapter
- Anchor Framework

## ディレクトリ構成

```
gui/
├── public/                # 静的ファイル
│   └── favicon.ico        # サイトアイコン
├── src/
│   ├── components/        # UIコンポーネント
│   │   ├── BalanceDisplay.tsx   # 残高表示
│   │   ├── DepositForm.tsx      # 預け入れフォーム
│   │   ├── WalletConnect.tsx    # ウォレット接続
│   │   └── WithdrawForm.tsx     # 引き出しフォーム
│   ├── hooks/             # カスタムフック
│   │   └── useVault.ts    # Vaultとの連携
│   ├── pages/             # ページコンポーネント
│   │   ├── _app.tsx       # アプリルート
│   │   └── index.tsx      # ホームページ
│   ├── styles/            # スタイル定義
│   │   └── globals.css    # グローバルスタイル
│   └── utils/             # ユーティリティ
│       └── constants.ts   # 定数定義
├── .gitignore             # Git除外設定
├── .npmrc                 # npm設定
├── next-env.d.ts          # Next.js型定義
├── package.json           # 依存関係定義
├── postcss.config.js      # PostCSS設定
├── tailwind.config.js     # Tailwind CSS設定
└── tsconfig.json          # TypeScript設定
```

## セットアップ手順

1. 必要なパッケージをインストール
   ```bash
   npm install
   # または
   yarn
   ```

2. 開発サーバーを起動
   ```bash
   npm run dev
   # または
   yarn dev
   ```

3. ブラウザで `http://localhost:3000` にアクセス

## 注意事項

- TypeScriptの型エラーは依存関係をインストールすると解消されます
- 開発環境では `.npmrc` ファイルの設定により依存関係の互換性問題を解決しています

## プログラムデプロイ

このGUIはSolana devnetにデプロイされたSimpleVaultスマートコントラクトと連携します。
デプロイされたプログラムIDは `src/utils/constants.ts` に設定されています。
