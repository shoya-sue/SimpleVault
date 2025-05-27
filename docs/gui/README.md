# SimpleVault GUI設計

## 概要
SimpleVault GUIはSolana上のSimpleVaultスマートコントラクトと連携するフロントエンドアプリケーションです。ユーザーはこのGUIを通じて、SPLトークンの預け入れ、引き出し、残高確認などの操作を行うことができます。

## 機能要件

### 1. ウォレット接続 (Wallet Connection)
- Phantom、Solflare、Slope等のSolanaウォレットと接続
- ウォレットの接続状態管理
- ウォレットの切断機能

### 2. 残高表示 (Balance Display)
- 接続されたウォレットのSOL残高表示
- 金庫内のSPLトークン残高表示
- リアルタイム更新

### 3. 預け入れフォーム (Deposit Form)
- 預け入れ金額の入力
- トークン種類の選択（複数トークン対応）
- トランザクション実行と結果表示

### 4. 引き出しフォーム (Withdraw Form)
- 引き出し金額の入力
- 最大引き出し額の表示
- トランザクション実行と結果表示

### 5. トランザクション履歴 (Transaction History)
- 過去の預け入れ/引き出し履歴の表示
- トランザクションの詳細情報へのリンク

## 技術仕様

### フロントエンド構成
- フレームワーク: React.js + Next.js
- スタイリング: Tailwind CSS または Chakra UI
- 状態管理: React Context APIまたはRedux

### Solana連携
- `@solana/web3.js` - Solanaブロックチェーンとの通信
- `@solana/wallet-adapter` - ウォレット接続管理
- `@coral-xyz/anchor` - Anchorプログラムとの連携

### デザイン要素
- ダークモード/ライトモード対応
- レスポンシブデザイン（モバイル対応）
- アクセシビリティ考慮

## ユーザーフロー

1. ウェブサイトアクセス
2. ウォレット接続
3. 残高確認
4. 預け入れまたは引き出し操作
5. トランザクション確認
6. 結果表示

## 開発環境

### 必要なツール
- Node.js
- npm/yarn
- Docker (オプション)

### セットアップ手順
1. リポジトリのクローン
2. 依存関係のインストール (`npm install` または `yarn`)
3. 開発サーバーの起動 (`npm run dev` または `yarn dev`)

## デプロイ戦略
- Vercel または Netlify を利用した自動デプロイ
- CI/CDパイプラインの構築
- テスト環境と本番環境の分離 