import { clusterApiUrl } from '@solana/web3.js';

/**
 * プログラムID (スマートコントラクトのアドレス)
 */
export const PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'; // 開発用のダミーID

/**
 * クラスタURL (Solanaネットワーク)
 */
export const CLUSTER_URL = clusterApiUrl('devnet');

/**
 * トークンデシマル値
 */
export const TOKEN_DECIMALS = 9;

/**
 * トランザクション確認レベル
 */
export const COMMITMENT = 'confirmed';

// テスト用のMINTアドレス (devnet上のダミートークン)
export const TEST_MINT_ADDRESS = 'So11111111111111111111111111111111111111112'; // Wrapped SOL 