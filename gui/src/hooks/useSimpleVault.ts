import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import * as anchorClient from '../utils/anchor-client';

export type VaultInfo = {
  vaultPDA: PublicKey | null;
  vaultTokenAccount: PublicKey | null;
  balance: string;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
};

export type UseSimpleVaultProps = {
  wallet: any;
  connection: Connection;
  mint?: PublicKey;
};

export const useSimpleVault = ({ wallet, connection, mint }: UseSimpleVaultProps) => {
  const [vaultInfo, setVaultInfo] = useState<VaultInfo>({
    vaultPDA: null,
    vaultTokenAccount: null,
    balance: '0',
    isInitialized: false,
    isLoading: false,
    error: null,
  });

  // 金庫情報をロード
  const loadVaultInfo = useCallback(async () => {
    if (!wallet?.publicKey || !connection) return;

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 金庫のPDAを取得
      const { vaultPDA } = await anchorClient.getVaultPDA(wallet.publicKey);
      
      // 金庫アカウントの情報を取得
      const program = anchorClient.getProgram(wallet, connection);
      try {
        // @ts-ignore - AnchorプログラムのIDLタイプ問題を回避
        const vaultAccount = await program.account.vault.fetch(vaultPDA);
        
        // 金庫が初期化されている場合、残高を取得
        const vaultTokenAccount = vaultAccount.tokenAccount;
        let balance = '0';
        
        try {
          const balanceBN = await anchorClient.checkBalance(
            wallet,
            connection,
            vaultPDA,
            vaultTokenAccount
          );
          balance = balanceBN.toString();
        } catch (balanceError) {
          console.error('残高取得エラー:', balanceError);
        }
        
        setVaultInfo({
          vaultPDA,
          vaultTokenAccount,
          balance,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // 金庫が初期化されていない場合
        setVaultInfo({
          vaultPDA,
          vaultTokenAccount: null,
          balance: '0',
          isInitialized: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('金庫情報ロードエラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: '金庫情報のロードに失敗しました',
      }));
    }
  }, [wallet, connection]);

  // 金庫を初期化
  const initializeVault = useCallback(async (mintAddress: PublicKey) => {
    if (!wallet?.publicKey || !connection) return;

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await anchorClient.initializeVault(
        wallet,
        connection,
        mintAddress
      );
      
      // 金庫情報を更新
      setVaultInfo({
        vaultPDA: result.vaultPDA,
        vaultTokenAccount: result.vaultTokenAccount,
        balance: '0',
        isInitialized: true,
        isLoading: false,
        error: null,
      });
      
      return result;
    } catch (error) {
      console.error('金庫初期化エラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: '金庫の初期化に失敗しました',
      }));
      throw error;
    }
  }, [wallet, connection]);

  // トークンを預け入れ
  const deposit = useCallback(async (amount: number) => {
    if (!wallet?.publicKey || !connection || !mint || !vaultInfo.vaultPDA || !vaultInfo.vaultTokenAccount) {
      throw new Error('必要な情報が不足しています');
    }

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      await anchorClient.depositTokens(
        wallet,
        connection,
        vaultInfo.vaultPDA,
        vaultInfo.vaultTokenAccount,
        mint,
        amount
      );
      
      // 残高を再取得
      await loadVaultInfo();
    } catch (error) {
      console.error('預け入れエラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: 'トークンの預け入れに失敗しました',
      }));
      throw error;
    }
  }, [wallet, connection, mint, vaultInfo.vaultPDA, vaultInfo.vaultTokenAccount, loadVaultInfo]);

  // トークンを引き出し
  const withdraw = useCallback(async (amount: number) => {
    if (!wallet?.publicKey || !connection || !mint || !vaultInfo.vaultPDA || !vaultInfo.vaultTokenAccount) {
      throw new Error('必要な情報が不足しています');
    }

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      await anchorClient.withdrawTokens(
        wallet,
        connection,
        vaultInfo.vaultPDA,
        vaultInfo.vaultTokenAccount,
        mint,
        amount
      );
      
      // 残高を再取得
      await loadVaultInfo();
    } catch (error) {
      console.error('引き出しエラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: 'トークンの引き出しに失敗しました',
      }));
      throw error;
    }
  }, [wallet, connection, mint, vaultInfo.vaultPDA, vaultInfo.vaultTokenAccount, loadVaultInfo]);

  // タイムロックを設定
  const setTimelock = useCallback(async (lockDuration: number) => {
    if (!wallet?.publicKey || !connection || !vaultInfo.vaultPDA) {
      throw new Error('必要な情報が不足しています');
    }

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      await anchorClient.setTimelock(
        wallet,
        connection,
        vaultInfo.vaultPDA,
        lockDuration
      );
      
      setVaultInfo(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('タイムロック設定エラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: 'タイムロックの設定に失敗しました',
      }));
      throw error;
    }
  }, [wallet, connection, vaultInfo.vaultPDA]);

  // 委任者を追加
  const addDelegate = useCallback(async (delegateAddress: string) => {
    if (!wallet?.publicKey || !connection || !vaultInfo.vaultPDA) {
      throw new Error('必要な情報が不足しています');
    }

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      const delegatePublicKey = new PublicKey(delegateAddress);
      
      await anchorClient.addDelegate(
        wallet,
        connection,
        vaultInfo.vaultPDA,
        delegatePublicKey
      );
      
      setVaultInfo(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('委任者追加エラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: '委任者の追加に失敗しました',
      }));
      throw error;
    }
  }, [wallet, connection, vaultInfo.vaultPDA]);

  // 委任者を削除
  const removeDelegate = useCallback(async (delegateAddress: string) => {
    if (!wallet?.publicKey || !connection || !vaultInfo.vaultPDA) {
      throw new Error('必要な情報が不足しています');
    }

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      const delegatePublicKey = new PublicKey(delegateAddress);
      
      await anchorClient.removeDelegate(
        wallet,
        connection,
        vaultInfo.vaultPDA,
        delegatePublicKey
      );
      
      setVaultInfo(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('委任者削除エラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: '委任者の削除に失敗しました',
      }));
      throw error;
    }
  }, [wallet, connection, vaultInfo.vaultPDA]);

  // 引き出し制限を設定
  const setWithdrawalLimit = useCallback(async (limit: number) => {
    if (!wallet?.publicKey || !connection || !vaultInfo.vaultPDA) {
      throw new Error('必要な情報が不足しています');
    }

    try {
      setVaultInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      await anchorClient.setWithdrawalLimit(
        wallet,
        connection,
        vaultInfo.vaultPDA,
        limit
      );
      
      setVaultInfo(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('引き出し制限設定エラー:', error);
      setVaultInfo(prev => ({
        ...prev,
        isLoading: false,
        error: '引き出し制限の設定に失敗しました',
      }));
      throw error;
    }
  }, [wallet, connection, vaultInfo.vaultPDA]);

  // 初期ロード
  useEffect(() => {
    if (wallet?.publicKey && connection) {
      loadVaultInfo();
    }
  }, [wallet, connection, loadVaultInfo]);

  return {
    vaultInfo,
    loadVaultInfo,
    initializeVault,
    deposit,
    withdraw,
    setTimelock,
    addDelegate,
    removeDelegate,
    setWithdrawalLimit,
  };
};

export default useSimpleVault; 