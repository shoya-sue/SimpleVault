import { WalletAdapter } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

// プログラム固有の型
declare interface SimpleVaultAccount {
  owner: PublicKey;
  tokenAccount: PublicKey;
  bump: number;
}

// グローバル型定義を拡張
declare global {
  interface Window {
    solana?: WalletAdapter;
  }
}

export {}; 