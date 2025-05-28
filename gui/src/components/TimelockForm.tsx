import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * タイムロック設定フォームコンポーネント
 */
export const TimelockForm = () => {
  const [lockDuration, setLockDuration] = useState<number>(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const { setTimelock, loading, error, vaultState } = useVault();

  // 現在のロック状態を表示するための計算
  const currentLockUntil = vaultState?.lockUntil?.toNumber() || 0;
  const now = Math.floor(Date.now() / 1000); // 現在のUNIXタイムスタンプ（秒）
  const isCurrentlyLocked = currentLockUntil > now;
  const remainingLockTime = isCurrentlyLocked ? currentLockUntil - now : 0;

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
    
    if (lockDuration <= 0) {
      setLocalError('ロック期間を選択してください');
      return;
    }
    
    setLocalError(null);
    await setTimelock(lockDuration);
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">タイムロック設定</h2>
      
      {isCurrentlyLocked && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-md">
          <p className="text-sm">
            現在、Vaultはロックされています。<br />
            解除まであと{Math.floor(remainingLockTime / 86400)}日
            {Math.floor((remainingLockTime % 86400) / 3600)}時間
            {Math.floor((remainingLockTime % 3600) / 60)}分です。
          </p>
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
            disabled={loading}
          >
            <option value="0">期間を選択...</option>
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
            {loading ? <LoadingIndicator size="sm" text="処理中..." /> : 'タイムロックを設定'}
          </button>
        </div>
      </form>
    </div>
  );
}; 