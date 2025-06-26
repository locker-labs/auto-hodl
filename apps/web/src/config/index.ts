import { env } from '@/lib/env';
import { linea, lineaSepolia, sepolia, type Chain } from 'viem/chains';

const chainId: number = Number(env.NEXT_PUBLIC_CHAIN_ID);
if (Number.isNaN(chainId)) {
  throw new Error('env NEXT_PUBLIC_CHAIN_ID is not a number');
}

const VIEM_CHAIN: Chain = chainId === linea.id ? linea : chainId === lineaSepolia.id ? lineaSepolia : sepolia;

const RPC_URL: string = env.NEXT_PUBLIC_RPC_URL!;
const PRIVATE_KEY_DELEGATE = env.PRIVATE_KEY_DELEGATE! as `0x${string}`;
const DELEGATE_ADDRESS = env.NEXT_PUBLIC_DELEGATE_ADDRESS! as `0x${string}`;
// For Sepolia
const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" as `0x${string}`;

export { RPC_URL, VIEM_CHAIN, PRIVATE_KEY_DELEGATE, DELEGATE_ADDRESS, AAVE_POOL_ADDRESS };
