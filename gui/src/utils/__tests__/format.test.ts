import { formatSol, abbreviateNumber, shortenAddress } from '../format';

describe('formatSol', () => {
  test('formats SOL amount with default decimals', () => {
    expect(formatSol(1.23456789)).toBe('1.2346');
  });

  test('formats SOL amount with specified decimals', () => {
    expect(formatSol(1.23456789, 2)).toBe('1.23');
  });

  test('handles zero correctly', () => {
    expect(formatSol(0)).toBe('0.0000');
  });

  test('handles large numbers correctly', () => {
    expect(formatSol(1000000)).toBe('1000000.0000');
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
    expect(abbreviateNumber(1234567)).toBe('1.23M');
    expect(abbreviateNumber(5678901)).toBe('5.68M');
  });

  test('abbreviates billions correctly', () => {
    expect(abbreviateNumber(1000000000)).toBe('1B');
    expect(abbreviateNumber(1234567890)).toBe('1.23B');
  });
});

describe('shortenAddress', () => {
  test('shortens address with default length', () => {
    const address = '5KKsLVU6TcbVDK4BS6K1DGDxnh4Q9xjYJ8XaDCG5t8ht';
    expect(shortenAddress(address)).toBe('5KKs...t8ht');
  });

  test('shortens address with custom length', () => {
    const address = '5KKsLVU6TcbVDK4BS6K1DGDxnh4Q9xjYJ8XaDCG5t8ht';
    expect(shortenAddress(address, 6)).toBe('5KKsLV...G5t8ht');
  });

  test('handles empty string', () => {
    expect(shortenAddress('')).toBe('');
  });

  test('handles short addresses correctly', () => {
    const shortAddress = '12345678';
    // If address is shorter than 2*length, it should still be shortened
    expect(shortenAddress(shortAddress)).toBe('1234...5678');
  });
}); 