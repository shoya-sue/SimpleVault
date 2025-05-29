import { AnchorProvider, BN, Program, web3 } from '@coral-xyz/anchor';
import { PublicKey, Connection, Keypair, SystemProgram } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import * as idl from '../idl/simple_vault.json';

// SimpleVaultプログラムID（デプロイ後の実際のIDに置き換える）
export const PROGRAM_ID = new PublicKey('GGCcGkcUoT1oCbPxkHrxpHDkLDrb9TYN8Hx2ffAEYLaQ');

// Anchorクライアントを初期化
export const getProgram = (wallet: any, connection: Connection) => {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  // @ts-ignore (IDLのタイプ問題を回避)
  return new Program(idl, PROGRAM_ID, provider);
};

// 金庫のPDAを取得
export const getVaultPDA = async (ownerPublicKey: PublicKey) => {
  const [vaultPDA, vaultBump] = await PublicKey.findProgramAddress(
    [Buffer.from("vault"), ownerPublicKey.toBuffer()],
    PROGRAM_ID
  );
  return { vaultPDA, vaultBump };
};

// ユーザーのトークンアカウントを取得
export const getUserTokenAccount = async (
  wallet: any,
  connection: Connection,
  mint: PublicKey
) => {
  const userTokenAccount = await getAssociatedTokenAddress(
    mint,
    wallet.publicKey
  );
  
  // アカウントが存在するかチェック
  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  
  if (!accountInfo) {
    // 存在しない場合は作成
    const tx = new web3.Transaction();
    tx.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,  // 支払者
        userTokenAccount,  // 関連付けられたトークンアカウント
        wallet.publicKey,  // 所有者
        mint               // ミント
      )
    );
    await wallet.sendTransaction(tx, connection);
  }
  
  return userTokenAccount;
};

// 金庫を初期化
export const initializeVault = async (
  wallet: any,
  connection: Connection,
  mint: PublicKey
) => {
  const program = getProgram(wallet, connection);
  const { vaultPDA } = await getVaultPDA(wallet.publicKey);
  
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
      rent: web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([vaultTokenAccount])
    .rpc();
    
  return { vaultPDA, vaultTokenAccount: vaultTokenAccount.publicKey };
};

// トークンを預け入れ
export const depositTokens = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  vaultTokenAccount: PublicKey,
  mint: PublicKey,
  amount: number
) => {
  const program = getProgram(wallet, connection);
  const userTokenAccount = await getUserTokenAccount(wallet, connection, mint);
  
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
};

// 残高を確認
export const checkBalance = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  vaultTokenAccount: PublicKey
) => {
  const program = getProgram(wallet, connection);
  
  const balance = await program.methods
    .queryBalance()
    .accounts({
      vault: vaultPDA,
      tokenAccount: vaultTokenAccount,
    })
    .view();
    
  return balance;
};

// トークンを引き出し
export const withdrawTokens = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  vaultTokenAccount: PublicKey,
  mint: PublicKey,
  amount: number
) => {
  const program = getProgram(wallet, connection);
  const userTokenAccount = await getUserTokenAccount(wallet, connection, mint);
  
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
};

// タイムロックを設定
export const setTimelock = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  lockDuration: number
) => {
  const program = getProgram(wallet, connection);
  
  // タイムロック設定を実行（秒単位）
  await program.methods
    .setTimelock(new BN(lockDuration))
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
};

// 委任者を追加
export const addDelegate = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  delegatePublicKey: PublicKey
) => {
  const program = getProgram(wallet, connection);
  
  // 委任者追加を実行
  await program.methods
    .addDelegate(delegatePublicKey)
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
};

// 委任者を削除
export const removeDelegate = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  delegatePublicKey: PublicKey
) => {
  const program = getProgram(wallet, connection);
  
  // 委任者削除を実行
  await program.methods
    .removeDelegate(delegatePublicKey)
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
};

// 多重署名を設定
export const setMultisig = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  threshold: number,
  signers: PublicKey[]
) => {
  const program = getProgram(wallet, connection);
  
  // 多重署名設定を実行
  await program.methods
    .setMultisig(threshold, signers)
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
};

// トランザクション承認（多重署名の場合）
export const approveTransaction = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  vaultTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  txId: number
) => {
  const program = getProgram(wallet, connection);
  
  // トランザクション承認を実行
  await program.methods
    .approveTransaction(new BN(txId))
    .accounts({
      vault: vaultPDA,
      vaultTokenAccount: vaultTokenAccount,
      destinationTokenAccount: destinationTokenAccount,
      signer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
};

// 引き出し制限を設定
export const setWithdrawalLimit = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  limit: number
) => {
  const program = getProgram(wallet, connection);
  
  // 引き出し制限設定を実行
  await program.methods
    .setWithdrawalLimit(new BN(limit))
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
};

// 所有権譲渡を開始
export const initiateOwnershipTransfer = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey,
  newOwner: PublicKey
) => {
  const program = getProgram(wallet, connection);
  
  // 所有権譲渡開始を実行
  await program.methods
    .initiateOwnershipTransfer(newOwner)
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
};

// 所有権譲渡を承認
export const acceptOwnership = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey
) => {
  const program = getProgram(wallet, connection);
  
  // 所有権譲渡承認を実行
  await program.methods
    .acceptOwnership()
    .accounts({
      vault: vaultPDA,
      newOwner: wallet.publicKey,
    })
    .rpc();
};

// 所有権譲渡をキャンセル
export const cancelOwnershipTransfer = async (
  wallet: any,
  connection: Connection,
  vaultPDA: PublicKey
) => {
  const program = getProgram(wallet, connection);
  
  // 所有権譲渡キャンセルを実行
  await program.methods
    .cancelOwnershipTransfer()
    .accounts({
      vault: vaultPDA,
      owner: wallet.publicKey,
    })
    .rpc();
}; 