import { createBundlerClient } from 'viem/account-abstraction';
import { publicClient } from '@/clients/publicClient';
import { http } from 'viem';
import { RPC_URL } from '@/config';

const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(RPC_URL),
});

export { bundlerClient };
