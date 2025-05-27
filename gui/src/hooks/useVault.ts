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

export const useVault = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program<SimpleVaultIDL> | null>(null);
  const [vaultPDA, setVaultPDA] = useState<PublicKey | null>(null);
  const [vaultTokenAccount, setVaultTokenAccount] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
          
          // トークンアカウントのPDA計算
          const [tokenAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('token-account'), vaultPDA.toBuffer()],
            programId
          );
          setVaultTokenAccount(tokenAccountPDA);
        }
      } catch (err) {
        console.error("Failed to initialize program:", err);
        setError("Failed to initialize program");
      }
    }
  }, [wallet, connection]);

  // 残高取得関数
  const fetchBalance = useCallback(async () => {
    if (!program || !vaultPDA) return;
    
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
      
      await program.methods.withdraw(new anchor.BN(amount))
        .accounts({
          vault: vaultPDA,
          vaultTokenAccount: vaultTokenAccount,
          userTokenAccount: userTokenAcc,
          owner: wallet.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      // 引き出し後に残高を更新
      await fetchBalance();
    } catch (err) {
      console.error("Failed to withdraw:", err);
      setError("Failed to withdraw: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [program, wallet, vaultPDA, vaultTokenAccount, getOrCreateTokenAccount, fetchBalance]);

  // ウォレット接続時に残高を自動取得
  useEffect(() => {
    if (program && vaultPDA && vaultTokenAccount) {
      fetchBalance();
    }
  }, [program, vaultPDA, vaultTokenAccount, fetchBalance]);

  return {
    deposit,
    withdraw,
    fetchBalance,
    balance,
    loading: loading || tokenAccountLoading,
    error: error || tokenAccountError,
    vaultPDA,
    vaultTokenAccount,
    userTokenAccount,
    isConnected: !!wallet,
  };
}; 