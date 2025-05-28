import { render, screen, fireEvent } from '@testing-library/react';
import { TimelockForm } from '../TimelockForm';
import * as useVaultModule from '../../hooks/useVault';

// useVaultフックのモック
jest.mock('../../hooks/useVault', () => ({
  useVault: jest.fn()
}));

describe('TimelockForm', () => {
  // テスト用のモックデータ
  const mockSetTimelock = jest.fn();
  const mockInitialize = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトでは初期化済みの状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      setTimelock: mockSetTimelock,
      initialize: mockInitialize,
      loading: false,
      error: null,
      vaultState: {
        lockUntil: { toNumber: () => 0 }
      },
      isInitialized: true,
      // その他必要なpropsを追加
      deposit: jest.fn(),
      withdraw: jest.fn(),
      fetchBalance: jest.fn(),
      fetchVaultState: jest.fn(),
      addDelegate: jest.fn(),
      removeDelegate: jest.fn(),
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
    render(<TimelockForm />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('タイムロック設定')).toBeInTheDocument();
    
    // 期間選択用のドロップダウンが存在することを確認
    expect(screen.getByText('期間を選択...')).toBeInTheDocument();
  });

  test('未初期化の場合は初期化ボタンが表示されること', () => {
    // 未初期化状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      setTimelock: mockSetTimelock,
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
      addDelegate: jest.fn(),
      removeDelegate: jest.fn(),
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
    
    render(<TimelockForm />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('タイムロック設定')).toBeInTheDocument();
    
    // 初期化ボタンが表示されていることを確認
    expect(screen.getByText('Vaultを初期化')).toBeInTheDocument();
    
    // 期間選択用のドロップダウンが表示されていないことを確認
    expect(screen.queryByText('期間を選択...')).not.toBeInTheDocument();
  });

  test('初期化ボタンがクリックされたとき、initialize関数が呼び出されること', () => {
    // 未初期化状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      setTimelock: mockSetTimelock,
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
      addDelegate: jest.fn(),
      removeDelegate: jest.fn(),
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
    
    render(<TimelockForm />);
    
    // 初期化ボタンをクリック
    const initButton = screen.getByText('Vaultを初期化');
    fireEvent.click(initButton);
    
    // initialize関数が呼び出されたことを確認
    expect(mockInitialize).toHaveBeenCalled();
  });

  test('タイムロックの設定が正しく動作すること', () => {
    render(<TimelockForm />);
    
    // ドロップダウンで期間を選択
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '3600' } });
    
    // 送信ボタンをクリック
    const submitButton = screen.getByText('タイムロックを設定');
    fireEvent.click(submitButton);
    
    // setTimelock関数が正しい引数で呼び出されたことを確認
    expect(mockSetTimelock).toHaveBeenCalledWith(3600);
  });

  test('期間が選択されていない場合はエラーが表示されること', () => {
    render(<TimelockForm />);
    
    // 期間を選択せずに送信ボタンをクリック
    const submitButton = screen.getByText('タイムロックを設定');
    fireEvent.click(submitButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('ロック期間を選択してください')).toBeInTheDocument();
    
    // setTimelock関数が呼び出されていないことを確認
    expect(mockSetTimelock).not.toHaveBeenCalled();
  });
}); 