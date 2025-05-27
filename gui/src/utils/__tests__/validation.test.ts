import { 
  validateSolAmount, 
  validateSolAmountWithBalance, 
  validateProgramId, 
  validateTokenAmount 
} from '../validation';

describe('validateSolAmount', () => {
  test('validates valid SOL amount', () => {
    expect(validateSolAmount('1.234')).toEqual({
      isValid: true,
      errorMessage: null
    });
  });

  test('rejects empty amount', () => {
    expect(validateSolAmount('')).toEqual({
      isValid: false,
      errorMessage: '金額を入力してください'
    });
  });

  test('rejects non-numeric amount', () => {
    expect(validateSolAmount('abc')).toEqual({
      isValid: false,
      errorMessage: '有効な数値を入力してください'
    });
  });

  test('rejects negative amount', () => {
    expect(validateSolAmount('-1.5')).toEqual({
      isValid: false,
      errorMessage: '0より大きい金額を入力してください'
    });
  });

  test('rejects zero amount', () => {
    expect(validateSolAmount('0')).toEqual({
      isValid: false,
      errorMessage: '0より大きい金額を入力してください'
    });
  });

  test('rejects too many decimal places', () => {
    expect(validateSolAmount('1.1234567890')).toEqual({
      isValid: false,
      errorMessage: '小数点以下は9桁までしか指定できません'
    });
  });

  test('accepts maximum decimal places', () => {
    expect(validateSolAmount('1.123456789')).toEqual({
      isValid: true,
      errorMessage: null
    });
  });
});

describe('validateSolAmountWithBalance', () => {
  test('validates amount within balance', () => {
    expect(validateSolAmountWithBalance('1.0', 2.0)).toEqual({
      isValid: true,
      errorMessage: null
    });
  });

  test('rejects amount exceeding balance', () => {
    expect(validateSolAmountWithBalance('1.5', 1.4)).toEqual({
      isValid: false,
      errorMessage: '残高が不足しています（0.01 SOL以上の残高を保持する必要があります）'
    });
  });

  test('rejects amount leaving insufficient minimum', () => {
    expect(validateSolAmountWithBalance('1.0', 1.005)).toEqual({
      isValid: false,
      errorMessage: '残高が不足しています（0.01 SOL以上の残高を保持する必要があります）'
    });
  });

  test('respects custom minimum remaining balance', () => {
    expect(validateSolAmountWithBalance('1.0', 1.1, 0.2)).toEqual({
      isValid: false,
      errorMessage: '残高が不足しています（0.2 SOL以上の残高を保持する必要があります）'
    });
  });

  test('forwards basic validation errors', () => {
    expect(validateSolAmountWithBalance('', 1.0)).toEqual({
      isValid: false,
      errorMessage: '金額を入力してください'
    });
  });
});

describe('validateProgramId', () => {
  test('validates valid program ID', () => {
    expect(validateProgramId('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')).toEqual({
      isValid: true,
      errorMessage: null
    });
  });

  test('rejects empty program ID', () => {
    expect(validateProgramId('')).toEqual({
      isValid: false,
      errorMessage: 'プログラムIDを入力してください'
    });
  });

  test('rejects invalid Base58 format', () => {
    expect(validateProgramId('Invalid-ID-with-hyphens')).toEqual({
      isValid: false,
      errorMessage: '有効なSolanaプログラムIDの形式ではありません'
    });
  });

  test('rejects too short program ID', () => {
    expect(validateProgramId('abc123')).toEqual({
      isValid: false,
      errorMessage: '有効なSolanaプログラムIDの形式ではありません'
    });
  });
});

describe('validateTokenAmount', () => {
  test('validates valid token amount as number', () => {
    expect(validateTokenAmount(100)).toEqual({
      isValid: true,
      errorMessage: null
    });
  });

  test('validates valid token amount as string', () => {
    expect(validateTokenAmount('100')).toEqual({
      isValid: true,
      errorMessage: null
    });
  });

  test('rejects non-numeric amount', () => {
    expect(validateTokenAmount('abc')).toEqual({
      isValid: false,
      errorMessage: '有効な数値を入力してください'
    });
  });

  test('rejects negative amount', () => {
    expect(validateTokenAmount(-5)).toEqual({
      isValid: false,
      errorMessage: '0より大きい数量を入力してください'
    });
  });

  test('rejects zero amount', () => {
    expect(validateTokenAmount(0)).toEqual({
      isValid: false,
      errorMessage: '0より大きい数量を入力してください'
    });
  });

  test('rejects non-integer amount', () => {
    expect(validateTokenAmount(1.5)).toEqual({
      isValid: false,
      errorMessage: 'トークン数量は整数で入力してください'
    });
  });
}); 