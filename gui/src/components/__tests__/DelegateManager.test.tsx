import { render, screen, fireEvent } from '@testing-library/react';
import { DelegateManager } from '../DelegateManager';
import * as useVaultModule from '../../hooks/useVault';
import { PublicKey } from '@solana/web3.js';

// useVaultフックのモック
jest.mock('../../hooks/useVault', () => ({
  useVault: jest.fn()
}));

describe('DelegateManager', () => {
  // テスト用のモックデータ
  const mockAddDelegate = jest.fn();
  const mockRemoveDelegate = jest.fn();
  const mockInitialize = jest.fn();
  const testDelegate = new PublicKey('DuTQQxP6U14Dkk72udMwUxrRkJ48j7mT7WdcyQLHTkpt');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトでは初期化済みの状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      addDelegate: mockAddDelegate,
      removeDelegate: mockRemoveDelegate,
      initialize: mockInitialize,
      loading: false,
      error: null,
      vaultState: {
        delegates: [testDelegate],
        owner: new PublicKey('DuTQQxP6U14Dkk72udMwUxrRkJ48j7mT7WdcyQLHTkpt'),
        tokenAccount: new PublicKey('DuTQQxP6U14Dkk72udMwUxrRkJ48j7mT7WdcyQLHTkpt'),
        bump: 255,
        lockUntil: { toNumber: () => 0 },
        multisigThreshold: 1,
        multisigSigners: [],
        pendingTransactions: [],
        maxWithdrawalLimit: { toNumber: () => 1000 },
        transferOwnershipTo: null
      },
      isInitialized: true,
      // その他必要なpropsを追加
      deposit: jest.fn(),
      withdraw: jest.fn(),
      fetchBalance: jest.fn(),
      fetchVaultState: jest.fn(),
      setTimelock: jest.fn(),
      setMultisig: jest.fn(),
      setWithdrawalLimit: jest.fn(),
      approveTransaction: jest.fn(),
      initiateOwnershipTransfer: jest.fn(),
      acceptOwnership: jest.fn(),
      cancelOwnershipTransfer: jest.fn(),
      balance: 0,
      vaultPDA: null,
      vaultTokenAccount: null,
      userTokenAccount: null,
      isConnected: true,
    });
  });

  test('初期化済みの場合は正しくレンダリングされること', () => {
    render(<DelegateManager />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('委任者管理')).toBeInTheDocument();
    
    // 委任者リストのヘッダーが表示されていることを確認
    expect(screen.getByText('委任者リスト')).toBeInTheDocument();
    
    // テスト用の委任者が表示されていることを確認
    expect(screen.getByText('DuTQ...Tkpt')).toBeInTheDocument();
  });

  test('未初期化の場合は初期化ボタンが表示されること', () => {
    // 未初期化状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      addDelegate: mockAddDelegate,
      removeDelegate: mockRemoveDelegate,
      initialize: mockInitialize,
      loading: false,
      error: null,
      vaultState: null,
      isInitialized: false,
      // その他必要なpropsを追加
      deposit: jest.fn(),
      withdraw: jest.fn(),
      fetchBalance: jest.fn(),
      fetchVaultState: jest.fn(),
      setTimelock: jest.fn(),
      setMultisig: jest.fn(),
      setWithdrawalLimit: jest.fn(),
      approveTransaction: jest.fn(),
      initiateOwnershipTransfer: jest.fn(),
      acceptOwnership: jest.fn(),
      cancelOwnershipTransfer: jest.fn(),
      balance: 0,
      vaultPDA: null,
      vaultTokenAccount: null,
      userTokenAccount: null,
      isConnected: true,
    });
    
    render(<DelegateManager />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('委任者管理')).toBeInTheDocument();
    
    // 初期化ボタンが表示されていることを確認
    expect(screen.getByText('Vaultを初期化')).toBeInTheDocument();
    
    // 委任者リストが表示されていないことを確認
    expect(screen.queryByText('委任者リスト')).not.toBeInTheDocument();
  });

  test('初期化ボタンがクリックされたとき、initialize関数が呼び出されること', () => {
    // 未初期化状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      addDelegate: mockAddDelegate,
      removeDelegate: mockRemoveDelegate,
      initialize: mockInitialize,
      loading: false,
      error: null,
      vaultState: null,
      isInitialized: false,
      // その他必要なpropsを追加
      deposit: jest.fn(),
      withdraw: jest.fn(),
      fetchBalance: jest.fn(),
      fetchVaultState: jest.fn(),
      setTimelock: jest.fn(),
      setMultisig: jest.fn(),
      setWithdrawalLimit: jest.fn(),
      approveTransaction: jest.fn(),
      initiateOwnershipTransfer: jest.fn(),
      acceptOwnership: jest.fn(),
      cancelOwnershipTransfer: jest.fn(),
      balance: 0,
      vaultPDA: null,
      vaultTokenAccount: null,
      userTokenAccount: null,
      isConnected: true,
    });
    
    render(<DelegateManager />);
    
    // 初期化ボタンをクリック
    const initButton = screen.getByText('Vaultを初期化');
    fireEvent.click(initButton);
    
    // initialize関数が呼び出されたことを確認
    expect(mockInitialize).toHaveBeenCalled();
  });

  test('委任者の追加が正しく動作すること', () => {
    render(<DelegateManager />);
    
    // 有効なアドレスを入力
    const input = screen.getByPlaceholderText('Solanaウォレットアドレス');
    fireEvent.change(input, { target: { value: 'DuTQQxP6U14Dkk72udMwUxrRkJ48j7mT7WdcyQLHTkpt' } });
    
    // 追加ボタンをクリック
    const addButton = screen.getByText('委任者を追加');
    fireEvent.click(addButton);
    
    // addDelegate関数が正しい引数で呼び出されたことを確認
    expect(mockAddDelegate).toHaveBeenCalledWith('DuTQQxP6U14Dkk72udMwUxrRkJ48j7mT7WdcyQLHTkpt');
  });

  test('無効なアドレスが入力された場合はエラーが表示されること', () => {
    render(<DelegateManager />);
    
    // 空のアドレスで送信
    const addButton = screen.getByText('委任者を追加');
    fireEvent.click(addButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('委任者のアドレスを入力してください')).toBeInTheDocument();
    
    // addDelegate関数が呼び出されていないことを確認
    expect(mockAddDelegate).not.toHaveBeenCalled();
  });

  test('委任者の削除が正しく動作すること', () => {
    render(<DelegateManager />);
    
    // 削除ボタンをクリック
    const removeButton = screen.getByText('削除');
    fireEvent.click(removeButton);
    
    // removeDelegate関数が正しい引数で呼び出されたことを確認
    expect(mockRemoveDelegate).toHaveBeenCalledWith(testDelegate.toString());
  });
}); 