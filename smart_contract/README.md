# SimpleVault

SimpleVaultはSolanaブロックチェーン上で動作するSPLトークンのためのセキュアな金庫（バリデーション）システムです。ユーザーはトークンを預け入れ、引き出し、残高を確認するだけでなく、複数のセキュリティ機能を利用してトークンを安全に管理することができます。

## 主な機能

- **基本機能**
  - **初期化**: 新しい金庫アカウントの作成
  - **預け入れ**: SPLトークンを金庫に預ける
  - **引き出し**: SPLトークンを金庫から引き出す
  - **残高確認**: 金庫内のトークン残高を確認

- **セキュリティ機能**
  - **タイムロック**: 指定した期間、金庫からの引き出しをロックする機能
  - **権限委任**: 金庫の所有者が他のアドレスに操作権限を委任できる機能
  - **多重署名**: 複数の署名者が承認した場合のみ引き出しを許可する機能
  - **引き出し制限**: 1回の取引で引き出せる最大金額を制限する機能
  - **所有権譲渡**: 金庫の所有権を別のアドレスに譲渡する機能（二段階承認プロセス）

## 技術仕様

### アーキテクチャ

SimpleVaultは以下の技術コンポーネントで構成されています：

1. **Anchorフレームワーク**: Solanaスマートコントラクト開発のための高レベルフレームワーク
2. **SPLトークン**: Solanaのトークン標準規格
3. **PDA（Program Derived Address）**: 金庫アカウントを所有者のアドレスから派生して作成
4. **CPI（Cross-Program Invocation）**: トークンプログラムの呼び出しによるトークン転送

### セキュリティモデル

1. **タイムロック**
   - UNIXタイムスタンプを使用して金庫のロック期間を設定
   - ロック期間中は所有者であっても引き出し不可

2. **多重署名（マルチシグ）**
   - 閾値（threshold）を設定し、必要な署名数を定義
   - 保留中トランザクションの作成と承認プロセスの管理
   - 必要数の署名が集まると自動的に実行

3. **委任（Delegation）**
   - 委任されたアドレスは引き出し操作のみを実行可能
   - 所有者はいつでも委任を取り消し可能

4. **所有権譲渡（Ownership Transfer）**
   - 二段階の承認プロセスにより誤送信のリスクを軽減
   - 現所有者が譲渡を開始し、新所有者が明示的に承認する必要がある
   - 多重署名が設定されている場合は追加の承認が必要

### アカウント構造

1. **Vault（金庫）アカウント**
   ```rust
   pub struct Vault {
       pub owner: Pubkey,                         // 金庫の所有者
       pub token_account: Pubkey,                 // 金庫のトークンアカウント
       pub bump: u8,                              // PDAのバンプシード
       pub lock_until: u64,                       // タイムロック期限のUNIXタイムスタンプ
       pub delegates: Vec<Pubkey>,                // 委任されたアドレスのリスト
       pub multisig_threshold: u8,                // 必要な署名者数
       pub multisig_signers: Vec<Pubkey>,         // 追加の署名者リスト（所有者は含まない）
       pub pending_transactions: Vec<PendingTransaction>, // 保留中のトランザクション
       pub max_withdrawal_limit: u64,             // 最大引き出し可能金額
       pub transfer_ownership_to: Option<Pubkey>, // 所有権譲渡先
   }
   ```

2. **PendingTransaction（保留中トランザクション）構造体**
   ```rust
   pub struct PendingTransaction {
       pub id: u64,                        // トランザクションID
       pub transaction_type: TransactionType, // トランザクションの種類
       pub amount: u64,                    // 引き出し量（引き出しの場合）
       pub destination: Pubkey,            // 送金先（引き出しの場合）
       pub new_owner: Option<Pubkey>,      // 所有権譲渡先（TransferOwnershipの場合のみ使用）
       pub signers: Vec<Pubkey>,           // 署名者リスト
       pub executed: bool,                 // 実行済みフラグ
       pub created_at: u64,                // 作成時刻
   }
   ```

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

- Solana CLI v1.17.0以上
- Rust 1.70.0以上
- Node.js v14以上 & npm/yarn
- Anchor Framework v0.29.0以上

### インストール手順

