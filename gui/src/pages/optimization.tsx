import React, { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useLocalStorage, useDebounce } from '../hooks/useMemo';
import MemoizationDemo from '../components/optimized/MemoizedComponent';
import Layout from '../components/Layout';

/**
 * パフォーマンス最適化テクニックのデモページ
 */
const OptimizationPage: React.FC = () => {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 500);
  
  // 設定を永続化
  const [settings, setSettings] = useLocalStorage('optimization-settings', {
    darkMode: false,
    notifications: true,
    autoSave: true,
  });

  // 重い計算の例（フィボナッチ数列）
  const calculateFibonacci = (n: number): number => {
    if (n <= 1) return n;
    return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
  };

  // useMemoを使用した計算結果のメモ化
  const fibResult = useMemo(() => {
    console.log('Calculating Fibonacci...');
    return calculateFibonacci(count > 30 ? 30 : count); // 30以上だと計算に時間がかかりすぎるため制限
  }, [count]);

  // useCallbackを使用したコールバック関数のメモ化
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  // 設定変更ハンドラ
  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <Layout>
      <Head>
        <title>パフォーマンス最適化 - SimpleVault</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          パフォーマンス最適化テクニック
        </h1>
        
        {/* useMemoデモ */}
        <section className="mb-12 p-6 bg-white dark:bg-dark-card rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">
            useMemoによる計算の最適化
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            useMemoを使用すると、依存配列の値が変わらない限り計算結果を再利用します。
            下の例では、カウントを変更するとフィボナッチ数列の計算が実行されます。
          </p>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setCount(Math.max(0, count - 1))}
              className="px-4 py-2 bg-solana-purple text-white rounded hover:bg-purple-700"
              disabled={count <= 0}
            >
              減少
            </button>
            
            <span className="text-xl font-bold">{count}</span>
            
            <button
              onClick={handleIncrement}
              className="px-4 py-2 bg-solana-green text-white rounded hover:bg-green-600"
            >
              増加
            </button>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-gray-800 dark:text-gray-200">
              Fibonacci({count}) = <span className="font-bold">{fibResult}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              カウンタを変更するとコンソールに計算ログが表示されます。
              再レンダリングしても依存値が変わらなければ計算は実行されません。
            </p>
          </div>
        </section>
        
        {/* useDebounceデモ */}
        <section className="mb-12 p-6 bg-white dark:bg-dark-card rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">
            useDebounceによる入力処理の最適化
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            useDebounceを使用すると、連続した変更イベントを遅延させて最適化できます。
            例えば、ユーザーの入力が一時停止するまで処理を遅らせることができます。
          </p>
          
          <div className="mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="入力してください..."
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-gray-800 dark:text-gray-200">
              即時値: <span className="font-bold">{inputValue}</span>
            </p>
            <p className="text-gray-800 dark:text-gray-200 mt-2">
              デバウンス後の値 (500ms): <span className="font-bold">{debouncedValue}</span>
            </p>
          </div>
        </section>
        
        {/* useLocalStorageデモ */}
        <section className="mb-12 p-6 bg-white dark:bg-dark-card rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">
            useLocalStorageによる状態の永続化
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            useLocalStorageを使用すると、Reactの状態をブラウザのLocalStorageに自動的に永続化できます。
            ページをリロードしても設定が保持されます。
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                checked={settings.darkMode}
                onChange={() => toggleSetting('darkMode')}
                className="mr-2"
              />
              <label htmlFor="darkMode" className="text-gray-800 dark:text-gray-200">
                ダークモード
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={() => toggleSetting('notifications')}
                className="mr-2"
              />
              <label htmlFor="notifications" className="text-gray-800 dark:text-gray-200">
                通知を有効化
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                checked={settings.autoSave}
                onChange={() => toggleSetting('autoSave')}
                className="mr-2"
              />
              <label htmlFor="autoSave" className="text-gray-800 dark:text-gray-200">
                自動保存
              </label>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            <p className="text-gray-800 dark:text-gray-200">
              これらの設定はLocalStorageに保存され、ブラウザを閉じても保持されます。
              開発者ツールのApplicationタブでLocalStorageを確認できます。
            </p>
            <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-900 rounded overflow-x-auto">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </section>
        
        {/* メモ化コンポーネントデモ */}
        <section className="p-6 bg-white dark:bg-dark-card rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">
            React.memoによるコンポーネントの最適化
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            React.memoを使用すると、プロパティが変更されない限りコンポーネントの再レンダリングをスキップできます。
            これにより、大規模なアプリケーションのパフォーマンスが向上します。
          </p>
          
          <MemoizationDemo />
        </section>
      </div>
    </Layout>
  );
};

export default OptimizationPage; 