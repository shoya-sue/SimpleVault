# SimpleVault GUI

このディレクトリは、SimpleVaultプロジェクトのフロントエンド（GUI）アプリケーションのソースコードを格納します。

## 主な機能

### 基本機能
1. Solanaウォレット（Phantom等）接続
2. SPLトークンの預け入れ（Deposit）
3. SPLトークンの引き出し（Withdraw）
4. 残高確認（Query Balance）

### 拡張機能（スマートコントラクト対応）
1. タイムロック設定 - 指定した期間までVaultをロック
2. マルチシグ設定 - 複数の署名者による承認が必要なトランザクション
3. 委任者管理 - 特定のアドレスに引き出し権限を委任
4. 出金制限設定 - 一度に引き出せる最大金額を制限
5. 所有権移転 - Vaultの所有権を別のアドレスに移転
6. 保留中トランザクション管理 - マルチシグの承認待ちトランザクション管理

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
│   │   ├── BalanceDisplay.tsx     # 残高表示
│   │   ├── DelegateManager.tsx    # 委任者管理
│   │   ├── DepositForm.tsx        # 預け入れフォーム
│   │   ├── MultisigManager.tsx    # マルチシグ設定
│   │   ├── OwnershipTransfer.tsx  # 所有権移転
│   │   ├── PendingTransactions.tsx # 保留中トランザクション
│   │   ├── TimelockForm.tsx       # タイムロック設定
│   │   ├── WalletConnect.tsx      # ウォレット接続
│   │   ├── WithdrawForm.tsx       # 引き出しフォーム
│   │   └── WithdrawalLimitSetting.tsx # 出金制限設定
│   ├── hooks/             # カスタムフック
│   │   └── useVault.ts    # Vaultとの連携
│   ├── pages/             # ページコンポーネント
│   │   ├── _app.tsx       # アプリルート
│   │   └── index.tsx      # ホームページ
│   ├── styles/            # スタイル定義
│   │   └── globals.css    # グローバルスタイル
│   └── utils/             # ユーティリティ
│       ├── constants.ts   # 定数定義
│       └── idl.ts         # スマートコントラクトIDL
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

## 新機能の使い方

### タイムロック
タイムロック機能では、指定した期間が経過するまでVaultからの引き出しをロックすることができます。緊急時や不正アクセス防止に役立ちます。

### 委任者管理
委任者を追加することで、指定したアドレスに引き出し権限を委任できます。所有者以外にも限定的な操作権限を与えることが可能です。

### マルチシグ設定
マルチシグ機能では、トランザクション実行に必要な署名者数（閾値）と署名者を設定できます。複数人による承認が必要なセキュリティ強化に有効です。

### 出金制限
一度に引き出せる最大金額を設定することで、大量の資金流出リスクを軽減します。

### 所有権移転
Vaultの所有権を別のアドレスに移転する機能です。組織内での権限移譲などに使用できます。

### 保留中トランザクション
マルチシグが有効な場合、トランザクションは実行前に保留状態となり、必要な署名者数の承認を得ると実行されます。
