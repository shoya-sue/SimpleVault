import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  TransactionSignature
} from '@solana/web3.js';
import { useState, useCallback } from 'react';
import { PROGRAM_ID } from '../utils/constants';

/**
 * Vaultプログラムを操作するためのカスタムフック
 */
export const useVaultProgram = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // プログラムIDの取得
  const programId = new PublicKey(PROGRAM_ID);

  // 預け入れ処理
  const deposit = useCallback(async (amount: number): Promise<boolean> => {
    if (!publicKey) {
      setError('ウォレットが接続されていません');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // PDAアドレスの導出
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        programId
      );

      // トランザクションの作成
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: vaultPDA,
          lamports: amount,
        })
      );

      // トランザクションの送信
      const signature = await sendTransaction(transaction, connection);
      
      // 確認を待機
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`Deposit successful: ${signature}`);
      return true;
    } catch (err) {
      console.error('Deposit error:', err);
      setError(`預け入れに失敗しました: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, sendTransaction, programId]);

  // 引き出し処理
  const withdraw = useCallback(async (amount: number): Promise<boolean> => {
    if (!publicKey) {
      setError('ウォレットが接続されていません');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // PDAアドレスの導出
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        programId
      );

      // 引き出し命令データの作成
      const amountBuffer = new Float64Array([amount]).buffer;
      const amountArray = new Uint8Array(amountBuffer);
      const instructionData = new Uint8Array(1 + amountArray.length);
      instructionData[0] = 1; // 命令タイプ (1 = withdraw)
      instructionData.set(amountArray, 1);

      // トランザクションの作成
      const transaction = new Transaction().add({
        keys: [
          { pubkey: vaultPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
        ],
        programId,
        data: Buffer.from(instructionData),
      });

      // トランザクションの送信
      const signature = await sendTransaction(transaction, connection);
      
      // 確認を待機
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`Withdrawal successful: ${signature}`);
      return true;
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError(`引き出しに失敗しました: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, sendTransaction, programId]);

  // 残高確認
  const getVaultBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) {
      return 0;
    }

    try {
      // PDAアドレスの導出
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        programId
      );

      // 残高の取得
      const balance = await connection.getBalance(vaultPDA);
      return balance / LAMPORTS_PER_SOL;
    } catch (err) {
      console.error('Failed to get vault balance:', err);
      setError(`残高の取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
      return 0;
    }
  }, [publicKey, connection, programId]);

  return {
    deposit,
    withdraw,
    getVaultBalance,
    loading,
    error
  };
}; 