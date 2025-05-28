import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PROGRAM_ID, TEST_MINT_ADDRESS } from '../utils/constants';
import { IDL } from '../utils/idl';
import { useTokenAccount } from './useTokenAccount';

// SimpleVaultプログラムのIDL型
interface SimpleVaultIDL {
  version: string;
  name: string;
  instructions: any[];
  accounts: any[];
  errors: any[];
}

// Vault状態の型定義
interface VaultState {
  owner: PublicKey;
  tokenAccount: PublicKey;
  bump: number;
  lockUntil: anchor.BN;
  delegates: PublicKey[];
  multisigThreshold: number;
  multisigSigners: PublicKey[];
  pendingTransactions: PendingTransaction[];
  maxWithdrawalLimit: anchor.BN;
  transferOwnershipTo: PublicKey | null;
}

// 保留中トランザクションの型定義
interface PendingTransaction {
  id: anchor.BN;
  transactionType: { withdraw?: {} } | { transferOwnership?: {} };
  amount: anchor.BN;
  destination: PublicKey;
  newOwner: PublicKey | null;
  signers: PublicKey[];
  executed: boolean;
  createdAt: anchor.BN;
}

export const useVault = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program<SimpleVaultIDL> | null>(null);
  const [vaultPDA, setVaultPDA] = useState<PublicKey | null>(null);
  const [vaultTokenAccount, setVaultTokenAccount] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // ユーザーのトークンアカウントを管理するカスタムフック
  const { 
    tokenAccount: userTokenAccount, 
    getOrCreateTokenAccount,
    loading: tokenAccountLoading,
    error: tokenAccountError
  } = useTokenAccount(TEST_MINT_ADDRESS);

  // プログラムの初期化
  useEffect(() => {
    if (wallet) {
      try {
        const provider = new anchor.AnchorProvider(
          connection,
          wallet,
          { preflightCommitment: 'processed' }
        );
        
        // IDLをインポートして使用
        const programId = new PublicKey(PROGRAM_ID);
        const program = new Program(IDL as SimpleVaultIDL, programId, provider);
        setProgram(program);

        // PDAの計算
        if (wallet.publicKey) {
          const [vaultPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('vault'), wallet.publicKey.toBuffer()],
            programId
          );
          setVaultPDA(vaultPDA);
          
          // Vaultのトークンアカウントを取得
          program.account.vault.fetch(vaultPDA).then(vault => {
            setVaultTokenAccount(vault.tokenAccount);
            setVaultState(vault as unknown as VaultState);
            setIsInitialized(true);
            console.log("Vault initialized:", vault);
          }).catch(err => {
            // エラーが起きてもすぐに初期化済みと判断しない
            console.log("Checking vault initialization status:", err);
            
            // Vaultトークンアカウントを別の方法で確認
            program.provider.connection.getParsedAccountInfo(vaultPDA).then(accountInfo => {
              if (accountInfo && accountInfo.value) {
                console.log("Vault account exists, but might need reinitialization");
                setIsInitialized(true);
              } else {
                console.log("Vault not initialized yet");
                setIsInitialized(false);
              }
            }).catch(() => {
              setIsInitialized(false);
            });
          });
        }
      } catch (err) {
        console.error("Failed to initialize program:", err);
        setError("Failed to initialize program");
        setIsInitialized(false);
      }
    }
  }, [wallet, connection]);

  // 初期化チェック
  const checkInitialization = useCallback(() => {
    if (!wallet) {
      setError("ウォレットが接続されていません");
      return false;
    }
    
    if (!program) {
      setError("プログラムが初期化されていません");
      return false;
    }
    
    if (!isInitialized) {
      setError("Vaultが初期化されていません。「初期化」ボタンを押してVaultを作成してください。");
      return false;
    }
    
    return true;
  }, [wallet, program, isInitialized]);

  // Vaultアカウント状態を取得
  const fetchVaultState = useCallback(async () => {
    if (!program || !vaultPDA) return;
    
    try {
      const vaultData = await program.account.vault.fetch(vaultPDA);
      setVaultState(vaultData as unknown as VaultState);
      setVaultTokenAccount(vaultData.tokenAccount);
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to fetch vault state:", err);
      setIsInitialized(false);
    }
  }, [program, vaultPDA]);

  // 残高取得関数
  const fetchBalance = useCallback(async () => {
    if (!checkInitialization() || !vaultTokenAccount) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // プログラムを呼び出して残高を取得
      const balance = await program.methods.queryBalance().accounts({
        vault: vaultPDA,
        tokenAccount: vaultTokenAccount,
      }).view();
      setBalance(balance.toNumber());
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setError("Failed to fetch balance");
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [program, vaultPDA, vaultTokenAccount]);

  // 初期化関数
  const initialize = useCallback(async () => {
    if (!wallet) {
      setError("ウォレットが接続されていません");
      return;
    }
    
    if (!program) {
      setError("プログラムが初期化されていません");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const mint = new PublicKey(TEST_MINT_ADDRESS);
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), wallet.publicKey.toBuffer()],
        program.programId
      );

      // Vaultトークンアカウントの初期化
      await program.methods.initialize()
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: null, // Anchorが自動で作成
          mint: mint,
          owner: wallet.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
      
      // Vault状態を更新
      await fetchVaultState();
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize vault:", err);
      setError("Failed to initialize vault: " + (err instanceof Error ? err.message : String(err)));
      setIsInitialized(false);
    } finally {
      setLoading(false);
    }
  }, [program, wallet, fetchVaultState]);

  // 預け入れ関数
  const deposit = useCallback(async (amount: number) => {
    if (!program || !wallet || !vaultPDA || !vaultTokenAccount) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // ユーザーのトークンアカウントを取得または作成
      const userTokenAcc = await getOrCreateTokenAccount();
      if (!userTokenAcc) {
        setError("Failed to get or create token account");
        return;
      }
      
      await program.methods.deposit(new anchor.BN(amount))
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount,
          userTokenAccount: userTokenAcc,
          owner: wallet.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      // 預け入れ後に残高を更新
      await fetchBalance();
    } catch (err) {
      console.error("Failed to deposit:", err);
      setError("Failed to deposit: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, vaultTokenAccount, getOrCreateTokenAccount, fetchBalance]);

  // 引き出し関数
  const withdraw = useCallback(async (amount: number) => {
    if (!checkInitialization() || !vaultTokenAccount) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // ユーザーのトークンアカウントを取得または作成
      const userTokenAcc = await getOrCreateTokenAccount();
      if (!userTokenAcc) {
        setError("Failed to get or create token account");
        return;
      }
      
      await program.methods.withdraw(new anchor.BN(amount))
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount,
          userTokenAccount: userTokenAcc,
          owner: wallet.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      // 引き出し後に残高と状態を更新
      await fetchBalance();
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to withdraw:", err);
      setError("Failed to withdraw: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, vaultTokenAccount, getOrCreateTokenAccount, fetchBalance, fetchVaultState, checkInitialization]);

  // タイムロック設定関数
  const setTimelock = useCallback(async (lockDuration: number) => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await program.methods.setTimelock(new anchor.BN(lockDuration))
        .accounts({
          vault: vaultPDA,
          owner: wallet.publicKey,
        })
        .rpc();
      
      // タイムロック設定後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to set timelock:", err);
      setError("Failed to set timelock: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // 委任者追加関数
  const addDelegate = useCallback(async (delegateAddress: string) => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const delegatePubkey = new PublicKey(delegateAddress);
      
      await program.methods.addDelegate(delegatePubkey)
        .accounts({
          vault: vaultPDA,
          owner: wallet.publicKey,
        })
        .rpc();
      
      // 委任者追加後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to add delegate:", err);
      setError("Failed to add delegate: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // 委任者削除関数
  const removeDelegate = useCallback(async (delegateAddress: string) => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const delegatePubkey = new PublicKey(delegateAddress);
      
      await program.methods.removeDelegate(delegatePubkey)
        .accounts({
          vault: vaultPDA,
          owner: wallet.publicKey,
        })
        .rpc();
      
      // 委任者削除後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to remove delegate:", err);
      setError("Failed to remove delegate: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // マルチシグ設定関数
  const setMultisig = useCallback(async (threshold: number, signers: string[]) => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const signerPubkeys = signers.map(s => new PublicKey(s));
      
      await program.methods.setMultisig(threshold, signerPubkeys)
        .accounts({
          vault: vaultPDA,
          owner: wallet.publicKey,
        })
        .rpc();
      
      // マルチシグ設定後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to set multisig:", err);
      setError("Failed to set multisig: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // 出金制限設定関数
  const setWithdrawalLimit = useCallback(async (limit: number) => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await program.methods.setWithdrawalLimit(new anchor.BN(limit))
        .accounts({
          vault: vaultPDA,
          owner: wallet.publicKey,
        })
        .rpc();
      
      // 出金制限設定後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to set withdrawal limit:", err);
      setError("Failed to set withdrawal limit: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // トランザクション承認関数
  const approveTransaction = useCallback(async (txId: number) => {
    if (!program || !wallet || !vaultPDA || !vaultTokenAccount) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // トランザクションを検索
      const tx = vaultState?.pendingTransactions.find(t => t.id.toNumber() === txId);
      if (!tx) {
        setError("Transaction not found");
        return;
      }
      
      // 送金先アドレスを取得
      const destination = tx.destination;
      
      await program.methods.approveTransaction(new anchor.BN(txId))
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount,
          destinationTokenAccount: destination,
          signer: wallet.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      // 承認後に状態と残高を更新
      await fetchVaultState();
      await fetchBalance();
    } catch (err) {
      console.error("Failed to approve transaction:", err);
      setError("Failed to approve transaction: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, vaultTokenAccount, vaultState, fetchVaultState, fetchBalance]);

  // 所有権移転開始関数
  const initiateOwnershipTransfer = useCallback(async (newOwnerAddress: string) => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newOwnerPubkey = new PublicKey(newOwnerAddress);
      
      await program.methods.initiateOwnershipTransfer(newOwnerPubkey)
        .accounts({
          vault: vaultPDA,
          owner: wallet.publicKey,
        })
        .rpc();
      
      // 所有権移転開始後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to initiate ownership transfer:", err);
      setError("Failed to initiate ownership transfer: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // 所有権移転受諾関数
  const acceptOwnership = useCallback(async () => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await program.methods.acceptOwnership()
        .accounts({
          vault: vaultPDA,
          newOwner: wallet.publicKey,
        })
        .rpc();
      
      // 所有権移転受諾後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to accept ownership:", err);
      setError("Failed to accept ownership: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // 所有権移転キャンセル関数
  const cancelOwnershipTransfer = useCallback(async () => {
    if (!program || !wallet || !vaultPDA) {
      setError("Wallet or program not initialized");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await program.methods.cancelOwnershipTransfer()
        .accounts({
          vault: vaultPDA,
          owner: wallet.publicKey,
        })
        .rpc();
      
      // 所有権移転キャンセル後に状態を更新
      await fetchVaultState();
    } catch (err) {
      console.error("Failed to cancel ownership transfer:", err);
      setError("Failed to cancel ownership transfer: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, fetchVaultState]);

  // ウォレット接続時にVault状態と残高を自動取得
  useEffect(() => {
    if (program && vaultPDA) {
      fetchVaultState();
      if (vaultTokenAccount) {
        fetchBalance();
      }
    }
  }, [program, vaultPDA, vaultTokenAccount, fetchVaultState, fetchBalance]);

  return {
    // 基本機能
    initialize,
    deposit,
    withdraw,
    fetchBalance,
    fetchVaultState,
    
    // 拡張機能
    setTimelock,
    addDelegate,
    removeDelegate,
    setMultisig,
    setWithdrawalLimit,
    approveTransaction,
    initiateOwnershipTransfer,
    acceptOwnership,
    cancelOwnershipTransfer,
    
    // 状態
    balance,
    vaultState,
    loading: loading || tokenAccountLoading,
    error: error || tokenAccountError,
    vaultPDA,
    vaultTokenAccount,
    userTokenAccount,
    isConnected: !!wallet,
    isInitialized,
  };
}; 