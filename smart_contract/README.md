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
- **引き出し制限**: 1回の取引で引き出せる最大金額を制限する機能
- **所有権譲渡**: 金庫の所有権を別のアドレスに譲渡する機能

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

## API仕様

### 初期化 (`initialize`)

新しい金庫アカウントを作成します。

**引数**:
- なし

**アカウント**:
- `vault`: 金庫アカウント (PDA)
- `vaultTokenAccount`: 金庫のトークンアカウント
- `mint`: トークンのミントアドレス
- `owner`: 金庫の所有者
- `tokenProgram`: SPLトークンプログラム
- `systemProgram`: システムプログラム
- `rent`: レント

### 預け入れ (`deposit`)

金庫にトークンを預け入れます。

**引数**:
- `amount`: 預け入れるトークン量

**アカウント**:
- `vault`: 金庫アカウント
- `vaultTokenAccount`: 金庫のトークンアカウント
- `userTokenAccount`: ユーザーのトークンアカウント
- `owner`: ユーザー（署名者）
- `tokenProgram`: SPLトークンプログラム

### 引き出し (`withdraw`)

金庫からトークンを引き出します。多重署名が設定されている場合は、保留中のトランザクションを作成します。

**引数**:
- `amount`: 引き出すトークン量

**アカウント**:
- `vault`: 金庫アカウント
- `vaultTokenAccount`: 金庫のトークンアカウント
- `userTokenAccount`: ユーザーのトークンアカウント
- `owner`: 所有者または委任者（署名者）
- `tokenProgram`: SPLトークンプログラム

### 残高確認 (`queryBalance`)

金庫内のトークン残高を確認します。

**引数**:
- なし

**アカウント**:
- `vault`: 金庫アカウント
- `tokenAccount`: 金庫のトークンアカウント

### タイムロック設定 (`setTimelock`)

金庫に一定期間のロックをかけます。

**引数**:
- `lockDuration`: ロック期間（秒）

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

### 委任者の追加 (`addDelegate`)

金庫の操作権限を他のアドレスに委任します。

**引数**:
- `delegate`: 委任するアドレス

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

### 委任者の削除 (`removeDelegate`)

委任した操作権限を削除します。

**引数**:
- `delegate`: 削除する委任アドレス

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

### 多重署名の設定 (`setMultisig`)

複数の署名者が必要な多重署名設定を行います。

**引数**:
- `threshold`: 必要な署名者数
- `signers`: 署名者のアドレスリスト

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

### トランザクション承認 (`approveTransaction`)

保留中のトランザクションを承認します。必要な署名数に達すると実行されます。

**引数**:
- `txId`: トランザクションID

**アカウント**:
- `vault`: 金庫アカウント
- `vaultTokenAccount`: 金庫のトークンアカウント
- `destinationTokenAccount`: 宛先のトークンアカウント
- `signer`: 署名者
- `tokenProgram`: SPLトークンプログラム

### 引き出し制限の設定 (`setWithdrawalLimit`)

1回の取引で引き出せる最大金額を設定します。

**引数**:
- `limit`: 最大引き出し可能額

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

### 所有権譲渡の開始 (`initiateOwnershipTransfer`)

金庫の所有権を別のアドレスに譲渡する手続きを開始します。

**引数**:
- `newOwner`: 新しい所有者のアドレス

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 現在の所有者（署名者）

### 所有権譲渡の承認 (`acceptOwnership`)

所有権譲渡を承認します。新しい所有者が実行する必要があります。

**引数**:
- なし

**アカウント**:
- `vault`: 金庫アカウント
- `newOwner`: 新しい所有者（署名者）

### 所有権譲渡のキャンセル (`cancelOwnershipTransfer`)

進行中の所有権譲渡をキャンセルします。

**引数**:
- なし

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 現在の所有者（署名者）

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

// 引き出し制限の設定（最大500,000トークン）
await program.methods
  .setWithdrawalLimit(new BN(500000))
  .accounts({
    vault: vaultPDA,
    owner: ownerKeypair.publicKey,
  })
  .signers([ownerKeypair])
  .rpc();

// 所有権譲渡の開始
await program.methods
  .initiateOwnershipTransfer(newOwnerPublicKey)
  .accounts({
    vault: vaultPDA,
    owner: ownerKeypair.publicKey,
  })
  .signers([ownerKeypair])
  .rpc();

// 所有権譲渡の承認（新しい所有者が実行）
await program.methods
  .acceptOwnership()
  .accounts({
    vault: vaultPDA,
    newOwner: newOwnerKeypair.publicKey,
  })
  .signers([newOwnerKeypair])
  .rpc();

// 所有権譲渡のキャンセル
await program.methods
  .cancelOwnershipTransfer()
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

## セキュリティ考慮事項

1. **タイムロック**：重要な資金の移動を遅延させることで、不正な引き出しに対する保護を提供します。
2. **権限委任**：所有者以外のアドレスにも操作権限を与えることで、柔軟なアクセス制御が可能になります。
3. **多重署名**：複数の署名者が必要な設定により、単一アカウントの侵害に対する保護層を追加します。
4. **引き出し制限**：1回の取引で引き出せる金額を制限することで、不正な大量引き出しのリスクを軽減します。
5. **所有権譲渡**：金庫の所有権を二段階（開始と承認）で譲渡することで、誤送信のリスクを軽減します。

## ライセンス

MITライセンス
