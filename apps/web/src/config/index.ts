import { linea, lineaSepolia, sepolia, type Chain } from 'viem/chains';
import { env } from '@/lib/env';

const chainId: number = Number(env.NEXT_PUBLIC_CHAIN_ID);
if (Number.isNaN(chainId)) {
  throw new Error('env NEXT_PUBLIC_CHAIN_ID is not a number');
}

export const VIEM_CHAIN: Chain = chainId === linea.id ? linea : chainId === lineaSepolia.id ? lineaSepolia : sepolia;

export const RPC_URL: string = env.NEXT_PUBLIC_RPC_URL;
export const PRIVATE_KEY_DELEGATE = env.PRIVATE_KEY_DELEGATE as `0x${string}`;
export const DELEGATE_ADDRESS = env.NEXT_PUBLIC_DELEGATE_ADDRESS as `0x${string}`;

export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
console.log(SUPABASE_URL);

export const SUPABASE_SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE;
export const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const DEPLOY_SALT = env.NEXT_PUBLIC_DEPLOY_SALT;

const config = {
  RPC_URL,
  VIEM_CHAIN,
  PRIVATE_KEY_DELEGATE,
  DELEGATE_ADDRESS,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
  SUPABASE_ANON_KEY,
  DEPLOY_SALT,
};

const RPC_URL: string = env.NEXT_PUBLIC_RPC_URL!;
const PRIVATE_KEY_DELEGATE = env.PRIVATE_KEY_DELEGATE! as `0x${string}`;
const DELEGATE_ADDRESS = env.NEXT_PUBLIC_DELEGATE_ADDRESS! as `0x${string}`;
// For Sepolia
const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" as `0x${string}`;

export { RPC_URL, VIEM_CHAIN, PRIVATE_KEY_DELEGATE, DELEGATE_ADDRESS, AAVE_POOL_ADDRESS };


export default config;
