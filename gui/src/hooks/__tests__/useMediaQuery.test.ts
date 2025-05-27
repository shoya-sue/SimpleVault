import { renderHook } from '@testing-library/react';
import { useMediaQuery, useResponsive } from '../useMediaQuery';

// ブラウザのメディアクエリマッチング状態をモックする
const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

// クエリごとに異なる結果を返すカスタムモック
const mockMatchMediaWithQueryCheck = (matchFn: (query: string) => boolean) => {
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: matchFn(query),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('useMediaQuery', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns false by default (SSR safe)', () => {
    // 初期値は常にfalseになるはず
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  test('returns true when media query matches', () => {
    // メディアクエリがマッチする状態をモック
    mockMatchMedia(true);
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    // 初期値はfalseからtrueに変わる（useEffectが実行されるため）
    expect(result.current).toBe(true);
  });

  test('returns false when media query does not match', () => {
    // メディアクエリが不一致の状態をモック
    mockMatchMedia(false);
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);
  });

  test('registers and removes event listeners', () => {
    const addEventListenerMock = jest.fn();
    const removeEventListenerMock = jest.fn();
    
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      dispatchEvent: jest.fn(),
    }));
    
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    // イベントリスナーが登録されているか確認
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    
    // アンマウント時にイベントリスナーが削除されるか確認
    unmount();
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useResponsive', () => {
  test('provides mobile breakpoint values', () => {
    // モバイル表示のモック
    mockMatchMediaWithQueryCheck((query: string) => query === '(max-width: 639px)');
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current).toEqual({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });
  });

  test('provides tablet breakpoint values', () => {
    // タブレット表示のモック
    mockMatchMediaWithQueryCheck((query: string) => query === '(min-width: 640px) and (max-width: 1023px)');
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current).toEqual({
      isMobile: false,
      isTablet: true,
      isDesktop: false
    });
  });

  test('provides desktop breakpoint values', () => {
    // デスクトップ表示のモック
    mockMatchMediaWithQueryCheck((query: string) => query === '(min-width: 1024px)');
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current).toEqual({
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });
  });
}); 