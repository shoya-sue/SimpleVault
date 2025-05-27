import React, { useState, useEffect } from 'react';
import { useTokenMint } from '../hooks/useTokenMint';
import { useWallet } from '@solana/wallet-adapter-react';
import { validateTokenAmount } from '../utils/validation';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ウォレット接続状態の変更を検知
  useEffect(() => {
    if (!publicKey) {
      setStatusMessage('ウォレットを接続してください');
    } else {
      setStatusMessage('');
    }
  }, [publicKey]);

  // エラーハンドリング
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  // トークン数量の変更ハンドラ
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    
    // バリデーション
    const validation = validateTokenAmount(value);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage);
    } else {
      setErrorMessage(null);
      setAmount(value);
    }
  };

  // 数量の増減
  const incrementAmount = () => {
    const newAmount = amount + 1;
    const validation = validateTokenAmount(newAmount);
    if (validation.isValid) {
      setAmount(newAmount);
      setErrorMessage(null);
    }
  };

  const decrementAmount = () => {
    if (amount <= 1) return;
    
    const newAmount = amount - 1;
    const validation = validateTokenAmount(newAmount);
    if (validation.isValid) {
      setAmount(newAmount);
      setErrorMessage(null);
    }
  };

  // ミント作成
  const handleCreateMint = async () => {
    if (!publicKey) {
      setErrorMessage('ウォレットを接続してください');
      return;
    }

    setStatusMessage('ミントを作成中...');
    setErrorMessage(null);
    const result = await createMint();
    
    if (result) {
      setMintCreated(true);
      setStatusMessage(`ミントが作成されました: ${result.toString()}`);
    } else {
      if (!error) {
        setErrorMessage('ミントの作成に失敗しました');
      }
    }
  };

  // トークンのミント
  const handleMintTokens = async () => {
    if (!publicKey || !mintAddress) {
      setErrorMessage('ウォレットが接続されていないか、ミントが作成されていません');
      return;
    }

    // トークン数量の検証
    const validation = validateTokenAmount(amount);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage);
      return;
    }

    setStatusMessage('トークンをミント中...');
    setErrorMessage(null);
    const success = await mintTokens(amount);
    
    if (success) {
      setMintSuccess(true);
      setStatusMessage(`${amount}トークンがミントされました`);
    } else {
      if (!error) {
        setErrorMessage('トークンのミントに失敗しました');
      }
    }
  };

  // 入力が有効かどうかのチェック
  const isCreateMintValid = (): boolean => {
    return !!publicKey && !loading && !mintCreated;
  };

  const isMintTokensValid = (): boolean => {
    return !!publicKey && !loading && !!mintCreated && validateTokenAmount(amount).isValid;
  };

  return (
    <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-4 sm:p-6 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">SPLトークンミンター</h2>
      
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
          type="info"
          onClose={() => setStatusMessage('')}
        />
      )}

      {/* ミント作成ボタン */}
      <div className="mb-6">
        <button
          onClick={handleCreateMint}
          disabled={!isCreateMintValid()}
          className={`w-full py-2 px-4 rounded font-bold transition-colors ${
            !isCreateMintValid()
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              : 'bg-solana-purple hover:bg-purple-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingIndicator size="sm" color="text-white" />
              <span className="ml-2">ミント作成中...</span>
            </div>
          ) : (
            'トークンミントを作成'
          )}
        </button>
      </div>

      {/* ミントアドレス表示 */}
      {mintAddress && (
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            ミントアドレス
          </label>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs break-all text-gray-800 dark:text-gray-300">
            {mintAddress.toString()}
          </div>
        </div>
      )}

      {/* トークン数量入力 */}
      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          ミントするトークン数
        </label>
        <div className="flex">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={handleAmountChange}
            disabled={loading || !mintCreated}
            className="shadow appearance-none border dark:border-gray-700 rounded-l w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={incrementAmount}
            disabled={loading || !mintCreated}
            className="bg-gray-200 dark:bg-gray-700 px-3 rounded-tr border-t border-r border-b dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            +
          </button>
          <button
            onClick={decrementAmount}
            disabled={loading || !mintCreated || amount <= 1}
            className="bg-gray-200 dark:bg-gray-700 px-3 rounded-br border-r border-b dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            -
          </button>
        </div>
      </div>

      {/* トークンミントボタン */}
      <div>
        <button
          onClick={handleMintTokens}
          disabled={!isMintTokensValid()}
          className={`w-full py-2 px-4 rounded font-bold transition-colors ${
            !isMintTokensValid()
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              : 'bg-solana-green hover:bg-green-600 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingIndicator size="sm" color="text-white" />
              <span className="ml-2">ミント中...</span>
            </div>
          ) : (
            'トークンをミント'
          )}
        </button>
      </div>
      
      {/* ミント成功メッセージ */}
      {mintSuccess && (
        <div className="mt-4">
          <ErrorMessage
            message="トークンのミントに成功しました！"
            type="success"
          />
        </div>
      )}
    </div>
  );
};

export default TokenMinter; 