1. **Solana CLI**のインストール:
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```
   動作確認
    ```bash
    solana --version
    ```

2. **Rust**のインストール:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
    動作確認
    ```bash
    rustc --version
    ```

3. **Anchor Framework**のインストール:
   ```
   npm install -g @coral-xyz/anchor-cli
   ```
    動作確認
    ```bash
    anchor --version
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
   ※ devnetなら不要

2. 別のターミナルでテストを実行:
   ```
   anchor test
   ```

## デプロイ手順

1. Solanaネットワークを設定:
   ```bash
   solana config set --url <ネットワークURL>
   solana config keypair set <キーペアファイル>
   ```
    例: `https://api.devnet.solana.com`, `~/.config/solana/id.json`
   ※ devnetを使用する場合は、事前にSOLを取得しておく必要があります。

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

**初期設定値**:
- `lock_until`: 0（デフォルトではロックなし）
- `delegates`: 空のベクター（デフォルトでは委任なし）
- `multisig_threshold`: 1（デフォルトでは単一署名）
- `multisig_signers`: 空のベクター（デフォルトでは追加の署名者なし）
- `pending_transactions`: 空のベクター（保留中のトランザクションなし）
- `max_withdrawal_limit`: u64::MAX（デフォルトでは制限なし）
- `transfer_ownership_to`: None（所有権譲渡先はなし）

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

**制約条件**:
- `userTokenAccount`の所有者が`owner`と一致すること
- `vaultTokenAccount`が金庫に登録されているアカウントと一致すること

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

**制約条件**:
- `owner`が金庫の所有者または委任者であること
- 現在時刻が`lock_until`を超えていること（タイムロック期間が終了していること）
- `amount`が`max_withdrawal_limit`以下であること
- 多重署名が設定されている場合（`multisig_threshold > 1`）は、保留中トランザクションが作成され、即時実行されない

### 残高確認 (`queryBalance`)

金庫内のトークン残高を確認します。

**引数**:
- なし

**アカウント**:
- `vault`: 金庫アカウント
- `tokenAccount`: 金庫のトークンアカウント

**戻り値**:
- `u64`: 金庫内のトークン残高

### タイムロック設定 (`setTimelock`)

金庫に一定期間のロックをかけます。

**引数**:
- `lockDuration`: ロック期間（秒）

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

**制約条件**:
- `owner`が金庫の所有者と一致すること

**動作詳細**:
- 現在のUNIXタイムスタンプに`lockDuration`を加算した値を`lock_until`に設定
- ロック期間中は引き出し操作ができなくなる

### 委任者の追加 (`addDelegate`)

金庫の操作権限を他のアドレスに委任します。

**引数**:
- `delegate`: 委任するアドレス

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

**制約条件**:
- `owner`が金庫の所有者と一致すること

**動作詳細**:
- 委任アドレスが既存のリストに含まれていない場合のみ追加
- 委任されたアドレスは引き出し操作を実行可能になる

### 委任者の削除 (`removeDelegate`)

委任した操作権限を削除します。

**引数**:
- `delegate`: 削除する委任アドレス

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

**制約条件**:
- `owner`が金庫の所有者と一致すること

**動作詳細**:
- 指定されたアドレスが委任リストに存在する場合、そのアドレスを削除

### 多重署名の設定 (`setMultisig`)

複数の署名者が必要な多重署名設定を行います。

**引数**:
- `threshold`: 必要な署名者数
- `signers`: 署名者のアドレスリスト

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

**制約条件**:
- `owner`が金庫の所有者と一致すること
- `threshold`が0より大きいこと
- `threshold`が署名者リストの長さ+1（所有者も含む）以下であること

**動作詳細**:
- 指定された閾値と署名者リストを金庫アカウントに設定
- 設定後は引き出しなどの重要な操作に複数の署名が必要になる

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

**制約条件**:
- `signer`が金庫の所有者または多重署名設定の署名者であること
- 指定された`txId`の保留中トランザクションが存在し、未実行であること

**動作詳細**:
- 署名者が保留中トランザクションの署名者リストに追加される
- 署名者数が閾値に達した場合：
  - 引き出し系トランザクションの場合は、引き出し制限を確認した上で実際のトークン転送を実行
  - 所有権譲渡の場合は、新しい所有者に所有権を移転し、委任リストをクリア

### 引き出し制限の設定 (`setWithdrawalLimit`)

1回の取引で引き出せる最大金額を設定します。

