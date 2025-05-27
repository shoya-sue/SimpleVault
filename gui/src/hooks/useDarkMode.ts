import { useState, useEffect } from 'react';

/**
 * ダークモードを管理するカスタムフック
 */
export const useDarkMode = () => {
  // ローカルストレージのキー
  const DARK_MODE_KEY = 'simple-vault-dark-mode';
  
  // 初期値の設定
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // ブラウザ環境でない場合は早期リターン
    if (typeof window === 'undefined') return false;
    
    // ローカルストレージから読み込み
    const storedValue = localStorage.getItem(DARK_MODE_KEY);
    if (storedValue !== null) {
      return storedValue === 'true';
    }
    
    // プリファレンスから読み込み
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // ダークモードの切り替え
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ダークモードの適用
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // bodyのクラスを更新
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // ローカルストレージに保存
    localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleDarkMode
  };
}; 