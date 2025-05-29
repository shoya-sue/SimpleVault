import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import useSimpleVault from '../hooks/useSimpleVault';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 委任者管理コンポーネント
 */
export const DelegateManager = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { vaultInfo, addDelegate, removeDelegate } = useSimpleVault({
    wallet: useWallet(),
    connection
  });

  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 送信ハンドラー（委任者追加）
  const handleAddDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setErrorMessage('ウォレットを接続してください');
      return;
    }

    if (!vaultInfo.isInitialized) {
      setErrorMessage('金庫が初期化されていません');
      return;
    }
    
    if (!delegateAddress) {
      setErrorMessage('委任者のアドレスを入力してください');
      return;
    }

    // PublicKeyの検証
    try {
      new PublicKey(delegateAddress);
    } catch (err) {
      setErrorMessage('有効なSolanaアドレスを入力してください');
      return;
    }
    
    setErrorMessage(null);
    setStatusMessage('委任者を追加中...');

    try {
      await addDelegate(delegateAddress);
      setStatusMessage('委任者が追加されました');
      setDelegateAddress(''); // 送信後にフォームをクリア
    } catch (err) {
      console.error('委任者追加エラー:', err);
      setErrorMessage(`委任者の追加に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000); // 5秒後にステータスメッセージを消す
    }
  };

  // 委任者削除ハンドラー
  const handleRemoveDelegate = async (address: string) => {
    if (!publicKey) {
      setErrorMessage('ウォレットを接続してください');
      return;
    }

    if (!vaultInfo.isInitialized) {
      setErrorMessage('金庫が初期化されていません');
      return;
    }

    setErrorMessage(null);
    setStatusMessage('委任者を削除中...');

    try {
      await removeDelegate(address);
      setStatusMessage('委任者が削除されました');
    } catch (err) {
      console.error('委任者削除エラー:', err);
      setErrorMessage(`委任者の削除に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000); // 5秒後にステータスメッセージを消す
    }
  };

  // アドレスの短縮表示
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">委任者管理</h2>
      
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
            disabled={vaultInfo.isLoading || !vaultInfo.isInitialized}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded font-bold transition-colors ${
              !publicKey || vaultInfo.isLoading || !vaultInfo.isInitialized || !delegateAddress
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
            disabled={!publicKey || vaultInfo.isLoading || !vaultInfo.isInitialized || !delegateAddress}
          >
            {vaultInfo.isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingIndicator size="sm" color="text-white" />
                <span className="ml-2">処理中...</span>
              </div>
            ) : (
              '委任者を追加'
            )}
          </button>
        </div>
      </form>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text mb-3">委任者リスト</h3>
        
        {/* 委任者リストの表示はプログラムから取得する必要があります */}
        {/* この実装では委任者リストの取得機能が欠けているため、空のリストとして表示 */}
        <p className="text-gray-500 dark:text-gray-400 text-sm">委任者はまだ登録されていません</p>
        {/* 
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {delegates.map((delegate, index) => (
            <li key={index} className="py-3 flex justify-between items-center">
              <span className="text-gray-800 dark:text-dark-text font-mono">
                {shortenAddress(delegate.toString())}
              </span>
              <button
                onClick={() => handleRemoveDelegate(delegate.toString())}
                className="text-red-500 hover:text-red-700"
                disabled={vaultInfo.isLoading}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
        */}
      </div>
    </div>
  );
}; 