**引数**:
- `limit`: 最大引き出し可能額

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 金庫の所有者（署名者）

**制約条件**:
- `owner`が金庫の所有者と一致すること

**動作詳細**:
- 指定された上限値を金庫の`max_withdrawal_limit`に設定
- 設定後は、この上限を超える引き出しがエラーとなる

### 所有権譲渡の開始 (`initiateOwnershipTransfer`)

金庫の所有権を別のアドレスに譲渡する手続きを開始します。

**引数**:
- `newOwner`: 新しい所有者のアドレス

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 現在の所有者（署名者）

**制約条件**:
- `owner`が金庫の所有者と一致すること

**動作詳細**:
- 新しい所有者を`transfer_ownership_to`フィールドに設定
- 多重署名が有効な場合は、所有権譲渡のための保留中トランザクションも作成

### 所有権譲渡の承認 (`acceptOwnership`)

所有権譲渡を承認します。新しい所有者が実行する必要があります。

**引数**:
- なし

**アカウント**:
- `vault`: 金庫アカウント
- `newOwner`: 新しい所有者（署名者）

**制約条件**:
- `newOwner`が`transfer_ownership_to`に設定されている値と一致すること
- 所有権譲渡が保留中であること（`transfer_ownership_to`がNoneでないこと）

**動作詳細**:
- 多重署名が無効（`multisig_threshold <= 1`）の場合、所有権を即時に移転
- 所有権が移転された場合、委任リストはクリアされる

### 所有権譲渡のキャンセル (`cancelOwnershipTransfer`)

進行中の所有権譲渡をキャンセルします。

**引数**:
- なし

**アカウント**:
- `vault`: 金庫アカウント
- `owner`: 現在の所有者（署名者）

**制約条件**:
- `owner`が金庫の所有者と一致すること
- 所有権譲渡が保留中であること（`transfer_ownership_to`がNoneでないこと）

**動作詳細**:
- `transfer_ownership_to`フィールドをNoneに設定
- 未実行の所有権譲渡関連の保留中トランザクションを削除

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

## ユースケース

1. **個人の資産保管**：長期保有のトークンを安全に保管
2. **組織の資金管理**：複数の承認者が必要な組織の資金管理
3. **タイムロックされた資産**：特定の期間ロックされた資産（ベスティングなど）
4. **マルチシグウォレット**：複数の署名者による共同管理ウォレット
5. **遺言代替**：所有権譲渡機能を使った資産承継計画

## パフォーマンス考慮事項

1. **アカウントサイズ**：保留中トランザクションの数が増えるとアカウントサイズが大きくなる可能性があります
2. **処理コスト**：マルチシグトランザクションの承認プロセスは複数のトランザクションを必要とするため、コストが高くなる可能性があります
3. **ストレージコスト**：多数の委任者や多重署名者を設定すると、レント（ストレージコスト）が増加します

## 今後の拡張計画

1. **トークン種類の拡張**：複数種類のSPLトークンをサポート
2. **タイムロック機能の拡張**：特定の操作ごとに異なるタイムロックを設定可能に
3. **トランザクション履歴**：過去のトランザクション履歴の保存と参照機能
4. **承認ポリシーの柔軟化**：より複雑な承認ポリシー（例：特定の金額以上の場合のみマルチシグが必要など）
5. **UI開発**：金庫管理のためのウェブインターフェース

## ライセンス

MITライセンス

## 実際の使用方法

このスマートコントラクトを実際に使用するには、以下の手順に従ってください。

### 1. デプロイ後のProgram IDの確認

デプロイが完了したら、以下のコマンドでプログラムIDを確認できます：

```bash
solana address -k target/deploy/simple_vault-keypair.json
```

### 2. クライアントアプリケーションの作成

スマートコントラクトと通信するためのクライアントアプリケーションを作成します。以下はJavaScriptを使用した基本的な例です。

#### 基本的なセットアップ

```javascript
const anchor = require('@coral-xyz/anchor');
const { BN, Program } = anchor;
const { PublicKey, Keypair, SystemProgram } = anchor.web3;
const { TOKEN_PROGRAM_ID, Token } = require('@solana/spl-token');
const idl = require('./target/idl/simple_vault.json');

// 接続設定
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// プログラムID（デプロイ後に実際のIDに置き換えてください）
const programId = new PublicKey('GGCcGkcUoT1oCbPxkHrxpHDkLDrb9TYN8Hx2ffAEYLaQ');
const program = new Program(idl, programId, provider);

// ウォレット情報
const wallet = provider.wallet;
```

