import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useVaultProgram } from '../hooks/useVaultProgram';
import { formatSol } from '../utils/format';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 残高表示コンポーネント
 */
export const BalanceDisplay: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { getVaultBalance } = useVaultProgram();

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 残高を取得する関数
  const fetchBalances = async () => {
    if (!publicKey) {
      setWalletBalance(0);
      setVaultBalance(0);
      return;
    }

    setLoading(true);
    try {
      // ウォレット残高の取得
      const walletBal = await connection.getBalance(publicKey);
      setWalletBalance(walletBal / 1000000000); // lamportsからSOLに変換

      // Vault残高の取得
      const vaultBal = await getVaultBalance();
      setVaultBalance(vaultBal);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      setErrorMessage('残高の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ウォレット接続状態の変更を検知
  useEffect(() => {
    fetchBalances();
    
    // 5秒ごとに残高を更新
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  // 総残高の計算
  const totalBalance = walletBalance + vaultBalance;

  return (
    <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">残高</h2>
      
      {/* エラーメッセージ */}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
        />
      )}

      {loading ? (
        <div className="py-4 flex justify-center">
          <LoadingIndicator text="残高を読み込み中..." />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 総残高 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">総残高</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatSol(totalBalance)} SOL
            </p>
          </div>

          {/* ウォレット残高 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">ウォレット残高</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {formatSol(walletBalance)} SOL
            </p>
          </div>

          {/* Vault残高 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Vault残高</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {formatSol(vaultBalance)} SOL
            </p>
          </div>
        </div>
      )}

      {!publicKey && (
        <div className="mt-4 text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            ウォレットを接続して残高を表示
          </p>
        </div>
      )}
    </div>
  );
}; 