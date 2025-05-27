import React, { useEffect, useState } from 'react';
import { useTransactionHistory, TransactionType } from '../hooks/useTransactionHistory';
import { useWallet } from '@solana/wallet-adapter-react';
import { useResponsive } from '../hooks/useMediaQuery';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * トランザクション履歴表示コンポーネント
 */
const TransactionHistory: React.FC = () => {
  const { connected } = useWallet();
  const { 
    transactions, 
    loading, 
    error, 
    fetchTransactionHistory 
  } = useTransactionHistory();
  const { isMobile, isTablet } = useResponsive();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // エラーハンドリング
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  // ウォレット接続時に履歴を更新
  useEffect(() => {
    if (connected) {
      fetchTransactionHistory(15); // 最新15件を表示
    }
  }, [connected, fetchTransactionHistory]);

  // トランザクションタイプに応じた色を返す
  const getTypeColor = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'text-green-600 dark:text-green-400';
      case TransactionType.WITHDRAW:
        return 'text-red-600 dark:text-red-400';
      case TransactionType.MINT:
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // 日付をフォーマットする
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // モバイル用の短い日付フォーマット
  const formatShortDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Solanaエクスプローラーへのリンクを生成
  const getExplorerLink = (signature: string): string => {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  };

  // 署名を短く表示
  const shortenSignature = (signature: string, length: number = 6): string => {
    return `${signature.slice(0, length)}...${signature.slice(-length)}`;
  };

  // モバイル表示用のトランザクションカード
  const MobileTransactionCard = ({ tx }: { tx: any }) => (
    <div className="bg-white dark:bg-dark-card border dark:border-dark-border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className={`font-medium ${getTypeColor(tx.type)}`}>
          {tx.type}
        </span>
        <span
          className={`px-2 text-xs leading-5 font-semibold rounded-full 
            ${tx.status === 'confirmed' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
        >
          {tx.status === 'confirmed' ? '成功' : '失敗'}
        </span>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {formatShortDate(tx.timestamp)}
      </div>
      {tx.amount && (
        <div className="text-sm font-medium mb-2">
          {tx.amount.toFixed(4)} SOL
        </div>
      )}
      <div className="text-sm text-blue-500 dark:text-blue-400">
        <a
          href={getExplorerLink(tx.signature)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {shortenSignature(tx.signature, isMobile ? 4 : 6)}
        </a>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">トランザクション履歴</h2>
      
      {/* エラーメッセージ */}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
        />
      )}
      
      {/* 更新ボタン */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => fetchTransactionHistory(15)}
          disabled={loading || !connected}
          className={`py-2 px-4 rounded font-bold transition-colors ${
            loading || !connected
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          {loading ? 'ロード中...' : '更新'}
        </button>
      </div>

      {/* ローディングインジケータ */}
      {loading ? (
        <div className="text-center py-10">
          <LoadingIndicator text="トランザクション履歴を読み込み中..." />
        </div>
      ) : transactions.length > 0 ? (
        <>
          {/* モバイル・タブレット表示 */}
          {(isMobile || isTablet) && (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <MobileTransactionCard key={tx.signature} tx={tx} />
              ))}
            </div>
          )}

          {/* デスクトップ表示 */}
          {!isMobile && !isTablet && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      種類
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      署名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx.signature} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${getTypeColor(tx.type)}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {tx.amount ? `${tx.amount.toFixed(4)} SOL` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400">
                        <a
                          href={getExplorerLink(tx.signature)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {shortenSignature(tx.signature)}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${tx.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
                        >
                          {tx.status === 'confirmed' ? '成功' : '失敗'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {connected 
              ? 'トランザクション履歴がありません'
              : 'ウォレットを接続してトランザクション履歴を表示'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 