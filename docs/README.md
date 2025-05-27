# docs ディレクトリ

このディレクトリは、SimpleVaultプロジェクトの要件定義や設計資料を格納します。

## ディレクトリ構成

- `smart_contract/` : Anchorを用いたSolanaスマートコントラクトの要件・設計資料
- `gui/` : スマートコントラクトを操作するGUIの要件・設計資料

各ディレクトリには詳細なREADME.mdと、Dockerによる開発環境構築手順を記載しています。

## Docker構成方針

- `smart_contract`（Rust/Anchor/Solana CLI）と`gui`（React/Next.js）はDockerコンテナを分離し、独立して開発・起動できるようにしています。
- 必要に応じてプロジェクトルートに統合用docker-compose.ymlを追加し、両サービスを一括起動することも可能です。

詳細は各ディレクトリのREADME.mdを参照してください。
