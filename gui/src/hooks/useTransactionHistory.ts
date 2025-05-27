import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, ConfirmedSignatureInfo, ParsedTransactionWithMeta } from '@solana/web3.js';
import { useCallback, useState, useEffect } from 'react';
import { PROGRAM_ID } from '../utils/constants';

// トランザクションの種類を定義
export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  MINT = 'Mint',
  UNKNOWN = 'Unknown'
}

// トランザクション情報の型定義
export interface TransactionInfo {
  signature: string;
  timestamp: number;
  type: TransactionType;
  amount?: number;
  status: 'confirmed' | 'failed';
  blockTime?: number | null;  // nullを許容するように修正
}

/**
 * ウォレットのトランザクション履歴を取得するカスタムフック
 */
export const useTransactionHistory = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // トランザクションの種類を判定する関数
  const getTransactionType = (transaction: ParsedTransactionWithMeta): TransactionType => {
    if (!transaction.meta || !transaction.transaction) return TransactionType.UNKNOWN;

    // プログラムIDが含まれるか確認
    const programIdStr = PROGRAM_ID;
    const programId = new PublicKey(programIdStr);

    // トランザクションに含まれるすべての命令を確認
    const instructions = transaction.transaction.message.instructions;
    const programInvoked = instructions.some(instruction => {
      if ('programId' in instruction) {
        const instructionProgramId = instruction.programId.toString();
        return instructionProgramId === programId.toString();
      }
      return false;
    });

    if (!programInvoked) return TransactionType.UNKNOWN;

    // トランザクションのログを確認して種類を判定
    const logs = transaction.meta.logMessages || [];
    const logString = logs.join(' ');

    if (logString.includes('deposit')) return TransactionType.DEPOSIT;
    if (logString.includes('withdraw')) return TransactionType.WITHDRAW;
    if (logString.includes('mint')) return TransactionType.MINT;

    return TransactionType.UNKNOWN;
  };

  // トランザクション履歴を取得する関数
  const fetchTransactionHistory = useCallback(async (limit = 10) => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      // 署名リストを取得
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });

      // トランザクションの詳細を取得
      const transactionInfos: TransactionInfo[] = await Promise.all(
        signatures.map(async (signatureInfo: ConfirmedSignatureInfo) => {
          try {
            const txResponse = await connection.getParsedTransaction(signatureInfo.signature);
            
            let transactionType = TransactionType.UNKNOWN;
            let amount = undefined;
            
            if (txResponse) {
              transactionType = getTransactionType(txResponse);

              // 金額を抽出する処理（簡略化）
              // 実際のアプリケーションでは、トランザクションの内容から正確に金額を抽出する必要があります
              if (txResponse.meta && txResponse.meta.postBalances && txResponse.meta.preBalances) {
                const balanceDiff = Math.abs(
                  txResponse.meta.postBalances[0] - txResponse.meta.preBalances[0]
                );
                amount = balanceDiff / 1000000000; // SOL単位に変換
              }
            }

            return {
              signature: signatureInfo.signature,
              timestamp: signatureInfo.blockTime ? signatureInfo.blockTime * 1000 : Date.now(),
              type: transactionType,
              amount,
              status: signatureInfo.err ? 'failed' : 'confirmed',
              blockTime: signatureInfo.blockTime
            };
          } catch (err) {
            console.error('Failed to fetch transaction details:', err);
            return {
              signature: signatureInfo.signature,
              timestamp: signatureInfo.blockTime ? signatureInfo.blockTime * 1000 : Date.now(),
              type: TransactionType.UNKNOWN,
              status: 'failed',
              blockTime: signatureInfo.blockTime
            };
          }
        })
      );

      // 最新順にソート
      const sortedTransactions = transactionInfos.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(sortedTransactions);
    } catch (err) {
      console.error('Failed to fetch transaction history:', err);
      setError('トランザクション履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  // ウォレットが接続されたときに履歴を自動取得
  useEffect(() => {
    if (publicKey) {
      fetchTransactionHistory();
    } else {
      setTransactions([]);
    }
  }, [publicKey, fetchTransactionHistory]);

  return {
    transactions,
    loading,
    error,
    fetchTransactionHistory
  };
}; 