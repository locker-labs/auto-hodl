import { VIEM_CHAIN } from '@/config';

const chainId = VIEM_CHAIN.id;

export const MM_CARD_ADDRESSES = [
  // US
  '0xA90b298d05C2667dDC64e2A4e17111357c215dD2',

  // International
  '0x9dd23A4a0845f10d65D293776B792af1131c7B30',

  // Locker checking
  '0x1ECF3f51A771983C150b3cB4A2162E89c0A046Fc',
];

// https://developers.circle.com/stablecoins/usdc-contract-addresses
export const USDC_ADDRESSES = [
  // Linea
  '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',

  // Linea Sepolia
  '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7',

  // AAVE on Sepolia
  '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',

  // Arbitrum
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
];

export const USDC_ADDRESS = USDC_ADDRESSES[3] as `0x${string}`;

// Aave Addresses
// https://aave.com/docs/resources/addresses

// Aave Deployment Networks
// https://aave.com/help/aave-101/accessing-aave

// https://aave.com/docs/developers/smart-contracts/pool

export const AavePoolAddressMap: Record<number, `0x${string}`> = {
  59144: '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac', // Linea
  // Not available on linea sepolia
  11155111: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Sepolia
  42161: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // Arbitrum
  8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Base
};

// https://aave.com/docs/developers/smart-contracts/pool-addresses-provider

export const AavePoolAddressesProviderMap: Record<number, `0x${string}`> = {
  59144: '0x89502c3731F69DDC95B65753708A07F8Cd0373F4', // Linea
  // Not available on linea sepolia
  11155111: '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A', // Sepolia
  42161: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb', // Arbitrum
  8453: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D', // Base
};

// https://aave.com/docs/developers/smart-contracts/view-contracts#uipooldataprovider

export const AaveUiPoolDataProviderMap: Record<number, `0x${string}`> = {
  59144: '0xf751969521E20A972A0776CDB0497Fad0F773F1F', // Linea
  // Not available on linea sepolia
  11155111: '0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE', // Sepolia
  42161: '0x5c5228aC8BC1528482514aF3e27E692495148717', // Arbitrum
  8453: '0x68100bD5345eA474D93577127C11F39FF8463e93', // Base
};

export const TokenAddressMap: Record<number, `0x${string}`> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC Ethereum Mainnet
  59144: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC Linea
  59141: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7', // USDC Linea Sepolia
  11155111: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', // AAVE Sepolia
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
};

export const TokenDecimalMap: Record<`0x${string}`, number> = {
  '0x176211869cA2b568f2A7D4EE941E073a821EE1ff': 6, // USDC Linea
  '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7': 6, // USDC Linea Sepolia
  '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a': 18, // AAVE Sepolia
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 6, // USDC Arbitrum
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 6, // USDC Base
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6, // USDC Ethereum Mainnet
};

export const AAVE_POOL_ADDRESS = AavePoolAddressMap[chainId];

export const AAVE_POOL_ADDRESSES_PROVIDER = AavePoolAddressesProviderMap[chainId];

export const AAVE_UI_POOL_DATA_PROVIDER = AaveUiPoolDataProviderMap[chainId];

export const TOKEN_ADDRESS = TokenAddressMap[chainId];

export const TOKEN_DECIMALS = TokenDecimalMap[TOKEN_ADDRESS];

export const TOKEN_DECIMAL_MULTIPLIER = 10 ** TOKEN_DECIMALS;

export const LIFI_DIAMOND_ADDRESS = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE' as `0x${string}`;