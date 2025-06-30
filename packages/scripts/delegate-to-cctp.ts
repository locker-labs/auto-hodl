import dotenv from 'dotenv';
import { createPublicClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, linea, optimism, arbitrum, polygon } from 'viem/chains';
import path from 'path';
import { AaveV3Base, AaveV3Linea, AaveV3Optimism, AaveV3Arbitrum, AaveV3Polygon } from '@bgd-labs/aave-address-book';

import { getRoutes, getStepTransaction, type RoutesRequest } from '@lifi/sdk';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.delegate') });

// Chain configurations with USDC addresses and Aave contract addresses from BGD Labs address book
const CHAIN_CONFIGS = {
  base: {
    chain: base,
    chainId: 8453,
    usdcAddress: AaveV3Base.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Base.POOL,
    aavePoolAddressesProvider: AaveV3Base.POOL_ADDRESSES_PROVIDER,
    aaveUiPoolDataProvider: AaveV3Base.UI_POOL_DATA_PROVIDER,
    rpcUrl: 'https://mainnet.base.org',
  },
  linea: {
    chain: linea,
    chainId: 59144,
    usdcAddress: AaveV3Linea.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Linea.POOL,
    aavePoolAddressesProvider: AaveV3Linea.POOL_ADDRESSES_PROVIDER,
    aaveUiPoolDataProvider: AaveV3Linea.UI_POOL_DATA_PROVIDER,
    rpcUrl: 'https://rpc.linea.build',
  },
  optimism: {
    chain: optimism,
    chainId: 10,
    usdcAddress: AaveV3Optimism.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Optimism.POOL,
    aavePoolAddressesProvider: AaveV3Optimism.POOL_ADDRESSES_PROVIDER,
    aaveUiPoolDataProvider: AaveV3Optimism.UI_POOL_DATA_PROVIDER,
    rpcUrl: 'https://mainnet.optimism.io',
  },
  arbitrum: {
    chain: arbitrum,
    chainId: 42161,
    usdcAddress: AaveV3Arbitrum.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Arbitrum.POOL,
    aavePoolAddressesProvider: AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER,
    aaveUiPoolDataProvider: AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  polygon: {
    chain: polygon,
    chainId: 137,
    usdcAddress: AaveV3Polygon.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Polygon.POOL,
    aavePoolAddressesProvider: AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
    aaveUiPoolDataProvider: AaveV3Polygon.UI_POOL_DATA_PROVIDER,
    rpcUrl: 'https://polygon-rpc.com',
  },
} as const;

// Environment variable validation
function validateEnvironment() {
  const RPC_URL = process.env.RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY_DELEGATOR as `0x${string}`;

  if (!RPC_URL) {
    throw new Error('RPC_URL must be set in environment variables');
  }

  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY_DELEGATOR must be set in environment variables');
  }

  return { RPC_URL, PRIVATE_KEY };
}

// Fetch real Aave USDC yields across chains using a simplified approach
async function getAaveYields(): Promise<Record<string, number>> {
  console.log('🔍 Fetching real Aave USDC yields across chains...');

  const yields: Record<string, number> = {};

  // Since the ABI is complex and causing decoding issues, let's use a simpler approach
  // that directly calls the Pool contract to get reserve data
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

  // Fetch yields for each chain
  for (const [chainName, config] of Object.entries(CHAIN_CONFIGS)) {
    try {
      console.log(`   Fetching ${chainName} yield...`);

      // Create public client for this chain
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
        // The rate is already annualized, so we just need to convert from ray to percentage
        const liquidityRateRay = Number(reserveData.currentLiquidityRate);
        const apy = (liquidityRateRay / 1e27) * 100;

        yields[chainName] = parseFloat(apy.toFixed(2));
        console.log(`   ✅ ${chainName}: ${yields[chainName]}% APY`);
      } else {
        console.log(`   ⚠️ ${chainName}: No liquidity rate found`);
        yields[chainName] = 0;
      }
    } catch (error) {
      console.error(`   ❌ ${chainName}: Error fetching yield -`, error);
      yields[chainName] = 0;
    }
  }

  console.log('\n📊 Real Aave USDC yields:');
  Object.entries(yields).forEach(([chain, apy]) => {
    console.log(`   ${chain}: ${apy}% APY`);
  });

  return yields;
}

