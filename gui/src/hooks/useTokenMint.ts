import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { 
  createInitializeMintInstruction, 
  createMintToInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  TOKEN_PROGRAM_ID, 
  MINT_SIZE,
  getMint
} from '@solana/spl-token';
import { useCallback, useState } from 'react';
import { TOKEN_DECIMALS } from '../utils/constants';

/**
 * SPLトークンのミント機能を提供するカスタムフック
 */
export const useTokenMint = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintKeypair, setMintKeypair] = useState<Keypair | null>(null);
  const [mintAddress, setMintAddress] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 新しいSPLトークンのミントを作成する
   */
  const createMint = useCallback(async () => {
    if (!publicKey) {
      setError('ウォレットが接続されていません');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // 新しいKeypairを生成
      const newMintKeypair = Keypair.generate();
      
      // ミントアカウント作成のための料金を計算
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      // トランザクションを作成
      const transaction = new Transaction().add(
        // ミントアカウントの作成
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: newMintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        // ミントの初期化
        createInitializeMintInstruction(
          newMintKeypair.publicKey,
          TOKEN_DECIMALS, // デシマル数
          publicKey, // ミント権限
          publicKey, // フリーズ権限
          TOKEN_PROGRAM_ID
        )
      );

      // トランザクションの送信
      const signature = await sendTransaction(transaction, connection, {
        signers: [newMintKeypair],
      });
      
      // トランザクションの確認
      await connection.confirmTransaction(signature);
      
      setMintKeypair(newMintKeypair);
      setMintAddress(newMintKeypair.publicKey);
      
      return newMintKeypair.publicKey;
    } catch (err) {
      console.error('ミントの作成に失敗しました:', err);
      setError('ミントの作成に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, sendTransaction]);

  /**
   * 指定されたアドレスにトークンをミントする
   */
  const mintTokens = useCallback(async (amount: number, destinationWallet?: PublicKey) => {
    if (!publicKey || !mintAddress) {
      setError('ウォレットが接続されていないか、ミントが作成されていません');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const targetWallet = destinationWallet || publicKey;
      
      // 送信先のアソシエイテッドトークンアカウントを取得
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintAddress,
        targetWallet
      );
      
      const transaction = new Transaction();
      
      // トークンアカウントが存在するか確認
      try {
        await getMint(connection, mintAddress);
      } catch (e) {
        // トークンアカウントが存在しない場合は作成
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAddress,
            targetWallet,
            mintAddress
          )
        );
      }
      
      // ミント指示を追加
      transaction.add(
        createMintToInstruction(
          mintAddress,
          associatedTokenAddress,
          publicKey,
          amount * Math.pow(10, TOKEN_DECIMALS) // デシマルに合わせて調整
        )
      );
      
      // トランザクションの送信
      const signature = await sendTransaction(transaction, connection);
      
      // トランザクションの確認
      await connection.confirmTransaction(signature);
      
      return true;
    } catch (err) {
      console.error('トークンのミントに失敗しました:', err);
      setError('トークンのミントに失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, mintAddress, sendTransaction]);

  return {
    createMint,
    mintTokens,
    mintAddress,
    loading,
    error
  };
}; 