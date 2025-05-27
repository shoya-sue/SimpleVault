import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  text?: string;
}

/**
 * ローディングインジケータ
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  color = 'text-solana-purple',
  fullScreen = false,
  text
}) => {
  // サイズに応じたクラス
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  // コンポーネント
  const spinner = (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className={`animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 ${sizeClasses[size]}`}></div>
      <div className={`absolute top-0 left-0 rounded-full border-4 border-t-transparent border-b-transparent ${color} ${sizeClasses[size]}`}></div>
    </div>
  );

  // 全画面表示の場合
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="bg-white dark:bg-dark-card p-5 rounded-lg shadow-lg flex flex-col items-center">
          {spinner}
          {text && <p className="mt-3 text-gray-700 dark:text-dark-text">{text}</p>}
        </div>
      </div>
    );
  }

  // インラインで表示する場合
  return (
    <div className="flex items-center justify-center">
      {spinner}
      {text && <p className="ml-3 text-gray-700 dark:text-dark-text">{text}</p>}
    </div>
  );
};

export default LoadingIndicator; 