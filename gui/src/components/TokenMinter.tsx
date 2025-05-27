import React, { useState, useEffect } from 'react';
import { useTokenMint } from '../hooks/useTokenMint';
import { useWallet } from '@solana/wallet-adapter-react';

/**
 * SPLトークンミント用コンポーネント
 */
const TokenMinter: React.FC = () => {
  const { publicKey } = useWallet();
  const { 
    createMint, 
    mintTokens, 
    mintAddress, 
    loading, 
    error 
  } = useTokenMint();
  
  const [amount, setAmount] = useState<number>(1);
  const [mintCreated, setMintCreated] = useState<boolean>(false);
  const [mintSuccess, setMintSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // ウォレット接続状態の変更を検知
  useEffect(() => {
    if (!publicKey) {
      setStatusMessage('ウォレットを接続してください');
    } else {
      setStatusMessage('');
    }
  }, [publicKey]);

  // ミント作成
  const handleCreateMint = async () => {
    if (!publicKey) {
      setStatusMessage('ウォレットを接続してください');
      return;
    }

    setStatusMessage('ミントを作成中...');
    const result = await createMint();
    
    if (result) {
      setMintCreated(true);
      setStatusMessage(`ミントが作成されました: ${result.toString()}`);
    } else {
      setStatusMessage('ミントの作成に失敗しました');
    }
  };

  // トークンのミント
  const handleMintTokens = async () => {
    if (!publicKey || !mintAddress) {
      setStatusMessage('ウォレットが接続されていないか、ミントが作成されていません');
      return;
    }

    setStatusMessage('トークンをミント中...');
    const success = await mintTokens(amount);
    
    if (success) {
      setMintSuccess(true);
      setStatusMessage(`${amount}トークンがミントされました`);
    } else {
      setStatusMessage('トークンのミントに失敗しました');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">SPLトークンミンター</h2>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* ステータスメッセージ */}
      {statusMessage && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {statusMessage}
        </div>
      )}

      {/* ミント作成ボタン */}
      <div className="mb-6">
        <button
          onClick={handleCreateMint}
          disabled={loading || !publicKey || mintCreated}
          className={`w-full py-2 px-4 rounded font-bold ${
            loading || !publicKey || mintCreated
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-solana-purple hover:bg-purple-700 text-white'
          }`}
        >
          {loading ? 'ミント作成中...' : 'トークンミントを作成'}
        </button>
      </div>

      {/* ミントアドレス表示 */}
      {mintAddress && (
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            ミントアドレス
          </label>
          <div className="p-2 bg-gray-100 rounded overflow-auto text-xs">
            {mintAddress.toString()}
          </div>
        </div>
      )}

      {/* トークン数量入力 */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          ミントするトークン数
        </label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={loading || !mintCreated}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      {/* トークンミントボタン */}
      <div>
        <button
          onClick={handleMintTokens}
          disabled={loading || !publicKey || !mintCreated}
          className={`w-full py-2 px-4 rounded font-bold ${
            loading || !publicKey || !mintCreated
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-solana-green hover:bg-green-600 text-white'
          }`}
        >
          {loading ? 'ミント中...' : 'トークンをミント'}
        </button>
      </div>
      
      {/* ミント成功メッセージ */}
      {mintSuccess && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          トークンのミントに成功しました！
        </div>
      )}
    </div>
  );
};

export default TokenMinter; 