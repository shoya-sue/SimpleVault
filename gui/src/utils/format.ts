/**
 * SOL単位の表示をフォーマットする
 * @param amount SOL金額
 * @param decimals 小数点以下の桁数
 * @returns フォーマットされた文字列
 */
export const formatSol = (amount: number, decimals: number = 4): string => {
  return amount.toFixed(decimals);
};

/**
 * 大きな数値を省略表記する
 * @param value 数値
 * @returns 省略表記された文字列
 */
export const abbreviateNumber = (value: number): string => {
  if (value < 1000) return value.toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(value) / 3);
  
  let shortValue = value / Math.pow(10, suffixNum * 3);
  if (shortValue % 1 !== 0) {
    shortValue = parseFloat(shortValue.toFixed(2));
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