# SimpleVault

SimpleVaultはSolanaブロックチェーン上で動作するSPLトークンのためのシンプルな金庫（バリデーション）システムです。ユーザーはトークンを預け入れ、引き出し、残高を確認することができます。

## 機能

- **初期化**: 新しい金庫アカウントの作成
- **預け入れ**: SPLトークンを金庫に預ける
- **引き出し**: SPLトークンを金庫から引き出す
- **残高確認**: 金庫内のトークン残高を確認
- **タイムロック**: 指定した期間、金庫からの引き出しをロックする機能
- **権限委任**: 金庫の所有者が他のアドレスに操作権限を委任できる機能
- **多重署名**: 複数の署名者が承認した場合のみ引き出しを許可する機能

## プロジェクト構成

```
simple_vault/
├── Anchor.toml          # Anchorの設定ファイル
├── Cargo.toml           # ワークスペースの設定
├── programs/            # プログラムコード
│   └── simple_vault/    # Solanaプログラム
│       ├── Cargo.toml   # プログラムの依存関係
│       └── src/         # ソースコード
│           └── lib.rs   # プログラムロジック
└── tests/               # テストスクリプト
    └── simple_vault.js  # テストコード
```

## 開発環境のセットアップ

### 必要なツール

- Solana CLI
- Rust
- Node.js & npm/yarn
- Anchor Framework

### インストール手順

1. **Solana CLI**のインストール:
   ```
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```

2. **Rust**のインストール:
   ```
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Anchor Framework**のインストール:
   ```
   npm install -g @coral-xyz/anchor-cli
   ```

## ビルド手順

1. プロジェクトのルートディレクトリで以下のコマンドを実行:
   ```
   yarn install
   anchor build
   ```

## テスト実行

1. ローカルのSolanaバリデータを起動:
   ```
   solana-test-validator
   ```

2. 別のターミナルでテストを実行:
   ```
   anchor test
   ```

## デプロイ手順

1. Solanaネットワークを設定:
   ```
   solana config set --url <ネットワークURL>
   ```

2. デプロイを実行:
   ```
   anchor deploy
   ```

## 使用例

```javascript
// プログラム初期化
await program.methods
  .initialize()
  .accounts({
    // 必要なアカウント情報
  })
  .signers([ownerKeypair])
  .rpc();

// トークン預け入れ
await program.methods
  .deposit(new BN(1000000))
  .accounts({
    // 必要なアカウント情報
  })
  .signers([ownerKeypair])
  .rpc();

// 残高確認
const balance = await program.methods
  .queryBalance()
  .accounts({
    // 必要なアカウント情報
  })
  .view();

// タイムロック設定（60秒間ロック）
await program.methods
  .setTimelock(new BN(60))
  .accounts({
    vault: vaultPDA,
    owner: ownerKeypair.publicKey,
  })
  .signers([ownerKeypair])
  .rpc();

// 委任者の追加
await program.methods
  .addDelegate(delegatePublicKey)
  .accounts({
    vault: vaultPDA,
    owner: ownerKeypair.publicKey,
  })
  .signers([ownerKeypair])
  .rpc();

// 委任者の削除
await program.methods
  .removeDelegate(delegatePublicKey)
  .accounts({
    vault: vaultPDA,
    owner: ownerKeypair.publicKey,
  })
  .signers([ownerKeypair])
  .rpc();

// 多重署名の設定（2人の署名が必要）
await program.methods
  .setMultisig(2, [signer1PublicKey, signer2PublicKey])
  .accounts({
    vault: vaultPDA,
    owner: ownerKeypair.publicKey,
  })
  .signers([ownerKeypair])
  .rpc();

// 多重署名モードでの引き出し申請
// これはトランザクションを実行せず、保留中のトランザクションを作成します
await program.methods
  .withdraw(new BN(500000))
  .accounts({
    // 必要なアカウント情報
  })
  .signers([ownerKeypair])
  .rpc();

// 別の署名者がトランザクションを承認
// 必要な署名数に達すると実際の引き出しが実行されます
await program.methods
  .approveTransaction(new BN(0)) // トランザクションID
  .accounts({
    vault: vaultPDA,
    vaultTokenAccount: vaultTokenAccount.publicKey,
    destinationTokenAccount: userTokenAccount,
    signer: signer1PublicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([signer1Keypair])
  .rpc();

// 通常モードでのトークン引き出し（タイムロック期間終了後のみ可能、所有者または委任者が実行可能）
await program.methods
  .withdraw(new BN(500000))
  .accounts({
    // 必要なアカウント情報
  })
  .signers([ownerKeypair]) // または委任者のキーペア
  .rpc();
```

## ライセンス

MITライセンス
