import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { PublicKey } from '@solana/web3.js';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 所有権移転コンポーネント
 */
export const OwnershipTransfer = () => {
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { 
    initiateOwnershipTransfer, 
    acceptOwnership, 
    cancelOwnershipTransfer, 
    loading, 
    error, 
    vaultState,
    isInitialized,
    initialize
  } = useVault();

  // 現在の所有権移転状態
  const pendingTransfer = vaultState?.transferOwnershipTo;
  const hasPendingTransfer = !!pendingTransfer;

  // 送信ハンドラー（所有権移転開始）
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOwnerAddress) {
      setLocalError('新しい所有者のアドレスを入力してください');
      return;
    }

    // PublicKeyの検証
    try {
      new PublicKey(newOwnerAddress);
    } catch (err) {
      setLocalError('有効なSolanaアドレスを入力してください');
      return;
    }
    
    setLocalError(null);
    await initiateOwnershipTransfer(newOwnerAddress);
    setNewOwnerAddress(''); // 送信後にフォームをクリア
  };

  // 所有権移転受諾ハンドラー
  const handleAcceptTransfer = async () => {
    await acceptOwnership();
  };

  // 所有権移転キャンセルハンドラー
  const handleCancelTransfer = async () => {
    await cancelOwnershipTransfer();
  };

  // 初期化ハンドラー
  const handleInitialize = async () => {
    await initialize();
  };

  // アドレスの短縮表示
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // 未初期化の場合は初期化ボタンを表示
  if (!isInitialized) {
    return (
      <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">所有権移転</h2>
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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">所有権移転</h2>
      
      {hasPendingTransfer ? (
        <div>
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-md">
            <p className="text-sm font-semibold">
              新しい所有者 ({shortenAddress(pendingTransfer.toString())}) への移転が保留中です
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAcceptTransfer}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
              disabled={loading}
            >
              {loading ? <LoadingIndicator text="処理中..." /> : '所有権を受け入れる'}
            </button>
            
            <button
              onClick={handleCancelTransfer}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
              disabled={loading}
            >
              {loading ? <LoadingIndicator text="処理中..." /> : '移転をキャンセル'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleInitiateTransfer}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2">
              新しい所有者のアドレス
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-input leading-tight focus:outline-none focus:shadow-outline"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
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
              {loading ? <LoadingIndicator text="処理中..." /> : '所有権移転を開始'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}; 