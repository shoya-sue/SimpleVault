import { useVault } from '../hooks/useVault';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

/**
 * 保留中トランザクションコンポーネント
 */
export const PendingTransactions = () => {
  const { approveTransaction, loading, error, vaultState } = useVault();

  // 保留中のトランザクション一覧
  const pendingTransactions = vaultState?.pendingTransactions || [];
  const activePendingTransactions = pendingTransactions.filter(tx => !tx.executed);

  // トランザクションタイプ表示関数
  const getTransactionTypeLabel = (txType: any) => {
    if ('withdraw' in txType) return '出金';
    if ('transferOwnership' in txType) return '所有権移転';
    return '不明';
  };

  // トランザクション承認ハンドラー
  const handleApproveTransaction = async (txId: number) => {
    await approveTransaction(txId);
  };

  // アドレスの短縮表示
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // タイムスタンプ表示
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  if (activePendingTransactions.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">保留中トランザクション</h2>
        <p className="text-gray-500 dark:text-gray-400">現在、保留中のトランザクションはありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">保留中トランザクション</h2>
      
      {error && <ErrorMessage message={error} />}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-bg">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">タイプ</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">詳細</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">署名者</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">作成日時</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">アクション</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {activePendingTransactions.map((tx) => (
              <tr key={tx.id.toString()} className="hover:bg-gray-50 dark:hover:bg-dark-bg">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text">{tx.id.toString()}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text">{getTransactionTypeLabel(tx.transactionType)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text">
                  {'withdraw' in tx.transactionType ? (
                    <span>{tx.amount.toString()} トークン</span>
                  ) : (
                    <span>{tx.newOwner ? shortenAddress(tx.newOwner.toString()) : '不明'}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full">
                    {tx.signers.length}/{vaultState?.multisigThreshold || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text">{formatTimestamp(tx.createdAt.toNumber())}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleApproveTransaction(tx.id.toNumber())}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                    disabled={loading}
                  >
                    {loading ? <LoadingIndicator text="処理中" /> : '承認する'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 