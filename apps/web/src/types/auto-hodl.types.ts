import { TablesInsert, Tables } from './database.types';

export interface IAutoHodlAccount extends Tables<'accounts'> {
  id: string;
  chainId: string | null;
  createdAt: string;
  delegation: any; // JSON delegation data
  deploySalt: string;
  roundUpMode: string;
  roundUpToDollar: number;
  savingsAddress: string | null;
  signerAddress: string;
  tokenSourceAddress: string;
  triggerAddress: string;
}

export interface IAutoHodlTx extends Omit<TablesInsert<'txs'>, 'accountId'> {
  createdAt: string;
  accountId?: string | null;
  account?: IAutoHodlAccount;
  spendAmount: string;
  spendAt: string;
  spendChainId: number;
  spendFrom: string;
  spendTo: string;
  spendToken: string;
  spendTxHash: string;
  yieldDepositAmount?: string | null;
  yieldDepositAt?: string | null;
  yieldDepositChainId?: number | null;
  yieldDepositToken?: string | null;
  yieldDepositTxHash?: string | null;
}
