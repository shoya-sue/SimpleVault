import { useCallback, useMemo, useState, useEffect, useRef } from 'react';

/**
 * 値の変更を監視して、指定された時間内に変更がなければコールバックを実行するフック
 * @param value 監視する値
 * @param delay 遅延時間（ミリ秒）
 * @returns 安定化した値
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 前回の値を記憶するフック
 * @param value 現在の値
 * @returns 前回の値
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * 無限スクロールを実装するためのフック
 * @param callback ロード関数
 * @param deps 依存配列
 * @returns ロード関数と読み込み中フラグ
 */
export function useInfiniteScroll<T>(
  callback: () => Promise<T[]>,
  deps: React.DependencyList = []
): { loadMore: () => Promise<void>; isLoading: boolean; } {
  const [isLoading, setIsLoading] = useState(false);
  
  const loadMore = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await callback();
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, callback, ...deps]);
  
  return { loadMore, isLoading };
}

/**
 * LocalStorageを使用した永続化フック
 * @param key ストレージキー
 * @param initialValue 初期値
 * @returns 値と設定関数のタプル
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // ステート初期化ロジック
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // 値設定と同時にlocalStorageも更新
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue];
}

/**
 * メモ化されたオブジェクト等値比較
 * @param a 比較対象1
 * @param b 比較対象2
 * @returns 等しいかどうか
 */
export function areEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => {
    return Object.prototype.hasOwnProperty.call(b, key) &&
      areEqual((a as any)[key], (b as any)[key]);
  });
}

/**
 * 依存配列の比較に使用できるメモ化関数
 * @param value メモ化する値
 * @param deps 依存配列
 * @returns メモ化された値
 */
export function useMemoCompare<T>(value: T, deps: React.DependencyList = []): T {
  return useMemo(() => value, deps);
}

/**
 * データ取得用の汎用フック
 * @param fetchFn データ取得関数
 * @param deps 依存配列
 * @returns データ、ローディング状態、エラー
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, deps);
  
  return { data, loading, error };
} 