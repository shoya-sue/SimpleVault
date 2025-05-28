import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { PublicKey } from '@solana/web3.js';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 委任者管理コンポーネント
 */
export const DelegateManager = () => {
  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { addDelegate, removeDelegate, loading, error, vaultState } = useVault();

  // 現在の委任者リスト
  const delegates = vaultState?.delegates || [];

  // 送信ハンドラー（委任者追加）
  const handleAddDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!delegateAddress) {
      setLocalError('委任者のアドレスを入力してください');
      return;
    }

    // PublicKeyの検証
    try {
      new PublicKey(delegateAddress);
    } catch (err) {
      setLocalError('有効なSolanaアドレスを入力してください');
      return;
    }
    
    setLocalError(null);
    await addDelegate(delegateAddress);
    setDelegateAddress(''); // 送信後にフォームをクリア
  };

  // 委任者削除ハンドラー
  const handleRemoveDelegate = async (address: string) => {
    await removeDelegate(address);
  };

  // アドレスの短縮表示
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">委任者管理</h2>
      
      <form onSubmit={handleAddDelegate} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2">
            追加する委任者アドレス
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-input leading-tight focus:outline-none focus:shadow-outline"
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
            placeholder="Solanaウォレットアドレス"
            disabled={loading}
          />
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
            {loading ? <LoadingIndicator text="処理中..." /> : '委任者を追加'}
          </button>
        </div>
      </form>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text mb-3">委任者リスト</h3>
        
        {delegates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">委任者はまだ登録されていません</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {delegates.map((delegate, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <span className="text-gray-800 dark:text-dark-text font-mono">
                  {shortenAddress(delegate.toString())}
                </span>
                <button
                  onClick={() => handleRemoveDelegate(delegate.toString())}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 