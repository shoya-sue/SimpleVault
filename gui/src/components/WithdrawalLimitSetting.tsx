import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 出金制限設定コンポーネント
 */
export const WithdrawalLimitSetting = () => {
  const [limit, setLimit] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { setWithdrawalLimit, loading, error, vaultState, isInitialized, initialize } = useVault();

  // 現在の出金制限
  const currentLimit = vaultState?.maxWithdrawalLimit?.toString() || 'なし';

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setLocalError('有効な制限額を入力してください');
      return;
    }
    
    setLocalError(null);
    await setWithdrawalLimit(parsedLimit);
  };

  // 初期化ハンドラー
  const handleInitialize = async () => {
    await initialize();
  };

  // 未初期化の場合は初期化ボタンを表示
  if (!isInitialized) {
    return (
      <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">出金制限設定</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          この機能を使用するには、まずVaultを初期化する必要があります。
        </p>
        <button
          onClick={handleInitialize}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          disabled={loading}
        >
          {loading ? <LoadingIndicator size="sm" text="初期化中..." /> : 'Vaultを初期化'}
        </button>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">出金制限設定</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          現在の出金制限: <span className="font-semibold">{currentLimit}</span> トークン
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2">
            新しい出金制限額
          </label>
          <input
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-input leading-tight focus:outline-none focus:shadow-outline"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="制限額を入力"
            min="1"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            * 一度の引き出しで許可される最大額
          </p>
        </div>
        
        {(localError || error) && (
          <ErrorMessage message={localError || error || ''} />
        )}
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? <LoadingIndicator text="処理中..." /> : '出金制限を設定'}
          </button>
        </div>
      </form>
    </div>
  );
}; 