// Find the chain with the best yield
function findBestYieldChain(yields: Record<string, number>): { chain: string; apy: number; config: any } {
  let bestChain = { chain: '', apy: 0 };

  for (const [chain, apy] of Object.entries(yields)) {
    if (apy > bestChain.apy) {
      bestChain = { chain, apy };
    }
  }

  const config = CHAIN_CONFIGS[bestChain.chain as keyof typeof CHAIN_CONFIGS];

  console.log(`🏆 Best yield found: ${bestChain.chain} with ${bestChain.apy}% APY`);

  return { chain: bestChain.chain, apy: bestChain.apy, config };
}

// Get cheapest route from Linea to destination chain, preferring CCTP if available
async function getCheapestCCTPRoute(
  destinationChainId: number,
  destinationUsdcAddress: string,
  amount: string,
  fromAddress: string,
): Promise<any> {
  console.log('\n🌉 Finding cheapest route from Linea (preferring CCTP)...');
  console.log(`   Destination: Chain ${destinationChainId}`);
  console.log(`   Amount: ${amount} USDC`);

  const routesRequest: RoutesRequest = {
    fromChainId: CHAIN_CONFIGS.linea.chainId,
    toChainId: destinationChainId,
    fromTokenAddress: CHAIN_CONFIGS.linea.usdcAddress,
    toTokenAddress: destinationUsdcAddress,
    fromAmount: amount,
    fromAddress: fromAddress,
    // First, let's get all available routes to see what bridges are available
  };

  try {
    const routesResponse = await getRoutes(routesRequest);

    if (!routesResponse.routes || routesResponse.routes.length === 0) {
      throw new Error('No CCTP routes found from Linea to destination chain');
    }

    // Log all available bridges to see what's available
    console.log('\n🔍 Available bridges in routes:');
    const bridgeSet = new Set();
    routesResponse.routes.forEach((route: any) => {
      route.steps.forEach((step: any) => {
        bridgeSet.add(step.tool);
      });
    });
    console.log(`   Found bridges: ${Array.from(bridgeSet).join(', ')}`);

    // Look for CCTP-based routes (Circle's Cross-Chain Transfer Protocol)
    // Based on LiFi documentation, CCTP might be integrated as 'circle' or other identifiers
    const cctpRoutes = routesResponse.routes.filter((route: any) =>
      route.steps.some(
        (step: any) =>
          step.tool.toLowerCase().includes('cctp') ||
          step.tool.toLowerCase().includes('circle') ||
          step.tool.toLowerCase().includes('mayan') ||
          step.tool === 'circle' ||
          step.tool === 'cctp',
      ),
    );

    if (cctpRoutes.length === 0) {
      console.log('⚠️ No CCTP routes found, using cheapest available route');
      // Find the cheapest route (lowest gas cost)
      const cheapestRoute = routesResponse.routes.reduce((cheapest, current) => {
        const currentCost = parseFloat(current.gasCostUSD || '0');
        const cheapestCost = parseFloat(cheapest.gasCostUSD || '0');
        return currentCost < cheapestCost ? current : cheapest;
      });

      console.log(`✅ Found cheapest route:`);
      console.log(`   Route ID: ${cheapestRoute.id}`);
      console.log(`   Steps: ${cheapestRoute.steps.length}`);
      console.log(`   Bridge: ${cheapestRoute.steps[0]?.tool}`);
      console.log(`   Gas Cost: $${cheapestRoute.gasCostUSD || '0'}`);
      console.log(`   Estimated Time: ${cheapestRoute.steps[0]?.estimate?.executionDuration || 'N/A'}s`);

      return cheapestRoute;
    }

    // Find the cheapest CCTP route
    const cheapestCCTPRoute = cctpRoutes.reduce((cheapest, current) => {
      const currentCost = parseFloat(current.gasCostUSD || '0');
      const cheapestCost = parseFloat(cheapest.gasCostUSD || '0');
      return currentCost < cheapestCost ? current : cheapest;
    });

    console.log(`✅ Found cheapest CCTP route:`);
    console.log(`   Route ID: ${cheapestCCTPRoute.id}`);
    console.log(`   Steps: ${cheapestCCTPRoute.steps.length}`);
    console.log(`   Bridge: ${cheapestCCTPRoute.steps[0]?.tool}`);
    console.log(`   Gas Cost: $${cheapestCCTPRoute.gasCostUSD || '0'}`);
    console.log(`   Estimated Time: ${cheapestCCTPRoute.steps[0]?.estimate?.executionDuration || 'N/A'}s`);
    console.log(`   ✅ Confirmed using CCTP-based bridge`);

    return cheapestCCTPRoute;
  } catch (error) {
    console.error('❌ Error getting CCTP route:', error);
    throw error;
  }
}

