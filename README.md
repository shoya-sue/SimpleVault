### Anchor学習用スマートコントラクト

#### スマートコントラクト名

**SimpleVault**（シンプル預け入れボールト）

#### 概要

ユーザーが特定のSPLトークンを預け入れ（deposit）し、引き出し（withdraw）できるシンプルなVaultを作成します。このスマートコントラクトを通じて、AnchorとRustの基本的な概念、Solanaプログラムのデプロイ方法、トランザクションの署名・検証方法を学びます。

#### 機能

1. **Deposit（預け入れ）**

   * 指定されたトークンをユーザーからVaultアカウントへ預け入れる。

2. **Withdraw（引き出し）**

   * ユーザーがVaultに預け入れたトークンを引き出す。

3. **Query Balance（残高確認）**

   * ユーザーの預け入れ残高を確認する。

#### ディレクトリ構造例

```
SimpleVault/
├── Anchor.toml               # Anchorの設定ファイル
├── Cargo.toml                # Rustプロジェクトの依存関係
├── programs/                 # スマートコントラクト（プログラム）本体
│   └── simple_vault/
│       ├── Cargo.toml        # プログラム依存関係
│       └── src/
│           └── lib.rs        # Rustコード本体
├── tests/                    # テスト用コード
│   └── simple_vault_test.js
├── migrations/               # デプロイスクリプト
│   └── deploy.js
├── .gitignore                # Git管理対象外設定
└── README.md                 # プロジェクトの説明
```

#### 使用する技術

* **Anchor**（スマートコントラクトフレームワーク）
* **Rust**（プログラミング言語）
* **SPL Tokenライブラリ**（トークン操作）

#### 学習でカバーする範囲

* Rustの環境構築（rustup, cargo, toolchainの設定）
* Anchor CLIのセットアップと使い方
* Anchorプロジェクトの構成・デプロイ（devnet）
* Solana CLIを使ったdevnetでのテストトランザクション
* Anchorによるプログラムアカウント、インストラクション、エラー処理の理解

#### 学習目標

* Anchorを利用したSolanaスマートコントラクト開発フローを把握する。
* Rustでのスマートコントラクト記述に慣れる。
* 実際のSolanaネットワーク（devnet）上でプログラムの動作を確認できるようになる。
