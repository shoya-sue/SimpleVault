/**
 * SOL金額の検証
 * @param amount 検証対象の金額文字列
 * @returns 検証結果と検証失敗時のエラーメッセージ
 */
export const validateSolAmount = (
  amount: string
): { isValid: boolean; errorMessage: string | null } => {
  // 空の場合
  if (!amount || amount.trim() === '') {
    return {
      isValid: false,
      errorMessage: '金額を入力してください',
    };
  }

  // 数値ではない場合
  const numValue = parseFloat(amount);
  if (isNaN(numValue)) {
    return {
      isValid: false,
      errorMessage: '有効な数値を入力してください',
    };
  }

  // 負の値や0の場合
  if (numValue <= 0) {
    return {
      isValid: false,
      errorMessage: '0より大きい金額を入力してください',
    };
  }

  // 小数点以下9桁以上の場合（SOLの最小単位は1 lamport = 0.000000001 SOL）
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 9) {
    return {
      isValid: false,
      errorMessage: '小数点以下は9桁までしか指定できません',
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
};

/**
 * SOL残高を考慮した検証
 * @param amount 検証対象の金額文字列
 * @param balance 現在の残高
 * @param minRemaining 最小残高（トランザクション手数料等）
 * @returns 検証結果と検証失敗時のエラーメッセージ
 */
export const validateSolAmountWithBalance = (
  amount: string,
  balance: number,
  minRemaining: number = 0.01
): { isValid: boolean; errorMessage: string | null } => {
  // 基本的な金額検証
  const basicValidation = validateSolAmount(amount);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  const numValue = parseFloat(amount);

  // 残高を超えていないか（手数料分を考慮）
  if (numValue > balance - minRemaining) {
    return {
      isValid: false,
      errorMessage: `残高が不足しています（${minRemaining} SOL以上の残高を保持する必要があります）`,
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
};

/**
 * プログラムIDの形式検証
 * @param programId 検証対象のプログラムID
 * @returns 検証結果と検証失敗時のエラーメッセージ
 */
export const validateProgramId = (
  programId: string
): { isValid: boolean; errorMessage: string | null } => {
  // 空の場合
  if (!programId || programId.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'プログラムIDを入力してください',
    };
  }

  // Base58の形式チェック（44文字の英数字）
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
  if (!base58Regex.test(programId)) {
    return {
      isValid: false,
      errorMessage: '有効なSolanaプログラムIDの形式ではありません',
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
};

/**
 * トークン数量の検証
 * @param amount 検証対象のトークン数量
 * @returns 検証結果と検証失敗時のエラーメッセージ
 */
export const validateTokenAmount = (
  amount: number | string
): { isValid: boolean; errorMessage: string | null } => {
  // 文字列の場合は数値に変換
  const numValue = typeof amount === 'string' ? parseInt(amount, 10) : amount;

  // 数値ではない場合
  if (isNaN(numValue)) {
    return {
      isValid: false,
      errorMessage: '有効な数値を入力してください',
    };
  }

  // 整数ではない場合
  if (!Number.isInteger(numValue)) {
    return {
      isValid: false,
      errorMessage: 'トークン数量は整数で入力してください',
    };
  }

  // 負の値や0の場合
  if (numValue <= 0) {
    return {
      isValid: false,
      errorMessage: '0より大きい数量を入力してください',
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
}; 