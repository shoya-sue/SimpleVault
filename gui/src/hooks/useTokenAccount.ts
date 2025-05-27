import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { useCallback, useState } from 'react';

export const useTokenAccount = (mintAddress: string) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [tokenAccount, setTokenAccount] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrCreateTokenAccount = useCallback(async () => {
    if (!publicKey) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const mint = new PublicKey(mintAddress);
      const associatedTokenAddress = await getAssociatedTokenAddress(mint, publicKey);
      
      try {
        // 既存のアカウントを確認
        await connection.getTokenAccountBalance(associatedTokenAddress);
        setTokenAccount(associatedTokenAddress);
        return associatedTokenAddress;
      } catch (e) {
        // アカウントが存在しない場合は作成
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAddress,
            publicKey,
            mint
          )
        );
        
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature);
        
        setTokenAccount(associatedTokenAddress);
        return associatedTokenAddress;
      }
    } catch (err) {
      console.error("Failed to get or create token account:", err);
      setError("Failed to get or create token account");
      return null;
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, mintAddress, sendTransaction]);

  return {
    tokenAccount,
    getOrCreateTokenAccount,
    loading,
    error
  };
}; 