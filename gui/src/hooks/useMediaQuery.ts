import { useState, useEffect } from 'react';

/**
 * メディアクエリの変更を監視するカスタムフック
 * @param query メディアクエリ文字列 (例: '(min-width: 768px)')
 * @returns クエリに一致するかどうかのブール値
 */
export const useMediaQuery = (query: string): boolean => {
  // SSRでの実行時に問題が起きないよう、初期値をfalseに設定
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // ブラウザ環境でない場合は早期リターン
    if (typeof window === 'undefined') return;

    // メディアクエリの作成
    const media = window.matchMedia(query);
    
    // 現在の状態をセット
    setMatches(media.matches);

    // リスナー関数
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // リスナーの登録
    // 新しいブラウザではaddEventListener、古いブラウザではaddListener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // @ts-ignore - 古いブラウザ用
      media.addListener(listener);
    }

    // クリーンアップ関数
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // @ts-ignore - 古いブラウザ用
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

/**
 * 一般的なブレイクポイントを使用する便利なフック
 * @returns isMobile, isTablet, isDesktopのブール値
 */
export const useResponsive = () => {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return {
    isMobile,
    isTablet,
    isDesktop
  };
}; 