### 3. 金庫の初期化

まず、金庫を初期化する必要があります：

```javascript
async function initializeVault() {
  // ミントトークンを設定（既存のトークンを使用するか、新しいトークンを作成）
  const mint = await createMint(); // または既存のトークンミントアドレス
  
  // 金庫のPDAアドレス（シード: "vault", 所有者のパブリックキー）を取得
  const [vaultPDA, vaultBump] = await PublicKey.findProgramAddress(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    program.programId
  );
  
  // 金庫のトークンアカウントを作成するための空のKeypair
  const vaultTokenAccount = Keypair.generate();
  
  // 金庫を初期化
  await program.methods
    .initialize()
    .accounts({
      vault: vaultPDA,
      vaultTokenAccount: vaultTokenAccount.publicKey,
      mint: mint,
      owner: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([vaultTokenAccount])
    .rpc();
    
  console.log('金庫が初期化されました！');
  console.log('金庫アドレス:', vaultPDA.toString());
  console.log('金庫トークンアカウント:', vaultTokenAccount.publicKey.toString());
  
  return { vaultPDA, vaultTokenAccount, mint };
}

// 必要に応じてトークンミントを作成するヘルパー関数
async function createMint() {
  const mint = Keypair.generate();
  const lamports = await provider.connection.getMinimumBalanceForRentExemption(
    Token.getMintLen()
  );
  
  const tx = new anchor.web3.Transaction();
  
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: Token.getMintLen(),
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      6, // デシマル
      wallet.publicKey,
      null
    )
  );
  
  await provider.sendAndConfirm(tx, [mint]);
  console.log('新しいミントが作成されました:', mint.publicKey.toString());
  
  return mint.publicKey;
}
```

### 4. トークンの預け入れ

金庫にトークンを預け入れる例：

```javascript
async function depositTokens(vaultPDA, vaultTokenAccount, mint, amount) {
  // ユーザーのトークンアカウントを取得または作成
  const userTokenAccount = await getUserTokenAccount(mint);
  
  // 預け入れを実行
  await program.methods
    .deposit(new BN(amount))
    .accounts({
      vault: vaultPDA,
      vaultTokenAccount: vaultTokenAccount,
      userTokenAccount: userTokenAccount,
      owner: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
    
  console.log(`${amount}トークンを金庫に預け入れました`);
}

// ユーザーのトークンアカウントを取得または作成するヘルパー関数
async function getUserTokenAccount(mint) {
  const userTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    wallet.publicKey
  );
  
  // アカウントが存在するかチェック
  const accountInfo = await provider.connection.getAccountInfo(userTokenAccount);
  
  if (!accountInfo) {
    // 存在しない場合は作成
    const tx = new anchor.web3.Transaction();
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        userTokenAccount,
        wallet.publicKey,
        wallet.publicKey
      )
    );
    await provider.sendAndConfirm(tx, []);
  }
  
  return userTokenAccount;
}
```

### 5. 残高の確認

金庫内のトークン残高を確認する例：

```javascript
async function checkBalance(vaultPDA, vaultTokenAccount) {
  const balance = await program.methods
    .queryBalance()
    .accounts({
      vault: vaultPDA,
      tokenAccount: vaultTokenAccount,
    })
    .view();
    
  console.log('金庫の残高:', balance.toString());
  return balance;
}
```

### 6. トークンの引き出し

金庫からトークンを引き出す例：

```javascript
async function withdrawTokens(vaultPDA, vaultTokenAccount, mint, amount) {
  // ユーザーのトークンアカウントを取得または作成
  const userTokenAccount = await getUserTokenAccount(mint);
  
  // 引き出しを実行
  await program.methods
    .withdraw(new BN(amount))
    .accounts({
      vault: vaultPDA,
      vaultTokenAccount: vaultTokenAccount,
      userTokenAccount: userTokenAccount,
      owner: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
    
  console.log(`${amount}トークンを金庫から引き出しました`);
}
```

### 7. タイムロックの設定

金庫にタイムロックを設定する例：

