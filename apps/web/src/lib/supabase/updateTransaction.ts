import { supabaseServer } from './supabaseServer';
import { Database } from '@/types/database.types';

type TransactionUpdate = Database['public']['Tables']['txs']['Update'];

export interface YieldDepositInfo {
  yieldDepositAmount: string;
  yieldDepositChainId: number;
  yieldDepositToken: string;
  yieldDepositTxHash: string;
  yieldDepositAt: string;
}

/**
 * Updates a transaction with yield deposit information after delegation redemption
 */
export async function updateTransactionWithYieldDeposit(
  transactionId: string,
  yieldDepositInfo: YieldDepositInfo,
): Promise<void> {
  console.log('📝 Updating transaction with yield deposit info:', {
    transactionId,
    yieldDepositInfo,
  });

  const updateData: TransactionUpdate = {
    yieldDepositAmount: yieldDepositInfo.yieldDepositAmount,
    yieldDepositChainId: yieldDepositInfo.yieldDepositChainId,
    yieldDepositToken: yieldDepositInfo.yieldDepositToken,
    yieldDepositTxHash: yieldDepositInfo.yieldDepositTxHash,
    yieldDepositAt: yieldDepositInfo.yieldDepositAt,
  };

  const { error } = await supabaseServer.from('txs').update(updateData).eq('id', transactionId);

  if (error) {
    console.error('❌ Failed to update transaction with yield deposit info:', error);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  console.log('✅ Successfully updated transaction with yield deposit info');
}

/**
 * Updates a transaction with yield deposit information using spendTxHash
 */
export async function updateTransactionWithYieldDepositByTxHash(
  spendTxHash: string,
  yieldDepositInfo: YieldDepositInfo,
): Promise<void> {
  console.log('📝 Updating transaction by txHash with yield deposit info:', {
    spendTxHash,
    yieldDepositInfo,
  });

  const updateData: TransactionUpdate = {
    yieldDepositAmount: yieldDepositInfo.yieldDepositAmount,
    yieldDepositChainId: yieldDepositInfo.yieldDepositChainId,
    yieldDepositToken: yieldDepositInfo.yieldDepositToken,
    yieldDepositTxHash: yieldDepositInfo.yieldDepositTxHash,
    yieldDepositAt: yieldDepositInfo.yieldDepositAt,
  };

  const { error } = await supabaseServer.from('txs').update(updateData).eq('spendTxHash', spendTxHash);

  if (error) {
    console.error('❌ Failed to update transaction with yield deposit info:', error);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  console.log('✅ Successfully updated transaction with yield deposit info');
}