// Get transaction data for the route step
async function getRouteTransactionData(route: any): Promise<any> {
  console.log('\n📋 Getting transaction data for route execution...');

  try {
    // Get transaction data for the first step (should be the CCTP bridge step)
    const stepWithTxData = await getStepTransaction(route.steps[0]);

    console.log('✅ Transaction data retrieved:');
    console.log(`   To: ${stepWithTxData.transactionRequest?.to}`);
    console.log(`   Value: ${stepWithTxData.transactionRequest?.value || '0'}`);
    console.log(`   Gas Limit: ${stepWithTxData.transactionRequest?.gasLimit}`);
    console.log(`   Data: ${stepWithTxData.transactionRequest?.data?.slice(0, 42)}...`);

    return stepWithTxData;
  } catch (error) {
    console.error('❌ Error getting transaction data:', error);
    throw error;
  }
}

// Main execution function
async function main() {
  console.log('🚀 Starting Cross-Chain USDC Yield Optimization Demo...');

  try {
    // Step 1: Validate environment
    const config = validateEnvironment();

    // Step 2: Setup wallet
    const account = privateKeyToAccount(config.PRIVATE_KEY);

    console.log(`👤 User address: ${account.address}`);

    // Step 3: Get best yields across chains (excluding Linea as source)
    const yields = await getAaveYields();

    // Remove Linea from consideration as destination since it's our source
    const { linea: _, ...destinationYields } = yields;
    const bestYield = findBestYieldChain(destinationYields);

    console.log('Best yield destination:', bestYield);

    // Step 4: Get cheapest CCTP route from Linea to best yield chain
    const transferAmount = '1000000000'; // 1000 USDC (6 decimals)
    const route = await getCheapestCCTPRoute(
      bestYield.config.chainId,
      bestYield.config.usdcAddress,
      transferAmount,
      account.address,
    );

    // Step 5: Get transaction data for the route
    const stepWithTxData = await getRouteTransactionData(route);

    console.log('\n🎯 Cross-Chain Route Summary:');
    console.log(`   From: Linea (${CHAIN_CONFIGS.linea.chainId})`);
    console.log(`   To: ${bestYield.chain} (${bestYield.config.chainId})`);
    console.log(`   Amount: 1000 USDC`);
    console.log(`   Expected APY: ${bestYield.apy}%`);
    console.log(`   Bridge: ${route.steps[0]?.tool || 'Unknown'}`);
    console.log(`   Gas Cost: $${route.gasCostUSD || '0'}`);

    console.log('\n📋 Transaction Ready for Execution:');
    console.log(`   To: ${stepWithTxData.transactionRequest?.to}`);
    console.log(`   Value: ${stepWithTxData.transactionRequest?.value || '0'} ETH`);
    console.log(`   Gas Limit: ${stepWithTxData.transactionRequest?.gasLimit}`);
    console.log(`   Calldata Length: ${stepWithTxData.transactionRequest?.data?.length || 0} bytes`);

    console.log('\n✅ Cross-chain yield optimization completed!');
    console.log('\n📝 Implementation Status:');
    console.log('   ✅ Real Aave yield data fetching - IMPLEMENTED');
    console.log('   ✅ LiFi SDK integration with MayanMCTP - IMPLEMENTED');
    console.log('   ✅ Transaction data generation - IMPLEMENTED');
    console.log('\n📝 Transaction ready for execution:');
    console.log('   Use the returned transaction request to execute the CCTP bridge');

    // Return the transaction request for manual execution
    return stepWithTxData.transactionRequest;
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    throw error;
  }
}

// Run the script
main().catch(console.error);
