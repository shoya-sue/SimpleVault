// @testing-library/jest-domのインポート
require('@testing-library/jest-dom');

// モックの設定
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => ({
    connection: {}
  }),
  useWallet: () => ({
    publicKey: null,
    connected: false,
    disconnect: jest.fn(),
    sendTransaction: jest.fn(),
  }),
}));

// グローバルなウィンドウオブジェクトのモック
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// 未実装のDOMメソッドのモック
if (typeof window !== 'undefined' && typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}

// クリップボードAPIのモック
if (typeof navigator !== 'undefined' && typeof navigator.clipboard === 'undefined') {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn(),
      readText: jest.fn(),
    },
  });
} 