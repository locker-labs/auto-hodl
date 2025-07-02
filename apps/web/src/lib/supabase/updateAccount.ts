// import { Database } from '@/types/database.types';
import type { EChainMode } from '@/enums/chainMode.enums';

// type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

interface UpdateAccountRequest {
  timestamp: number;
  chainId: string;
  chainMode: EChainMode;
}

type TUpdateAccountWithChainMode = Omit<UpdateAccountRequest, 'timestamp'>;

/**
 * Updates an account with chain mode
 */
export async function updateAccountWithChainMode(
  accountId: string,
  params: TUpdateAccountWithChainMode,
): Promise<void> {
  // TODO: maybe add updated delegation
  const { chainMode, chainId } = params;
  const timestamp = Date.now();
  console.log('📝 Updating account with chain mode:', { accountId, chainMode, chainId });

  // Prepare update data
  const updateData: UpdateAccountRequest = { chainMode, chainId, timestamp };

  // Call api endpoint
  try {
    const response = await fetch(`/api/v1/accounts/${accountId}/chain-mode`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    await response.json();
  } catch (error) {
    console.error('❌ Failed to update account with chain mode:', error);
    throw new Error(`Failed to update account: ${error}`);
  }

  console.log('✅ Successfully updated account with chain mode');
}
