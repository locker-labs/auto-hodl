import { useState, useEffect } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { base, arbitrum } from 'viem/chains';
import { AaveV3Base, AaveV3Arbitrum } from '@bgd-labs/aave-address-book';

// Simple Pool ABI for getting reserve data
const simplePoolAbi = [
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      {
        components: [
          { name: 'configuration', type: 'uint256' },
          { name: 'liquidityIndex', type: 'uint128' },
          { name: 'currentLiquidityRate', type: 'uint128' },
          { name: 'variableBorrowIndex', type: 'uint128' },
          { name: 'currentVariableBorrowRate', type: 'uint128' },
          { name: 'currentStableBorrowRate', type: 'uint128' },
          { name: 'lastUpdateTimestamp', type: 'uint40' },
          { name: 'id', type: 'uint16' },
          { name: 'aTokenAddress', type: 'address' },
          { name: 'stableDebtTokenAddress', type: 'address' },
          { name: 'variableDebtTokenAddress', type: 'address' },
          { name: 'interestRateStrategyAddress', type: 'address' },
          { name: 'accruedToTreasury', type: 'uint128' },
          { name: 'unbacked', type: 'uint128' },
          { name: 'isolationModeTotalDebt', type: 'uint128' },
        ],
        name: 'reserveData',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Chain configurations
const CHAIN_CONFIGS = {
  base: {
    chain: base,
    chainId: 8453,
    usdcAddress: AaveV3Base.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Base.POOL,
    rpcUrl: 'https://mainnet.base.org',
    name: 'Base',
  },
  arbitrum: {
    chain: arbitrum,
    chainId: 42161,
    usdcAddress: AaveV3Arbitrum.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Arbitrum.POOL,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    name: 'Arbitrum',
  },
} as const;

export function useAaveAPY(chainKey: 'base' | 'arbitrum' = 'base') {
  const [apy, setApy] = useState<string>('--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAaveAPY() {
      try {
        setLoading(true);
        setError(null);

        const config = CHAIN_CONFIGS[chainKey];

        // Create public client for the specified chain
        const publicClient = createPublicClient({
          chain: config.chain,
          transport: http(config.rpcUrl),
        });

        // Call getReserveData directly on the Pool contract for USDC
        const reserveData = await publicClient.readContract({
          address: config.aavePoolAddress as Address,
          abi: simplePoolAbi,
          functionName: 'getReserveData',
          args: [config.usdcAddress as Address],
        });

        if (reserveData && reserveData.currentLiquidityRate) {
          // Convert currentLiquidityRate from ray (1e27) to APY percentage
          const liquidityRateRay = Number(reserveData.currentLiquidityRate);
          const apyValue = (liquidityRateRay / 1e27) * 100;

          setApy(apyValue.toFixed(2));
        } else {
          setError('No liquidity rate found');
          setApy('--');
        }
      } catch (err) {
        console.error('Error fetching Aave APY:', err);
        setError('Failed to fetch APY');
        setApy('--');
      } finally {
        setLoading(false);
      }
    }

    fetchAaveAPY();

    // Refresh APY every 5 minutes
    const interval = setInterval(fetchAaveAPY, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [chainKey]);

  return { apy, loading, error, chainName: CHAIN_CONFIGS[chainKey].name };
}
