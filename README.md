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

SimpleVaultは、Solanaブロックチェーン上で動作するSPLトークン管理アプリケーションです。このアプリケーションを使用すると、SOLの預け入れ・引き出し、SPLトークンのミント、残高確認、トランザクション履歴の表示が可能です。

## 主な機能

- **SOL預け入れ/引き出し**: ウォレットからVaultへのSOL送金と引き出し
- **SPLトークンミント**: 新しいSPLトークンの作成とミント
- **トランザクション履歴**: Vaultに関連するトランザクション履歴の表示
- **自動トークンアカウント作成**: 初回利用時にトークンアカウントを自動作成
- **ダークモード対応**: ライト/ダークモードの切り替え
- **レスポンシブデザイン**: モバイル端末からも快適に利用可能

## 技術スタック

- **フロントエンド**: Next.js + React + TypeScript
- **スタイリング**: TailwindCSS
- **ブロックチェーン接続**: Solana Web3.js, Wallet Adapter
- **テスト**: Jest + React Testing Library

## 開発環境のセットアップ

### 前提条件

- Node.js 16.x以上
- npm 7.x以上
- Solanaウォレット (Phantom, Solflare等)

### インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/yourusername/SimpleVault.git
cd SimpleVault
```

2. 依存関係をインストール:
```bash
# GUIの依存関係をインストール
cd gui
npm install
```

3. 開発サーバーを起動:
```bash
npm run dev
```

4. ブラウザで http://localhost:3000 にアクセス

## テスト

単体テストを実行するには:

```bash
cd gui
npm test
```

## ビルドと本番環境へのデプロイ

静的ファイルをビルドするには:

```bash
cd gui
npm run build
```

ビルドされたファイルは `gui/out` ディレクトリに出力されます。

## ライセンス

MIT

## 謝辞

- Solanaチームとコミュニティ
- 各種ライブラリの開発者
