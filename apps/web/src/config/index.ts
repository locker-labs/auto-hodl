import { arbitrum, base, baseSepolia, type Chain, linea, sepolia } from 'viem/chains';
import { env } from '@/lib/env';

const chainId: number = Number(env.NEXT_PUBLIC_CHAIN_ID);
if (Number.isNaN(chainId)) {
  throw new Error('env NEXT_PUBLIC_CHAIN_ID is not a number');
}

export const chains: Chain[] = [arbitrum, base, linea, baseSepolia, sepolia];
const foundChain: Chain | undefined = chains.find((chain) => chain.id === chainId);

if (!foundChain) {
  throw new Error(`Unsupported chain ID: ${chainId}. Supported chains are: ${chains.map((c) => c.name).join(', ')}`);
}

const VIEM_CHAIN: Chain = foundChain;
export const VIEM_CHAIN_ID: number = VIEM_CHAIN.id;
export const RPC_URL: string = env.NEXT_PUBLIC_RPC_URL;
export const PRIVATE_KEY_DELEGATE = env.PRIVATE_KEY_DELEGATE as `0x${string}`;
export const DELEGATE_ADDRESS = env.NEXT_PUBLIC_DELEGATE_ADDRESS as `0x${string}`;
export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE;
export const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const DEPLOY_SALT = env.NEXT_PUBLIC_DEPLOY_SALT;
export const MORALIS_STREAM_ID = env.MORALIS_STREAM_ID;
const PIMLICO_API_KEY = env.NEXT_PUBLIC_PIMLICO_API_KEY;
export const PIMLICO_API_URL = `https://api.pimlico.io/v2/${VIEM_CHAIN_ID}/rpc?apikey=${PIMLICO_API_KEY}`;
export const CIRCLE_CLIENT_URL = env.NEXT_PUBLIC_CIRCLE_CLIENT_URL;
export const CIRCLE_CLIENT_KEY = env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY;

const config = {
  RPC_URL,
  VIEM_CHAIN,
  VIEM_CHAIN_ID,
  PRIVATE_KEY_DELEGATE,
  DELEGATE_ADDRESS,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE,
  SUPABASE_ANON_KEY,
  DEPLOY_SALT,
  MORALIS_STREAM_ID,
  PIMLICO_API_URL,
  CIRCLE_CLIENT_URL,
  CIRCLE_CLIENT_KEY,
};

export { VIEM_CHAIN };
export default config;
