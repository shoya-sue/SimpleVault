import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { PublicKey } from '@solana/web3.js';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * マルチシグ管理コンポーネント
 */
export const MultisigManager = () => {
  const [threshold, setThreshold] = useState<number>(2);
  const [signerAddress, setSignerAddress] = useState<string>('');
  const [signers, setSigners] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const { setMultisig, loading, error, vaultState, isInitialized, initialize } = useVault();

  // 現在のマルチシグ設定
  const currentThreshold = vaultState?.multisigThreshold || 1;
  const currentSigners = vaultState?.multisigSigners || [];

  // アドレス追加ハンドラー
  const handleAddSigner = () => {
    if (!signerAddress) {
      setLocalError('署名者のアドレスを入力してください');
      return;
    }

    // PublicKeyの検証
    try {
      new PublicKey(signerAddress);
    } catch (err) {
      setLocalError('有効なSolanaアドレスを入力してください');
      return;
    }

    // 重複チェック
    if (signers.includes(signerAddress)) {
      setLocalError('既に追加されている署名者です');
      return;
    }

    setLocalError(null);
    setSigners([...signers, signerAddress]);
    setSignerAddress(''); // 入力欄をクリア
  };

  // 署名者削除ハンドラー
  const handleRemoveSigner = (index: number) => {
    const updatedSigners = [...signers];
    updatedSigners.splice(index, 1);
    setSigners(updatedSigners);
  };

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signers.length === 0) {
      setLocalError('少なくとも1人の署名者を追加してください');
      return;
    }
    
    if (threshold > signers.length + 1) { // +1 は所有者自身
      setLocalError(`閾値は署名者数+1(${signers.length + 1})以下にする必要があります`);
      return;
    }
    
    setLocalError(null);
    await setMultisig(threshold, signers);
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">マルチシグ設定</h2>
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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">マルチシグ設定</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text mb-2">現在の設定</h3>
        <p className="text-gray-600 dark:text-gray-400">
          閾値: {currentThreshold} / {currentSigners.length + 1} (所有者を含む)
        </p>
        
        {currentSigners.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 dark:text-dark-text mb-1">登録済み署名者:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-400">
              {currentSigners.map((signer, idx) => (
                <li key={idx} className="font-mono">{shortenAddress(signer.toString())}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2">
            署名閾値（必要な署名数）
          </label>
          <input
            type="number"
            min="1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-input leading-tight focus:outline-none focus:shadow-outline"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            * 署名者+所有者の中で必要な承認数を指定（所有者も1人と数えます）
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-dark-text text-sm font-bold mb-2">
            署名者の追加
          </label>
          <div className="flex">
            <input
              type="text"
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-input leading-tight focus:outline-none focus:shadow-outline"
              value={signerAddress}
              onChange={(e) => setSignerAddress(e.target.value)}
              placeholder="Solanaウォレットアドレス"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddSigner}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r"
              disabled={loading}
            >
              追加
            </button>
          </div>
        </div>
        
        {signers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 dark:text-dark-text mb-2">追加する署名者</h3>
            <ul className="bg-gray-50 dark:bg-dark-bg rounded p-2">
              {signers.map((signer, index) => (
                <li key={index} className="flex justify-between items-center py-1">
                  <span className="font-mono text-sm">{shortenAddress(signer)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSigner(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {(localError || error) && (
          <ErrorMessage message={localError || error || ''} />
        )}
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? <LoadingIndicator text="処理中..." /> : 'マルチシグを設定'}
          </button>
        </div>
      </form>
    </div>
  );
}; 