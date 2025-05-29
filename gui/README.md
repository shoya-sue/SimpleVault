# SimpleVault GUI

このディレクトリは、SimpleVaultプロジェクトのフロントエンド（GUI）アプリケーションのソースコードを格納します。

## 主な機能

### 基本機能
1. Solanaウォレット（Phantom等）接続
2. SPLトークンの預け入れ（Deposit）
3. SPLトークンの引き出し（Withdraw）
4. 残高確認（Query Balance）
5. SPLトークンのミント（開発・テスト用）
6. Vaultの初期化（金庫の作成）

### 拡張機能（スマートコントラクト対応）
1. タイムロック設定 - 指定した期間までVaultをロック
2. マルチシグ設定 - 複数の署名者による承認が必要なトランザクション
3. 委任者管理 - 特定のアドレスに引き出し権限を委任
4. 出金制限設定 - 一度に引き出せる最大金額を制限
5. 所有権移転 - Vaultの所有権を別のアドレスに移転
6. 保留中トランザクション管理 - マルチシグの承認待ちトランザクション管理

### UI/UX機能
1. ダークモード対応 - ユーザー設定に応じたテーマ切り替え
2. レスポンシブデザイン - モバイルからデスクトップまで対応
3. タブインターフェース - 基本機能と拡張機能を整理
4. エラーハンドリング - わかりやすいエラーメッセージ表示
5. ローディング表示 - 処理中の状態を視覚的に表示
6. Vault初期化状態の検出 - 基本機能と拡張機能間で初期化状態を共有

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
│   │   ├── DarkModeToggle.tsx     # ダークモード切替
│   │   ├── DelegateManager.tsx    # 委任者管理
│   │   ├── DepositForm.tsx        # 預け入れフォーム
│   │   ├── ErrorMessage.tsx       # エラーメッセージ
│   │   ├── LoadingIndicator.tsx   # ローディング表示
│   │   ├── MultisigManager.tsx    # マルチシグ設定
│   │   ├── OwnershipTransfer.tsx  # 所有権移転
│   │   ├── PendingTransactions.tsx # 保留中トランザクション
│   │   ├── TimelockForm.tsx       # タイムロック設定
│   │   ├── TokenMinter.tsx        # トークンミンター
│   │   ├── TransactionHistory.tsx # 取引履歴
│   │   ├── VaultInitializer.tsx   # 金庫初期化
│   │   ├── WalletConnect.tsx      # ウォレット接続
│   │   ├── WithdrawForm.tsx       # 引き出しフォーム
│   │   └── WithdrawalLimitSetting.tsx # 出金制限設定
│   ├── hooks/             # カスタムフック
│   │   ├── useDarkMode.ts         # ダークモード管理
│   │   ├── useMediaQuery.ts       # レスポンシブ対応
│   │   ├── useSimpleVault.ts      # SimpleVault操作フック
│   │   ├── useTokenAccount.ts     # トークンアカウント管理
│   │   ├── useTokenMint.ts        # トークンミント機能
│   │   └── useVault.ts            # Vault操作機能
│   ├── idl/               # Anchorプログラム定義
│   │   └── simple_vault.json      # SimpleVaultプログラムIDL
│   ├── pages/             # ページコンポーネント
│   │   ├── _app.tsx              # アプリルート
│   │   └── index.tsx             # ホームページ
│   ├── styles/            # スタイル定義
│   │   └── globals.css           # グローバルスタイル
│   └── utils/             # ユーティリティ
│       ├── anchor-client.ts      # Anchorクライアント関数
│       ├── constants.ts          # 定数定義
│       ├── format.ts             # フォーマット関数
│       ├── validation.ts         # 入力検証
│       └── wallet-adapter.tsx    # ウォレットアダプタ設定
├── .gitignore             # Git除外設定
├── .npmrc                 # npm設定
├── jest.config.js         # Jestテスト設定
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

## テスト実行

1. 単体テストの実行
   ```bash
   npm test
   # または
   yarn test
   ```

2. 特定のテストファイルのみ実行
   ```bash
   npm test -- -t "ErrorMessage"
   # または
   yarn test -t "ErrorMessage"
   ```

## 注意事項

- TypeScriptの型エラーは依存関係をインストールすると解消されます
- 開発環境では `.npmrc` ファイルの設定により依存関係の互換性問題を解決しています
- ダークモード設定はローカルストレージに保存され、次回訪問時も維持されます

## プログラムデプロイ

このGUIはSolana devnetにデプロイされたSimpleVaultスマートコントラクトと連携します。
デプロイされたプログラムIDは `src/utils/anchor-client.ts` に設定されています。

```typescript
// SimpleVaultプログラムID（デプロイ後の実際のIDに置き換える）
export const PROGRAM_ID = new PublicKey('GGCcGkcUoT1oCbPxkHrxpHDkLDrb9TYN8Hx2ffAEYLaQ');
```

## 新機能の使い方

### SPLトークンミンター
開発・テスト用にSPLトークンを簡単に作成できます。「トークンミントを作成」ボタンでミントアドレスを生成し、「トークンをミント」ボタンで任意の数量のトークンを発行できます。

### 金庫初期化
Vaultを使用する前に、「金庫を初期化」ボタンで金庫アカウントを作成します。この初期化は一度だけ行う必要があります。

### トークンの預け入れと引き出し
金庫を初期化した後、トークンの預け入れと引き出しが可能になります。金額を入力して「預け入れ」または「引き出し」ボタンをクリックします。

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
