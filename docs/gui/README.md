# SimpleVault GUI要件定義

このドキュメントでは、SimpleVaultスマートコントラクトを操作するためのGUIの要件・設計をまとめます。

## 目的
- ユーザーがWebブラウザ上でVaultへの預け入れ・引き出し・残高確認を直感的に行えるようにする。

## 機能要件
1. ウォレット接続（Phantom等のSolanaウォレット）
2. SPLトークンの預け入れ（Deposit）
3. SPLトークンの引き出し（Withdraw）
4. 残高確認（Query Balance）
5. トランザクション履歴表示（任意）

## 非機能要件
- Anchorでデプロイしたプログラムと連携する。
- モダンなUI/UX（React, Next.js等を想定）
- Solana devnet対応

## ディレクトリ構成
```
gui/
├── README.md
├── package.json          # フロントエンド依存関係
├── public/               # 静的ファイル（画像・favicon等）
├── src/
│   ├── components/       # UIコンポーネント
│   │   ├── DepositForm.tsx      # 預け入れフォーム
│   │   ├── WithdrawForm.tsx     # 引き出しフォーム
│   │   ├── BalanceDisplay.tsx   # 残高表示
│   │   └── WalletConnect.tsx    # ウォレット接続
│   ├── pages/           # ルーティングページ
│   │   └── index.tsx    # メインページ
│   ├── hooks/           # カスタムフック（Solana/Anchor連携等）
│   └── utils/           # ユーティリティ関数
```

## 主要コンポーネント・ファイル詳細
- `components/DepositForm.tsx`：SPLトークンの預け入れフォーム。Vaultへトークンを送信するトランザクションを発行。
- `components/WithdrawForm.tsx`：預け入れたトークンの引き出しフォーム。Vaultからトークンを引き出すトランザクションを発行。
- `components/BalanceDisplay.tsx`：現在のVault残高を表示。
- `components/WalletConnect.tsx`：Phantom等のSolanaウォレット接続UI。
- `pages/index.tsx`：トップページ。各機能の統合表示。
- `hooks/`：Solana/Anchor連携やトークン残高取得等のカスタムフック群。
- `utils/`：アドレス変換やエラーハンドリング等のユーティリティ関数。
- `public/`：ロゴ・画像・favicon等の静的ファイル。

## 補足
- UIはReact/Next.jsを想定。
- Solana Wallet Adapterを利用し、複数ウォレット対応も検討。
- テストや型定義も適宜追加。
