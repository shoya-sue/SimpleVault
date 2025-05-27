/**
 * SOL単位の表示をフォーマットする
 * @param amount SOL金額
 * @param decimals 小数点以下の桁数
 * @returns フォーマットされた文字列
 */
export const formatSol = (amount?: number, decimals: number = 4): string => {
  if (amount === undefined || amount === null) {
    amount = 0;
  }
  
  // 桁区切りを追加
  return new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * 大きな数値を省略表記する
 * @param value 数値
 * @param decimals 小数点以下の桁数
 * @returns 省略表記された文字列
 */
export const abbreviateNumber = (value: number, decimals: number = 2): string => {
  if (value < 1000) return value.toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(value) / 3);
  
  let shortValue = value / Math.pow(10, suffixNum * 3);
  if (shortValue % 1 !== 0) {
    shortValue = parseFloat(shortValue.toFixed(decimals));
  }
  
  return `${shortValue}${suffixes[suffixNum]}`;
};

/**
 * ウォレットアドレスを短縮表示する
 * @param address ウォレットアドレス
 * @param length 前後の表示文字数
 * @returns 短縮されたアドレス
 */
export const shortenAddress = (address: string, length: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

/**
 * アドレス表示用のフォーマット関数
 * @param address フォーマットするアドレス
 * @param length 先頭と末尾に表示する文字数
 * @returns フォーマットされたアドレス
 */
export const formatAddress = (address?: string | null, length: number = 5): string => {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

/**
 * タイムスタンプを日時形式にフォーマット
 * @param timestamp ミリ秒タイムスタンプ（省略時は現在時刻）
 * @returns フォーマットされた日時文字列
 */
export const formatDate = (timestamp?: number): string => {
  const date = timestamp ? new Date(timestamp) : new Date();
  
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}; 