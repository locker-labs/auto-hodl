import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { PRIVATE_KEY_DELEGATE, RPC_URL, VIEM_CHAIN } from '@/config';

const delegateEoa = privateKeyToAccount(PRIVATE_KEY_DELEGATE);

const delegateWalletClient = createWalletClient({
  account: delegateEoa,
  chain: VIEM_CHAIN,
  transport: http(RPC_URL),
});

export { delegateWalletClient };
