import { formatSol, abbreviateNumber, shortenAddress, formatAddress, formatDate } from '../format';

describe('formatSol', () => {
  test('formats SOL amount with default decimals', () => {
    expect(formatSol(1.23456789)).toBe('1.2346');
  });

  test('formats SOL amount with custom decimals', () => {
    expect(formatSol(1.23456789, 2)).toBe('1.23');
  });

  test('handles zero correctly', () => {
    expect(formatSol(0)).toBe('0.0000');
  });

  test('handles undefined values', () => {
    expect(formatSol(undefined)).toBe('0.0000');
  });

  test('handles large numbers with separators', () => {
    expect(formatSol(1234567.89)).toBe('1,234,567.8900');
  });
});

describe('abbreviateNumber', () => {
  test('returns original number for small values', () => {
    expect(abbreviateNumber(123)).toBe('123');
    expect(abbreviateNumber(0)).toBe('0');
    expect(abbreviateNumber(999)).toBe('999');
  });

  test('abbreviates thousands correctly', () => {
    expect(abbreviateNumber(1000)).toBe('1K');
    expect(abbreviateNumber(1234)).toBe('1.23K');
    expect(abbreviateNumber(5678)).toBe('5.68K');
  });

  test('abbreviates millions correctly', () => {
    expect(abbreviateNumber(1000000)).toBe('1M');
    expect(abbreviateNumber(5678901)).toBe('5.68M');
  });

  test('abbreviates billions correctly', () => {
    expect(abbreviateNumber(1000000000)).toBe('1B');
    expect(abbreviateNumber(1234567890)).toBe('1.23B');
  });

  test('handles custom decimals', () => {
    expect(abbreviateNumber(1234567, 1)).toBe('1.2M');
    expect(abbreviateNumber(1234567, 3)).toBe('1.235M');
  });
});

describe('shortenAddress', () => {
  test('shortens address correctly', () => {
    const address = '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnwgX5xC';
    expect(shortenAddress(address)).toBe('5YNm...X5xC');
  });

  test('handles short address correctly', () => {
    const shortAddress = '12345678';
    expect(shortenAddress(shortAddress)).toBe('1234...5678');
  });

  test('handles empty address', () => {
    expect(shortenAddress('')).toBe('');
  });

  test('respects custom length', () => {
    const address = '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnwgX5xC';
    expect(shortenAddress(address, 6)).toBe('5YNmS1...wgX5xC');
  });
});

describe('formatAddress', () => {
  test('formats address correctly', () => {
    const address = '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnwgX5xC';
    expect(formatAddress(address)).toBe('5YNmS...gX5xC');
  });

  test('handles null or undefined address', () => {
    expect(formatAddress(null)).toBe('');
    expect(formatAddress(undefined)).toBe('');
  });

  test('returns full address for short addresses', () => {
    expect(formatAddress('abc123')).toBe('abc123');
  });

  test('applies custom length', () => {
    const address = '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnwgX5xC';
    expect(formatAddress(address, 6)).toBe('5YNmS1...gX5xC');
  });
});

describe('formatDate', () => {
  // 時間に依存するテストなので、厳密なフォーマットを検証するのではなく
  // 実行されることのみ確認するテスト
  test('formats date from timestamp', () => {
    const timestamp = 1620000000000; // 2021-05-03T04:00:00.000Z
    const result = formatDate(timestamp);
    
    // 結果が文字列であることと長さがある程度あることを確認
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(10);
  });

  test('formats current date when no timestamp provided', () => {
    const result = formatDate();
    
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(10);
  });
}); 