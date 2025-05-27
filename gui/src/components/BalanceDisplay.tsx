import { FC, useEffect } from 'react';
import { useVault } from '../hooks/useVault';
import { TOKEN_DECIMALS } from '../utils/constants';

export const BalanceDisplay: FC = () => {
  const { balance, fetchBalance, loading, error, isConnected } = useVault();

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
    }
  }, [isConnected, fetchBalance]);

  // トークンの小数点以下の表示を整形
  const formattedBalance = balance / Math.pow(10, TOKEN_DECIMALS);

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Vault Balance</h2>
      
      {isConnected ? (
        <div className="text-center">
          <div className="text-4xl font-bold text-solana-purple mb-2">
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span>{formattedBalance.toFixed(TOKEN_DECIMALS)}</span>
            )}
          </div>
          <p className="text-sm text-gray-600">Tokens in vault</p>
          
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 text-sm"
          >
            Refresh Balance
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Connect your wallet to view balance
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}; 