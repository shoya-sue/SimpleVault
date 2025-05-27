import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useVaultProgram } from '../hooks/useVaultProgram';
import { formatSol } from '../utils/format';
import { validateSolAmountWithBalance } from '../utils/validation';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 預け入れフォームコンポーネント
 */
export const DepositForm: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { deposit, loading } = useVaultProgram();

  const [amount, setAmount] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // ウォレット残高の取得
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(0);
        return;
      }

      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1000000000); // lamportsからSOLに変換
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setErrorMessage('残高の取得に失敗しました');
      }
    };

    fetchBalance();
    // 5秒ごとに残高を更新
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  // 入力値変更時のハンドラ
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // 金額入力時にリアルタイムバリデーション
    if (value) {
      const validation = validateSolAmountWithBalance(value, balance);
      if (!validation.isValid) {
        setErrorMessage(validation.errorMessage);
      } else {
        setErrorMessage(null);
      }
    } else {
      setErrorMessage(null);
    }
  };

  // 預け入れ処理
  const handleDeposit = async () => {
    if (!publicKey) {
      setErrorMessage('ウォレットを接続してください');
      return;
    }

    // 送信前の最終バリデーション
    const validation = validateSolAmountWithBalance(amount, balance);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage);
      return;
    }

    setErrorMessage(null);
    setStatusMessage('預け入れ処理中...');

    try {
      // lamportsに変換
      const lamports = parseFloat(amount) * 1000000000;
      const result = await deposit(lamports);
      
      if (result) {
        setStatusMessage(`${amount} SOLの預け入れに成功しました`);
        setAmount(''); // 入力フィールドをクリア
      } else {
        setErrorMessage('預け入れに失敗しました');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      setErrorMessage(`預け入れ中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000); // 5秒後にステータスメッセージを消す
    }
  };

  // 最大額をセット
  const setMaxAmount = () => {
    // 手数料用に0.01 SOL残す
    if (balance > 0.01) {
      const maxAmount = (balance - 0.01).toFixed(4);
      setAmount(maxAmount);
      
      // 最大額設定時のバリデーション
      const validation = validateSolAmountWithBalance(maxAmount, balance);
      if (!validation.isValid) {
        setErrorMessage(validation.errorMessage);
      } else {
        setErrorMessage(null);
      }
    } else {
      setErrorMessage('残高が不足しています');
    }
  };

  // 入力が有効かチェック
  const isInputValid = (): boolean => {
    if (!amount || !publicKey || loading) return false;
    const validation = validateSolAmountWithBalance(amount, balance);
    return validation.isValid;
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">SOLを預ける</h2>
      
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

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
            預け入れ金額 (SOL)
          </label>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            残高: {formatSol(balance)} SOL
          </span>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.0"
            className="shadow appearance-none border dark:border-gray-700 rounded-l w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!publicKey || loading}
          />
          <button
            onClick={setMaxAmount}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-r border-t border-r border-b dark:border-gray-600"
            disabled={!publicKey || loading}
          >
            最大
          </button>
        </div>
      </div>

      <button
        onClick={handleDeposit}
        disabled={!isInputValid()}
        className={`w-full py-2 px-4 rounded font-bold transition-colors ${
          !isInputValid()
            ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            : 'bg-solana-green hover:bg-green-600 text-white'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <LoadingIndicator size="sm" color="text-white" />
            <span className="ml-2">預け入れ中...</span>
          </div>
        ) : (
          '預け入れ'
        )}
      </button>
    </div>
  );
}; 