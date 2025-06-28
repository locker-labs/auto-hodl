export async function getAllTransactionsByAccountId(accountId: string, params?: { page?: number; limit?: number }) {
  console.log('Fetching all transactions for account ID:', accountId);

  const page = params?.page || 1;
  const limit = params?.limit || 20;

  let data: any = null;
  let error: any = null;

  try {
    const response = await fetch(
      `/api/v1/accounts/${encodeURIComponent(accountId)}/transactions/all?page=${page}&limit=${limit}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      error = errorData.error || 'Failed to fetch transactions';
      return { data, error };
    }

    data = await response.json();
    console.log('All transactions:', data);
    return { data, error };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data, error };
  }
}
