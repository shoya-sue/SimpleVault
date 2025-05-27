import { FC, useState } from 'react';
import { useVault } from '../hooks/useVault';

export const DepositForm: FC = () => {
  const [amount, setAmount] = useState<string>('');
  const { deposit, loading, error } = useVault();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;
    
    const depositAmount = parseFloat(amount);
    deposit(depositAmount);
    setAmount('');
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Deposit Tokens</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.000000001"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solana-purple"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !amount}
          className={`w-full py-2 px-4 rounded-md font-medium text-white 
            ${loading || !amount 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-solana-green hover:bg-opacity-90'}`}
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}; 