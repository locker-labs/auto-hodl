import { useEffect, useState } from 'react';
import { getAllTransactionsByAccountId } from '@/lib/supabase/getAllTransactionsOfAccount';
import { useMetaMaskDTK } from '@/hooks/useMetaMaskDTK';
import { IAutoHodlTx } from '@/types/auto-hodl.types';

const defaultMetadata = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

type TPaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function useTransactions() {
  const [txs, setTxs] = useState<IAutoHodlTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [metadata, setMetadata] = useState<TPaginationMetadata>(defaultMetadata);

  const { existingAccount } = useMetaMaskDTK();
  const accountId: string | null = existingAccount?.id;

  useEffect(() => {
    async function fetchTxs() {
      if (!accountId) {
        setTxs([]);
        setMetadata(defaultMetadata);
        setLoading(true);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await getAllTransactionsByAccountId(accountId, {
          page: metadata.page,
          limit: metadata.limit,
        });

        if (error) {
          console.error('Error fetching transactions:', error);
          setError(error);
          return;
        }

        setTxs(data.data);
        setMetadata({ page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTxs();
  }, [accountId, metadata.page, metadata.limit]);

  function setPage(page: number) {
    setMetadata({ ...metadata, page });
  }

  function setLimit(limit: number) {
    setMetadata({ ...metadata, limit });
  }

  return {
    txs,
    loading,
    error,
    page: metadata.page,
    limit: metadata.limit,
    total: metadata.total,
    totalPages: metadata.totalPages,
    setPage,
    setLimit,
  };
}
