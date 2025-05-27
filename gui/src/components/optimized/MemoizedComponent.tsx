import React, { memo, useState, useCallback } from 'react';
import { areEqual } from '../../hooks/useMemo';

interface MemoizationDemoProps {
  title: string;
  onAction?: () => void;
}

/**
 * メモ化されたコンポーネント
 * React.memoを使用して不要な再レンダリングを防止
 */
export const MemoizedComponent = memo(function MemoizedComponent({
  title,
  onAction
}: MemoizationDemoProps) {
  console.log(`Rendering MemoizedComponent: ${title}`);
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-dark-card">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
        {title}
      </h3>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-solana-purple text-white rounded hover:bg-purple-700 transition-colors"
        >
          アクション実行
        </button>
      )}
    </div>
  );
});

/**
 * カスタム比較関数を使用したメモ化コンポーネント
 * 深い比較を行いオブジェクトの内容が同じ場合は再レンダリングを防止
 */
export const DeepMemoizedComponent = memo(
  function DeepMemoizedComponent({
    title,
    onAction
  }: MemoizationDemoProps) {
    console.log(`Rendering DeepMemoizedComponent: ${title}`);
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-dark-card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
          {title} (深い比較)
        </h3>
        {onAction && (
          <button
            onClick={onAction}
            className="mt-2 px-4 py-2 bg-solana-green text-white rounded hover:bg-green-600 transition-colors"
          >
            アクション実行
          </button>
        )}
      </div>
    );
  },
  // カスタム比較関数
  (prevProps, nextProps) => areEqual(prevProps, nextProps)
);

/**
 * メモ化のデモンストレーション用コンポーネント
 */
const MemoizationDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState('メモ化コンポーネント');

  // useCallbackでメモ化されたコールバック
  const memoizedCallback = useCallback(() => {
    console.log('Memoized callback executed');
  }, []);

  // 毎回新しい関数が作成されるコールバック
  const regularCallback = () => {
    console.log('Regular callback executed');
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          カウント: {count}
        </p>
        <button
          onClick={() => setCount(c => c + 1)}
          className="mr-2 px-4 py-2 bg-solana-purple text-white rounded hover:bg-purple-700 transition-colors"
        >
          カウント増加
        </button>
        <button
          onClick={() => setTitle(current => `${current} (更新)`)}
          className="px-4 py-2 bg-solana-green text-white rounded hover:bg-green-600 transition-colors"
        >
          タイトル更新
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MemoizedComponent
          title={title}
          onAction={memoizedCallback}
        />
        
        <MemoizedComponent
          title={title}
          onAction={regularCallback} // 毎回新しい関数が作成される
        />

        <DeepMemoizedComponent
          title={title}
          onAction={memoizedCallback}
        />

        <DeepMemoizedComponent
          title={title}
          onAction={regularCallback} // 毎回新しい関数が作成される
        />
      </div>

      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
          メモ化の説明
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          1. 「カウント増加」ボタンを押すと、すべてのコンポーネントが再レンダリングされます。<br/>
          2. ただし、memoized関数を使用したコンポーネントは、propsが変わらない限り再レンダリングされません。<br/>
          3. 通常の関数を使用したコンポーネントは、毎回新しい関数参照が作成されるため再レンダリングされます。<br/>
          4. 「タイトル更新」ボタンを押すと、すべてのコンポーネントが再レンダリングされます（タイトルpropsが変わるため）。
        </p>
      </div>
    </div>
  );
};

export default MemoizationDemo; 