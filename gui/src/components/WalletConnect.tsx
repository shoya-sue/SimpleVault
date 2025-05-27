import { FC, useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { shortenAddress } from '../utils/format';
import { useResponsive } from '../hooks/useMediaQuery';
import ErrorMessage from './ErrorMessage';

/**
 * ウォレット接続ボタンと接続状態を表示するコンポーネント
 */
export const WalletConnect: FC = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useResponsive();

  // ウォレットアドレスをクリップボードにコピー
  const copyAddress = useCallback(() => {
    if (publicKey) {
      try {
        navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
        setError('アドレスのコピーに失敗しました');
        setTimeout(() => setError(null), 3000);
      }
    }
  }, [publicKey]);

  // エラーの自動クリア
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center">
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 w-full max-w-md">
          <ErrorMessage
            message={error}
            type="error"
            onClose={() => setError(null)}
          />
        </div>
      )}
      
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-white dark:bg-dark-card p-4 rounded-lg shadow-md`}>
        {/* ウォレット接続ボタン */}
        <WalletMultiButton className="bg-solana-purple hover:bg-purple-700 transition-colors" />
        
        {/* 接続状態とアドレス表示 */}
        {connected && publicKey && (
          <div className={`flex items-center ${isMobile ? 'mt-2' : ''}`}>
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortenAddress(publicKey.toString())}
              </span>
              <button
                onClick={copyAddress}
                className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="アドレスをコピー"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                )}
              </button>
            </div>
            
            <button
              onClick={() => disconnect()}
              className="ml-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              切断
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 