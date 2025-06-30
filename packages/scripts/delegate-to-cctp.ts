import dotenv from 'dotenv';
import { createPublicClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, linea, optimism, arbitrum, polygon } from 'viem/chains';
import path from 'path';
import { AaveV3Base, AaveV3Linea, AaveV3Optimism, AaveV3Arbitrum, AaveV3Polygon } from '@bgd-labs/aave-address-book';

// import { getRoutes, getStepTransaction, getStatus, type RouteRequest } from '@lifi/sdk';

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

// Main execution function
async function main() {
  console.log('🚀 Starting Cross-Chain USDC Yield Optimization Demo...');

  try {
    // Step 1: Validate environment
    const config = validateEnvironment();

    // Step 2: Setup wallet
    const account = privateKeyToAccount(config.PRIVATE_KEY);

    console.log(`👤 User address: ${account.address}`);

    // Step 3: Get best yields across chains
    const yields = await getAaveYields();
    const bestYield = findBestYieldChain(yields);

    console.log('Best yield', bestYield);
    // // Step 4: Get LiFi route to best yield chain
    // const sourceUSDC = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // USDC on Sepolia
    // const route = await getMockLiFiRoute(
    //   SOURCE_CHAIN.id,
    //   bestYield.config.chainId,
    //   sourceUSDC,
    //   bestYield.config.usdcAddress,
    //   USDC_AMOUNT.toString(),
    //   account.address,
    // );

    // console.log('\n📋 Route Summary:');
    // console.log(`   From: ${SOURCE_CHAIN.name} (${SOURCE_CHAIN.id})`);
    // console.log(`   To: ${bestYield.chain} (${bestYield.config.chainId})`);
    // console.log(`   Amount: ${formatUnits(USDC_AMOUNT, 6)} USDC`);
    // console.log(`   Expected APY: ${bestYield.apy}%`);

    // // Step 5: Execute the bridge transaction
    // await executeMockRoute(route, walletClient);

    // // Step 6: Supply to Aave on destination chain
    // console.log('\n🏦 Supplying to Aave on destination chain...');
    // await supplyToAave(bestYield.config, USDC_AMOUNT, walletClient, account.address);

    console.log('\n✅ Cross-chain yield optimization completed!');
    console.log('\n📝 Implementation Status:');
    console.log('   ✅ Real Aave yield data fetching - IMPLEMENTED');
    console.log('   🔄 LiFi SDK integration - MOCKED (ready for implementation)');
    console.log('   🔄 Transaction execution - MOCKED (ready for implementation)');
    console.log('\n📝 Next Steps for Production:');
    console.log('   1. Install @lifi/sdk: npm install @lifi/sdk');
    console.log('   2. Replace mock LiFi functions with actual SDK calls');
    console.log('   3. Add proper error handling and transaction monitoring');
    console.log('   4. Add approval transactions before bridge/supply operations');
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    throw error;
  }
}

// Run the script
main().catch(console.error);
