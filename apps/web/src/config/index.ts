import { env } from '@/lib/env';
import { linea, lineaSepolia, sepolia, type Chain } from 'viem/chains';

const chainId: number = Number(env.NEXT_PUBLIC_CHAIN_ID);
if (Number.isNaN(chainId)) {
  throw new Error('env NEXT_PUBLIC_CHAIN_ID is not a number');
}

const VIEM_CHAIN: Chain = chainId === linea.id ? linea : chainId === lineaSepolia.id ? lineaSepolia : sepolia;

const RPC_URL: string = env.NEXT_PUBLIC_RPC_URL;
const PRIVATE_KEY_DELEGATE = env.PRIVATE_KEY_DELEGATE as `0x${string}`;
const DELEGATE_ADDRESS = env.NEXT_PUBLIC_DELEGATE_ADDRESS as `0x${string}`;

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export {
  RPC_URL,
  VIEM_CHAIN,
  PRIVATE_KEY_DELEGATE,
  DELEGATE_ADDRESS,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
  SUPABASE_ANON_KEY,
};
