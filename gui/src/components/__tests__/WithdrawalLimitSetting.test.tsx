import { render, screen, fireEvent } from '@testing-library/react';
import { WithdrawalLimitSetting } from '../WithdrawalLimitSetting';
import * as useVaultModule from '../../hooks/useVault';

// useVaultフックのモック
jest.mock('../../hooks/useVault', () => ({
  useVault: jest.fn()
}));

describe('WithdrawalLimitSetting', () => {
  // テスト用のモックデータ
  const mockSetWithdrawalLimit = jest.fn();
  const mockInitialize = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトでは初期化済みの状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      setWithdrawalLimit: mockSetWithdrawalLimit,
      initialize: mockInitialize,
      loading: false,
      error: null,
      vaultState: {
        maxWithdrawalLimit: { toNumber: () => 1000 }
      },
      isInitialized: true,
      // その他必要なpropsを追加
      deposit: jest.fn(),
      withdraw: jest.fn(),
      fetchBalance: jest.fn(),
      fetchVaultState: jest.fn(),
      addDelegate: jest.fn(),
      removeDelegate: jest.fn(),
      setTimelock: jest.fn(),
      setMultisig: jest.fn(),
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
    render(<WithdrawalLimitSetting />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('出金制限設定')).toBeInTheDocument();
    
    // 現在の設定が表示されていることを確認
    expect(screen.getByText('現在の設定: 1000')).toBeInTheDocument();
    
    // 入力フィールドが存在することを確認
    expect(screen.getByLabelText('最大出金額')).toBeInTheDocument();
  });

  test('未初期化の場合は初期化ボタンが表示されること', () => {
    // 未初期化状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      setWithdrawalLimit: mockSetWithdrawalLimit,
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
      setTimelock: jest.fn(),
      setMultisig: jest.fn(),
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
    
    render(<WithdrawalLimitSetting />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('出金制限設定')).toBeInTheDocument();
    
    // 初期化ボタンが表示されていることを確認
    expect(screen.getByText('Vaultを初期化')).toBeInTheDocument();
    
    // 設定フォームが表示されていないことを確認
    expect(screen.queryByText('現在の設定:')).not.toBeInTheDocument();
  });

  test('初期化ボタンがクリックされたとき、initialize関数が呼び出されること', () => {
    // 未初期化状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      setWithdrawalLimit: mockSetWithdrawalLimit,
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
      setTimelock: jest.fn(),
      setMultisig: jest.fn(),
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
    
    render(<WithdrawalLimitSetting />);
    
    // 初期化ボタンをクリック
    const initButton = screen.getByText('Vaultを初期化');
    fireEvent.click(initButton);
    
    // initialize関数が呼び出されたことを確認
    expect(mockInitialize).toHaveBeenCalled();
  });

  test('出金制限の設定が正しく動作すること', () => {
    render(<WithdrawalLimitSetting />);
    
    // 入力フィールドに値を入力
    const input = screen.getByLabelText('最大出金額');
    fireEvent.change(input, { target: { value: '500' } });
    
    // 送信ボタンをクリック
    const submitButton = screen.getByText('制限を設定');
    fireEvent.click(submitButton);
    
    // setWithdrawalLimit関数が正しい引数で呼び出されたことを確認
    expect(mockSetWithdrawalLimit).toHaveBeenCalledWith(500);
  });

  test('無効な入力の場合はエラーが表示されること', () => {
    render(<WithdrawalLimitSetting />);
    
    // 空の入力で送信
    const submitButton = screen.getByText('制限を設定');
    fireEvent.click(submitButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('出金制限額を入力してください')).toBeInTheDocument();
    
    // setWithdrawalLimit関数が呼び出されていないことを確認
    expect(mockSetWithdrawalLimit).not.toHaveBeenCalled();
  });
}); 