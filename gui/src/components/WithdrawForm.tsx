import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import useSimpleVault from '../hooks/useSimpleVault';
import { formatSol } from '../utils/format';
import { validateSolAmount } from '../utils/validation';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 引き出しフォームコンポーネント
 */
export const WithdrawForm: React.FC<{ mint: PublicKey }> = ({ mint }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { vaultInfo, withdraw } = useSimpleVault({ 
    wallet: useWallet(), 
    connection,
    mint
  });

  const [amount, setAmount] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 入力値変更時のハンドラ
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // 金額入力時にリアルタイムバリデーション
    if (value) {
      // 基本検証
      const validation = validateSolAmount(value);
      if (!validation.isValid) {
        setErrorMessage(validation.errorMessage);
        return;
      }
      
      // 残高チェック
      const numValue = parseFloat(value);
      const vaultBalance = parseFloat(vaultInfo.balance);
      if (numValue > vaultBalance) {
        setErrorMessage('金庫残高を超える金額は引き出せません');
      } else {
        setErrorMessage(null);
      }
    } else {
      setErrorMessage(null);
    }
  };

  // 引き出し処理
  const handleWithdraw = async () => {
    if (!publicKey || !vaultInfo.vaultPDA || !vaultInfo.vaultTokenAccount) {
      setErrorMessage('ウォレットを接続して金庫を初期化してください');
      return;
    }

    // 送信前の最終バリデーション
    const validation = validateSolAmount(amount);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage);
      return;
    }
    
    // 残高チェック
    const numValue = parseFloat(amount);
    const vaultBalance = parseFloat(vaultInfo.balance);
    if (numValue > vaultBalance) {
      setErrorMessage('金庫残高を超える金額は引き出せません');
      return;
    }

    setErrorMessage(null);
    setStatusMessage('引き出し処理中...');

    try {
      // トークン量に変換
      const tokenAmount = parseFloat(amount) * 1000000; // トークンのデシマルに応じて調整
      await withdraw(tokenAmount);
      
      setStatusMessage(`${amount} トークンの引き出しに成功しました`);
      setAmount(''); // 入力フィールドをクリア
    } catch (err) {
      console.error('Withdrawal error:', err);
      setErrorMessage(`引き出し中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000); // 5秒後にステータスメッセージを消す
    }
  };

  // 最大額をセット
  const setMaxAmount = () => {
    const vaultBalance = parseFloat(vaultInfo.balance);
    if (vaultBalance > 0) {
      setAmount(vaultBalance.toFixed(4));
      setErrorMessage(null);
    } else {
      setErrorMessage('金庫残高がありません');
    }
  };

  // 入力が有効かチェック
  const isInputValid = (): boolean => {
    if (!amount || !publicKey || vaultInfo.isLoading || !vaultInfo.isInitialized) return false;
    
    // 基本検証
    const validation = validateSolAmount(amount);
    if (!validation.isValid) return false;
    
    // 残高チェック
    const numValue = parseFloat(amount);
    const vaultBalance = parseFloat(vaultInfo.balance);
    return numValue > 0 && numValue <= vaultBalance;
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">トークンを引き出す</h2>
      
      {/* エラーメッセージ */}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* ステータスメッセージ */}
      {statusMessage && (
        <ErrorMessage
          message={statusMessage}
          type="success"
          onClose={() => setStatusMessage(null)}
        />
      )}

      {!vaultInfo.isInitialized && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
          金庫が初期化されていません。まず金庫を初期化してください。
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
            引き出し金額 (トークン)
          </label>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            金庫残高: {vaultInfo.balance} トークン
          </span>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.0"
            className="shadow appearance-none border dark:border-gray-700 rounded-l w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!publicKey || vaultInfo.isLoading || !vaultInfo.isInitialized}
          />
          <button
            onClick={setMaxAmount}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-r border-t border-r border-b dark:border-gray-600"
            disabled={!publicKey || vaultInfo.isLoading || !vaultInfo.isInitialized}
          >
            最大
          </button>
        </div>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={!isInputValid()}
        className={`w-full py-2 px-4 rounded font-bold transition-colors ${
          !isInputValid()
            ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            : 'bg-solana-purple hover:bg-purple-700 text-white'
        }`}
      >
        {vaultInfo.isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingIndicator size="sm" color="text-white" />
            <span className="ml-2">引き出し中...</span>
          </div>
        ) : (
          '引き出し'
        )}
      </button>
    </div>
  );
}; 