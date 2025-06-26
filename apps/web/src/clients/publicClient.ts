import { createPublicClient, http } from 'viem';
import { VIEM_CHAIN, RPC_URL } from '@/config';

const publicClient = createPublicClient({
  chain: VIEM_CHAIN,
  transport: http(RPC_URL),
});

export { publicClient };