```javascript
async function setTimelock(vaultPDA, lockDuration) {
  // タイムロック設定を実行（秒単位）
  await program.methods
    .setTimelock(new BN(lockDuration))
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
    
  console.log(`金庫を${lockDuration}秒間ロックしました`);
}
```

### 8. 委任者の追加

金庫に委任者を追加する例：

```javascript
async function addDelegate(vaultPDA, delegatePublicKey) {
  // 委任者追加を実行
  await program.methods
    .addDelegate(delegatePublicKey)
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
    
  console.log(`${delegatePublicKey.toString()}を委任者として追加しました`);
}
```

### 9. 多重署名の設定

多重署名を設定する例：

```javascript
async function setMultisig(vaultPDA, threshold, signers) {
  // 多重署名設定を実行
  await program.methods
    .setMultisig(threshold, signers)
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
    
  console.log(`多重署名設定を完了しました（閾値: ${threshold}）`);
}
```

### 10. トランザクションの承認（多重署名の場合）

多重署名モードでのトランザクション承認例：

```javascript
async function approveTransaction(vaultPDA, vaultTokenAccount, userTokenAccount, txId) {
  // トランザクション承認を実行
  await program.methods
    .approveTransaction(new BN(txId))
    .accounts({
      vault: vaultPDA,
      vaultTokenAccount: vaultTokenAccount,
      destinationTokenAccount: userTokenAccount,
      signer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
    
  console.log(`トランザクションID ${txId} を承認しました`);
}
```

### 使用例（メイン関数）

以下は、上記の関数を組み合わせた基本的な使用例です：

```javascript
async function main() {
  try {
    // 1. 金庫を初期化
    console.log("金庫を初期化中...");
    const { vaultPDA, vaultTokenAccount, mint } = await initializeVault();
    
    // 2. トークンを預け入れ（1000000単位）
    console.log("トークンを預け入れ中...");
    await depositTokens(vaultPDA, vaultTokenAccount.publicKey, mint, 1000000);
    
    // 3. 残高を確認
    console.log("残高を確認中...");
    await checkBalance(vaultPDA, vaultTokenAccount.publicKey);
    
    // 4. タイムロックを設定（60秒間）
    console.log("タイムロックを設定中...");
    await setTimelock(vaultPDA, 60);
    
    // 5. 60秒後にトークンを引き出し
    console.log("60秒後に引き出しを試みます...");
    setTimeout(async () => {
      try {
        await withdrawTokens(vaultPDA, vaultTokenAccount.publicKey, mint, 500000);
        
        // 再度残高を確認
        await checkBalance(vaultPDA, vaultTokenAccount.publicKey);
      } catch (error) {
        console.error("引き出し中にエラーが発生しました:", error);
      }
    }, 61000); // 61秒後に実行
    
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

// プログラムを実行
main();
```

### 注意点

- 実際のデプロイでは、プログラムIDを正しいものに置き換えてください。
- 上記のコードは基本的な例であり、実際のアプリケーションではエラーハンドリングやセキュリティ対策を強化する必要があります。
- 多重署名機能やその他の高度な機能を使用する場合は、適切なアカウント構造とフロー制御が必要です。
- Solanaのネットワーク料金（SOL）が必要なため、テスト前に十分なSOLをウォレットに入れておいてください。
- トークンの操作には適切な権限が必要です。特に他のユーザーのトークンを操作する場合は注意が必要です。

## トラブルシューティング

### よくあるエラーと解決策

1. **アカウントの所有者が一致しない**
   - エラー: `Error: 0x1000: program error: Account does not have correct owner`
   - 解決策: アカウントが正しいプログラムによって所有されていることを確認してください。

2. **残高不足**
   - エラー: `Error: 0x1: insufficient funds`
   - 解決策: ウォレットに十分なSOLがあることを確認してください。

3. **PDAの計算が間違っている**
   - エラー: `Error: 0x7d3: program error: A PDA was used as a signer`
   - 解決策: PDAの導出方法が正しいことを確認し、シードとバンプを適切に使用してください。

4. **タイムロックがアクティブ**
   - エラー: `Error: custom program error: 0x1771: Vault is locked until the specified time`
   - 解決策: タイムロック期間が終了するまで待つか、タイムロックを解除してください。

5. **権限エラー**
   - エラー: `Error: custom program error: 0x1770: Only the vault owner can perform this action`
   - 解決策: 操作を実行するアカウントが正しい権限を持っていることを確認してください。
