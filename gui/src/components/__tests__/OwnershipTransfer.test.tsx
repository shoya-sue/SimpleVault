import { render, screen, fireEvent } from '@testing-library/react';
import { OwnershipTransfer } from '../OwnershipTransfer';
import * as useVaultModule from '../../hooks/useVault';
import { PublicKey } from '@solana/web3.js';

// useVaultフックのモック
jest.mock('../../hooks/useVault', () => ({
  useVault: jest.fn()
}));

describe('OwnershipTransfer', () => {
  // テスト用のモックデータ
  const mockInitiateOwnershipTransfer = jest.fn();
  const mockAcceptOwnership = jest.fn();
  const mockCancelOwnershipTransfer = jest.fn();
  const mockInitialize = jest.fn();
  const testPublicKey = new PublicKey('DuTQQxP6U14Dkk72udMwUxrRkJ48j7mT7WdcyQLHTkpt');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトでは初期化済みの状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      initiateOwnershipTransfer: mockInitiateOwnershipTransfer,
      acceptOwnership: mockAcceptOwnership,
      cancelOwnershipTransfer: mockCancelOwnershipTransfer,
      initialize: mockInitialize,
      loading: false,
      error: null,
      vaultState: {
        owner: testPublicKey,
        tokenAccount: testPublicKey,
        bump: 255,
        lockUntil: { toNumber: () => 0 },
        delegates: [],
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
      addDelegate: jest.fn(),
      removeDelegate: jest.fn(),
      setTimelock: jest.fn(),
      setMultisig: jest.fn(),
      setWithdrawalLimit: jest.fn(),
      approveTransaction: jest.fn(),
      balance: 0,
      vaultPDA: null,
      vaultTokenAccount: null,
      userTokenAccount: null,
      isConnected: true,
    });
  });

  test('初期化済みの場合は正しくレンダリングされること', () => {
    render(<OwnershipTransfer />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('所有権移転')).toBeInTheDocument();
    
    // 移転開始フォームが表示されていることを確認
    expect(screen.getByText('新しい所有者のアドレスを入力してください')).toBeInTheDocument();
  });

  test('未初期化の場合は初期化ボタンが表示されること', () => {
    // 未初期化状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      initiateOwnershipTransfer: mockInitiateOwnershipTransfer,
      acceptOwnership: mockAcceptOwnership,
      cancelOwnershipTransfer: mockCancelOwnershipTransfer,
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
      setWithdrawalLimit: jest.fn(),
      approveTransaction: jest.fn(),
      balance: 0,
      vaultPDA: null,
      vaultTokenAccount: null,
      userTokenAccount: null,
      isConnected: true,
    });
    
    render(<OwnershipTransfer />);
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('所有権移転')).toBeInTheDocument();
    
    // 初期化ボタンが表示されていることを確認
    expect(screen.getByText('Vaultを初期化')).toBeInTheDocument();
    
    // 移転フォームが表示されていないことを確認
    expect(screen.queryByText('新しい所有者のアドレスを入力してください')).not.toBeInTheDocument();
  });

  test('所有権移転の開始が正しく動作すること', () => {
    render(<OwnershipTransfer />);
    
    // アドレス入力
    const input = screen.getByPlaceholderText('新しい所有者のアドレス');
    fireEvent.change(input, { target: { value: testPublicKey.toString() } });
    
    // 送信ボタンをクリック
    const submitButton = screen.getByText('所有権移転を開始');
    fireEvent.click(submitButton);
    
    // initiateOwnershipTransfer関数が正しい引数で呼び出されたことを確認
    expect(mockInitiateOwnershipTransfer).toHaveBeenCalledWith(testPublicKey.toString());
  });

  test('無効なアドレスの場合はエラーが表示されること', () => {
    render(<OwnershipTransfer />);
    
    // 空のアドレスで送信
    const submitButton = screen.getByText('所有権移転を開始');
    fireEvent.click(submitButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('新しい所有者のアドレスを入力してください')).toBeInTheDocument();
    
    // initiateOwnershipTransfer関数が呼び出されていないことを確認
    expect(mockInitiateOwnershipTransfer).not.toHaveBeenCalled();
  });

  test('保留中の所有権移転がある場合、キャンセルボタンが表示されること', () => {
    // 保留中の所有権移転がある状態をモック
    jest.spyOn(useVaultModule, 'useVault').mockReturnValue({
      initiateOwnershipTransfer: mockInitiateOwnershipTransfer,
      acceptOwnership: mockAcceptOwnership,
      cancelOwnershipTransfer: mockCancelOwnershipTransfer,
      initialize: mockInitialize,
      loading: false,
      error: null,
      vaultState: {
        owner: testPublicKey,
        tokenAccount: testPublicKey,
        bump: 255,
        lockUntil: { toNumber: () => 0 },
        delegates: [],
        multisigThreshold: 1,
        multisigSigners: [],
        pendingTransactions: [],
        maxWithdrawalLimit: { toNumber: () => 1000 },
        transferOwnershipTo: testPublicKey
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
      setWithdrawalLimit: jest.fn(),
      approveTransaction: jest.fn(),
      balance: 0,
      vaultPDA: null,
      vaultTokenAccount: null,
      userTokenAccount: null,
      isConnected: true,
    });
    
    render(<OwnershipTransfer />);
    
    // キャンセルボタンが表示されていることを確認
    expect(screen.getByText('所有権移転をキャンセル')).toBeInTheDocument();
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('所有権移転をキャンセル');
    fireEvent.click(cancelButton);
    
    // cancelOwnershipTransfer関数が呼び出されたことを確認
    expect(mockCancelOwnershipTransfer).toHaveBeenCalled();
  });
}); 