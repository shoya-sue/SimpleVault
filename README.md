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
├── docs/                     # ドキュメント・要件定義
│   ├── README.md             # ドキュメント全体の説明
│   ├── smart_contract/       # スマートコントラクト要件
│   │   └── README.md
│   └── gui/                  # GUI要件
│       └── README.md
├── gui/                      # フロントエンド（GUI）本体
│   ├── README.md
│   ├── package.json          # フロントエンド依存関係
│   ├── public/               # 静的ファイル（画像・favicon等）
│   └── src/                  # ソースコード
│       ├── components/       # UIコンポーネント
│       │   ├── DepositForm.tsx      # 預け入れフォーム
│       │   ├── WithdrawForm.tsx     # 引き出しフォーム
│       │   ├── BalanceDisplay.tsx   # 残高表示
│       │   └── WalletConnect.tsx    # ウォレット接続
│       ├── pages/           # ルーティングページ
│       │   └── index.tsx    # メインページ
│       ├── hooks/           # カスタムフック（Solana/Anchor連携等）
│       └── utils/           # ユーティリティ関数
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

#### 参考資料
- https://learn.blueshift.gg/en/courses/anchor-vault/lesson
- https://www.anchor-lang.com/docs
- https://solana.com/ja/docs/intro/installation
- https://note.com/standenglish/n/n5bc42d6fd5e4

# SimpleVault

Solanaブロックチェーン上で動作するSPLトークンのための金庫（バリデーション）システムです。

## プロジェクト構成

- `smart_contract/` - Solanaスマートコントラクト（Anchor Framework）
- `gui/` - フロントエンドアプリケーション
- `docs/` - 詳細なドキュメント

## プロジェクトのクリーンアップ

プロジェクトには以下の不要なディレクトリが含まれています：

- `smart_contract/simple_vault/` - 内容はすべて `smart_contract/` に移動済み
- `smart_contract/app/` - 空のディレクトリ
- `smart_contract/node_modules/` - ビルド時に再生成されるため削除可能
- `smart_contract/target/` - ビルド成果物のため削除可能

### Windows環境でのクリーンアップ

```batch
rmdir /s /q "smart_contract\simple_vault"
rmdir /s /q "smart_contract\app"
rmdir /s /q "smart_contract\node_modules"
rmdir /s /q "smart_contract\target"
```

### Unix環境でのクリーンアップ

```bash
rm -rf smart_contract/simple_vault
rm -rf smart_contract/app
rm -rf smart_contract/node_modules
rm -rf smart_contract/target
```

## スマートコントラクト

詳細な情報は [smart_contract/README.md](smart_contract/README.md) を参照してください。

## フロントエンド

詳細な情報は [gui/README.md](gui/README.md) を参照してください。
