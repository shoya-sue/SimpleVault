import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import useSimpleVault from '../hooks/useSimpleVault';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * タイムロック設定フォームコンポーネント
 */
export const TimelockForm = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { vaultInfo, setTimelock } = useSimpleVault({ 
    wallet: useWallet(), 
    connection
  });

  const [lockDuration, setLockDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 期間オプション（秒単位）
  const durationOptions = [
    { value: 300, label: '5分' },
    { value: 3600, label: '1時間' },
    { value: 86400, label: '1日' },
    { value: 604800, label: '1週間' },
    { value: 2592000, label: '30日' },
  ];

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setErrorMessage('ウォレットを接続してください');
      return;
    }

    if (!vaultInfo.isInitialized) {
      setErrorMessage('金庫が初期化されていません');
      return;
    }
    
    if (lockDuration <= 0) {
      setErrorMessage('ロック期間を選択してください');
      return;
    }
    
    setErrorMessage(null);
    setStatusMessage('タイムロック設定中...');

    try {
      await setTimelock(lockDuration);
      setStatusMessage(`タイムロックが${durationOptions.find(option => option.value === lockDuration)?.label || lockDuration + '秒'}に設定されました`);
    } catch (err) {
      console.error('タイムロック設定エラー:', err);
      setErrorMessage(`タイムロックの設定に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000); // 5秒後にステータスメッセージを消す
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">タイムロック設定</h2>
      
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
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2">
            ロック期間
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-input leading-tight focus:outline-none focus:shadow-outline"
            value={lockDuration}
            onChange={(e) => setLockDuration(parseInt(e.target.value))}
            disabled={vaultInfo.isLoading || !vaultInfo.isInitialized}
          >
            <option value="0">期間を選択...</option>
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded font-bold transition-colors ${
              !publicKey || vaultInfo.isLoading || !vaultInfo.isInitialized || lockDuration <= 0
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
            disabled={!publicKey || vaultInfo.isLoading || !vaultInfo.isInitialized || lockDuration <= 0}
          >
            {vaultInfo.isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingIndicator size="sm" color="text-white" />
                <span className="ml-2">処理中...</span>
              </div>
            ) : (
              'タイムロックを設定'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 