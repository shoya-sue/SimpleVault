# SimpleVault スマートコントラクト

このディレクトリは、Anchorを用いたSolanaスマートコントラクト（SimpleVault）のソースコードと設計資料を格納します。

## 目的

- SPLトークンの預け入れ（Deposit）・引き出し（Withdraw）・残高確認（Query Balance）ができるVaultを実装する。

## 主な機能

1. ユーザーは任意のSPLトークンをVaultに預け入れできる。
2. 預け入れたトークンはユーザーごとに管理される。
3. ユーザーは自身の預け入れたトークンを引き出せる。
4. ユーザーは自身のVault残高を確認できる。

## 技術スタック

- Rust
- Anchorフレームワーク
- Solana devnet

## ディレクトリ構成

```text
smart_contract/
├── README.md
├── Dockerfile
├── docker-compose.yml
├── programs/
│   └── simple_vault/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
```

## Dockerによる開発環境構築

1. `Dockerfile` と `docker-compose.yml` を用意しています。
2. 以下のコマンドでAnchor開発環境を起動できます。

```sh
docker-compose up --build
```

- プロジェクトルートが `/workdir` にマウントされます。
- Solana CLI, Anchor, Rustが利用可能です。
- GUI（フロントエンド）は別コンテナで起動してください。

## 参考

- Anchor公式ドキュメント
- SPL Tokenライブラリ
- 詳細な設計・仕様は `docs/` 配下の資料も参照してください。
