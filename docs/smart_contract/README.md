# SimpleVault スマートコントラクト要件定義

このドキュメントでは、Anchorを用いたSolanaスマートコントラクト（SimpleVault）の要件・設計をまとめます。

## 目的
- SPLトークンの預け入れ（Deposit）・引き出し（Withdraw）・残高確認（Query Balance）ができるVaultを実装する。

## 機能要件
1. ユーザーは任意のSPLトークンをVaultに預け入れできる。
2. 預け入れたトークンはユーザーごとに管理される。
3. ユーザーは自身の預け入れたトークンを引き出せる。
4. ユーザーは自身のVault残高を確認できる。

## 非機能要件
- Anchorフレームワークを利用する。
- Rustで実装する。
- Solana devnetで動作確認可能とする。

## ディレクトリ構成
```
programs/
└── simple_vault/
    ├── Cargo.toml
    └── src/
        └── lib.rs
```

## 参考
- Anchor公式ドキュメント
- SPL Tokenライブラリ
