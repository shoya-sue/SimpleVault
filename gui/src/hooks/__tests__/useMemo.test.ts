import { renderHook, act } from '@testing-library/react';
import { useDebounce, usePrevious, areEqual, useLocalStorage } from '../useMemo';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('初期値を返す', () => {
    const { result } = renderHook(() => useDebounce('初期値', 1000));
    expect(result.current).toBe('初期値');
  });

  test('遅延前は古い値を保持する', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: '初期値', delay: 1000 } }
    );

    // 値を変更
    rerender({ value: '新しい値', delay: 1000 });
    
    // タイマーが実行される前なので、まだ古い値
    expect(result.current).toBe('初期値');
  });

  test('遅延後は新しい値を返す', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: '初期値', delay: 1000 } }
    );

    // 値を変更
    rerender({ value: '新しい値', delay: 1000 });
    
    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // 新しい値に更新されるべき
    expect(result.current).toBe('新しい値');
  });
});

describe('usePrevious', () => {
  test('初期値はundefinedを返す', () => {
    const { result } = renderHook(() => usePrevious('初期値'));
    expect(result.current).toBeUndefined();
  });

  test('値が変更されたら前の値を返す', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: '初期値' } }
    );

    // 初期レンダリングでは前の値がないのでundefined
    expect(result.current).toBeUndefined();
    
    // 値を変更
    rerender({ value: '新しい値' });
    
    // 前の値が返るべき
    expect(result.current).toBe('初期値');
    
    // さらに値を変更
    rerender({ value: '最新の値' });
    
    // 前の値が返るべき
    expect(result.current).toBe('新しい値');
  });
});

describe('areEqual', () => {
  test('プリミティブ値の比較', () => {
    expect(areEqual(1, 1)).toBe(true);
    expect(areEqual(1, 2)).toBe(false);
    expect(areEqual('test', 'test')).toBe(true);
    expect(areEqual('test', 'other')).toBe(false);
    expect(areEqual(true, true)).toBe(true);
    expect(areEqual(true, false)).toBe(false);
  });

  test('オブジェクトの比較', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    const obj3 = { a: 1, b: 3 };
    
    expect(areEqual(obj1, obj1)).toBe(true); // 同一参照
    expect(areEqual(obj1, obj2)).toBe(true); // 同一内容
    expect(areEqual(obj1, obj3)).toBe(false); // 異なる内容
  });

  test('ネストされたオブジェクトの比較', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    const obj3 = { a: 1, b: { c: 3 } };
    
    expect(areEqual(obj1, obj2)).toBe(true); // 同一内容
    expect(areEqual(obj1, obj3)).toBe(false); // 異なる内容
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    // localStorageのモック
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  test('初期値が正しく設定される', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    const [value] = result.current;
    
    expect(value).toBe('initialValue');
  });

  test('値が正しく更新される', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    const [, setValue] = result.current;
    
    act(() => {
      setValue('newValue');
    });
    
    const [newValue] = result.current;
    expect(newValue).toBe('newValue');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  test('関数を使用して値を更新できる', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    const [, setValue] = result.current;
    
    act(() => {
      setValue(prev => `${prev}-updated`);
    });
    
    const [newValue] = result.current;
    expect(newValue).toBe('initialValue-updated');
  });
}); 