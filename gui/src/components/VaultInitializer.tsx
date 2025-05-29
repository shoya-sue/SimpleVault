import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import useSimpleVault from '../hooks/useSimpleVault';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

type VaultInitializerProps = {
  mint: PublicKey;
};

export const VaultInitializer: React.FC<VaultInitializerProps> = ({ mint }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { vaultInfo, initializeVault } = useSimpleVault({ 
    wallet: useWallet(), 
    connection,
    mint
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleInitialize = async () => {
    if (!publicKey) {
      setErrorMessage('ウォレットを接続してください');
      return;
    }

    setErrorMessage(null);
    setStatusMessage('金庫を初期化中...');

    try {
      await initializeVault(mint);
      setStatusMessage('金庫の初期化に成功しました');
    } catch (err) {
      console.error('初期化エラー:', err);
      setErrorMessage(`金庫の初期化中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000); // 5秒後にステータスメッセージを消す
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">金庫を初期化</h2>
      
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
        {vaultInfo.isInitialized ? (
          <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
            金庫は既に初期化されています。
            <div className="mt-2 text-sm">
              <div>金庫アドレス: {vaultInfo.vaultPDA?.toString().slice(0, 6)}...{vaultInfo.vaultPDA?.toString().slice(-4)}</div>
              <div>残高: {vaultInfo.balance} トークン</div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
            金庫がまだ初期化されていません。初期化を行ってください。
            <div className="mt-2 text-sm">
              <div>ミントアドレス: {mint.toString().slice(0, 6)}...{mint.toString().slice(-4)}</div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleInitialize}
        disabled={!publicKey || vaultInfo.isLoading || vaultInfo.isInitialized}
        className={`w-full py-2 px-4 rounded font-bold transition-colors ${
          !publicKey || vaultInfo.isLoading || vaultInfo.isInitialized
            ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            : 'bg-solana-blue hover:bg-blue-600 text-white'
        }`}
      >
        {vaultInfo.isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingIndicator size="sm" color="text-white" />
            <span className="ml-2">初期化中...</span>
          </div>
        ) : vaultInfo.isInitialized ? (
          '既に初期化済み'
        ) : (
          '金庫を初期化'
        )}
      </button>
    </div>
  );
}; 