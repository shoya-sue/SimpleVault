import { FC, useState } from 'react';
import { useVault } from '../hooks/useVault';

export const WithdrawForm: FC = () => {
  const [amount, setAmount] = useState<string>('');
  const { withdraw, balance, loading, error } = useVault();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > balance) {
      alert('Withdrawal amount exceeds balance');
      return;
    }
    
    withdraw(withdrawAmount);
    setAmount('');
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Withdraw Tokens</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Available Balance: <span className="font-semibold">{balance}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            id="withdraw-amount"
            type="number"
            min="0"
            max={balance.toString()}
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
          disabled={loading || !amount || parseFloat(amount) > balance}
          className={`w-full py-2 px-4 rounded-md font-medium text-white 
            ${loading || !amount || parseFloat(amount) > balance
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-solana-purple hover:bg-opacity-90'}`}
        >
          {loading ? 'Processing...' : 'Withdraw'}
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