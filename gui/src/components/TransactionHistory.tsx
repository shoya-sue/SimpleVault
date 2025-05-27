import React, { useEffect } from 'react';
import { useTransactionHistory, TransactionType } from '../hooks/useTransactionHistory';
import { useWallet } from '@solana/wallet-adapter-react';

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
        return 'text-green-600';
      case TransactionType.WITHDRAW:
        return 'text-red-600';
      case TransactionType.MINT:
        return 'text-purple-600';
      default:
        return 'text-gray-600';
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

  // Solanaエクスプローラーへのリンクを生成
  const getExplorerLink = (signature: string): string => {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  };

  // 署名を短く表示
  const shortenSignature = (signature: string): string => {
    return `${signature.slice(0, 6)}...${signature.slice(-6)}`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">トランザクション履歴</h2>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 更新ボタン */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => fetchTransactionHistory(15)}
          disabled={loading || !connected}
          className={`py-2 px-4 rounded font-bold ${
            loading || !connected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'ロード中...' : '更新'}
        </button>
      </div>

      {/* トランザクションリスト */}
      {loading ? (
        <div className="text-center py-6">
          <p className="text-gray-500">トランザクション履歴を読み込み中...</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  種類
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  署名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.signature} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getTypeColor(tx.type)}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.amount ? `${tx.amount.toFixed(4)} SOL` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
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
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                    >
                      {tx.status === 'confirmed' ? '成功' : '失敗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">
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