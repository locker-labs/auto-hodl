import { http } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { publicClient } from '@/clients/publicClient';
import { PIMLICO_API_URL } from '@/config';

const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(PIMLICO_API_URL),
  paymaster: true,
});

export { bundlerClient };
