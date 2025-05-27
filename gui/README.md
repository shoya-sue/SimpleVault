# SimpleVault GUI

このディレクトリは、SimpleVaultプロジェクトのフロントエンド（GUI）アプリケーションのソースコードと設計資料を格納します。

## 目的

- ユーザーがWebブラウザ上でSolana上のSimpleVaultスマートコントラクトを直感的に操作できるようにする。

## 主な機能

1. Solanaウォレット（Phantom等）接続
2. SPLトークンの預け入れ（Deposit）
3. SPLトークンの引き出し（Withdraw）
4. 残高確認（Query Balance）
5. トランザクション履歴表示（任意）

## 技術スタック

- React / Next.js
- Solana Wallet Adapter
- TypeScript

## ディレクトリ構成

```
gui/
├── README.md
├── Dockerfile
├── docker-compose.yml
├── package.json
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── utils/
```

## Dockerによる開発環境構築

1. `Dockerfile` と `docker-compose.yml` を用意しています。
2. 以下のコマンドで開発用サーバを起動できます。

```sh
docker-compose up --build
```

- ポート番号や環境変数は `docker-compose.yml` で調整してください。
- バックエンド（smart_contract）は別コンテナで起動してください。

## 備考

- UI/UXはモダンな設計を目指します。
- Solana devnetでの動作を前提としています。
- 詳細な設計・仕様は `docs/` 配下の資料も参照してください。
