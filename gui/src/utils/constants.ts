import { clusterApiUrl } from '@solana/web3.js';

/**
 * プログラムID (スマートコントラクトのアドレス)
 */
export const PROGRAM_ID = process.env.SOLANA_PROGRAM_ID || 'HLQtzTsQyzFgueH4dK3kgL3BZyE7Ts6S7VqCEXUDMcCz';

/**
 * クラスタURL (Solanaネットワーク)
 */
export const CLUSTER_URL = clusterApiUrl(process.env.SOLANA_NETWORK as any || 'devnet');

/**
 * トークンデシマル値
 */
export const TOKEN_DECIMALS = Number(process.env.SOLANA_TOKEN_DECIMALS || '9');

/**
 * トランザクション確認レベル
 */
export const COMMITMENT = process.env.SOLANA_COMMITMENT_STATUS || 'confirmed';

// テスト用のMINTアドレス (devnet上のダミートークン)
export const TEST_MINT_ADDRESS = process.env.SOLANA_TEST_TOKEN_MINT_ADDRESS || 'So11111111111111111111111111111111111111112'; // Wrapped SOL 