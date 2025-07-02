import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, linea, arbitrum } from 'viem/chains';
import path from 'path';

import { getRoutes, getStepTransaction, getStatus, type RoutesRequest } from '@lifi/sdk';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.delegate') });

// Chain configurations
// https://developers.circle.com/stablecoins/usdc-contract-addresses#testnet
const CHAIN_CONFIGS = {
  linea: {
    chain: linea,
    chainId: 59144,
    usdcAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC on Linea
    rpcUrl: 'https://rpc.linea.build',
  },
  arbitrum: {
    chain: arbitrum,
    chainId: 42161,
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  base: {
    chain: base,
    chainId: 8453,
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    rpcUrl: 'https://mainnet.base.org',
  },
} as const;

// Environment variable validation
function validateEnvironment() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY_DELEGATOR as `0x${string}`;

  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY_DELEGATOR must be set in environment variables');
  }

  return { PRIVATE_KEY };
}

// Get cheapest route from Arbitrum to Base, preferring CCTP/Mayan if available
async function getCCTPRoute(amount: string, fromAddress: string): Promise<any> {
  console.log('\n🌉 Finding route from Arbitrum to Base (preferring CCTP/Mayan)...');
  console.log(`   Amount: ${amount} USDC`);

  const sourceChain = CHAIN_CONFIGS.arbitrum;
  const destinationChain = CHAIN_CONFIGS.linea;
  const routesRequest: RoutesRequest = {
    fromChainId: sourceChain.chainId,
    toChainId: destinationChain.chainId,
    fromTokenAddress: sourceChain.usdcAddress,
    toTokenAddress: destinationChain.usdcAddress,
    fromAmount: amount,
    fromAddress: fromAddress,
    options: {
      bridges: {
        allow: ['mayanMCTP'],
      },
    },
  };
  console.log('Searching for route ', routesRequest);
  try {
    const routesResponse = await getRoutes(routesRequest);

    if (!routesResponse.routes || routesResponse.routes.length === 0) {
      throw new Error('No routes found from Arbitrum to Base');
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

    // Look for CCTP/Mayan-based routes
    const preferredRoutes = routesResponse.routes.filter((route: any) =>
      route.steps.some(
        (step: any) =>
          step.tool.toLowerCase().includes('cctp') ||
          step.tool.toLowerCase().includes('circle') ||
          step.tool.toLowerCase().includes('mayan') ||
          step.tool === 'circle' ||
          step.tool === 'cctp' ||
          step.tool === 'mayan',
      ),
    );

    let selectedRoute;
    if (preferredRoutes.length > 0) {
      // Find the cheapest preferred route
      selectedRoute = preferredRoutes.reduce((cheapest, current) => {
        const currentCost = parseFloat(current.gasCostUSD || '0');
        const cheapestCost = parseFloat(cheapest.gasCostUSD || '0');
        return currentCost < cheapestCost ? current : cheapest;
      });
      console.log(`✅ Found preferred CCTP/Mayan route`);
    } else {
      console.log('⚠️ No CCTP/Mayan routes found, using cheapest available route');
      // Find the cheapest route (lowest gas cost)
      selectedRoute = routesResponse.routes.reduce((cheapest, current) => {
        const currentCost = parseFloat(current.gasCostUSD || '0');
        const cheapestCost = parseFloat(cheapest.gasCostUSD || '0');
        return currentCost < cheapestCost ? current : cheapest;
      });
    }

    console.log(`✅ Selected route:`);
    console.log(`   Route ID: ${selectedRoute.id}`);
    console.log(`   Steps: ${selectedRoute.steps.length}`);
    console.log(`   Bridge: ${selectedRoute.steps[0]?.tool}`);
    console.log(`   Gas Cost: $${selectedRoute.gasCostUSD || '0'}`);
    console.log(`   Estimated Time: ${selectedRoute.steps[0]?.estimate?.executionDuration || 'N/A'}s`);

    return selectedRoute;
  } catch (error) {
    console.error('❌ Error getting route:', error);
    throw error;
  }
}

// Execute route steps manually using viem
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function executeRouteSteps(route: any, walletClient: any, publicClient: any): Promise<void> {
  console.log('\n🚀 Executing route steps manually...');

  for (let i = 0; i < route.steps.length; i++) {
    const step = route.steps[i];
    console.log(`\n📋 Executing step ${i + 1}/${route.steps.length}...`);

    try {
      // Get transaction data for the current step
      const stepWithTxData = await getStepTransaction(step);

      if (!stepWithTxData.transactionRequest) {
        throw new Error('No transaction data received for step');
      }

      console.log('✅ Transaction data retrieved:');
      console.log(`   To: ${stepWithTxData.transactionRequest.to}`);
      console.log(`   Value: ${stepWithTxData.transactionRequest.value || '0'}`);
      console.log(`   Gas Limit: ${stepWithTxData.transactionRequest.gasLimit}`);
      console.log(`   Data Length: ${stepWithTxData.transactionRequest.data?.length || 0} bytes`);

      // Send the transaction using viem
      console.log('📤 Sending transaction...');
      const transactionHash = await walletClient.sendTransaction({
        to: stepWithTxData.transactionRequest.to as Address,
        value: BigInt(stepWithTxData.transactionRequest.value || '0'),
        data: stepWithTxData.transactionRequest.data as `0x${string}`,
        gas: BigInt(stepWithTxData.transactionRequest.gasLimit || '0'),
      });

      console.log(`✅ Transaction sent: ${transactionHash}`);

      // Monitor the status of the transaction using LiFi's getStatus
      console.log('⏳ Monitoring transaction status...');
      let status;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5-second intervals

      do {
        try {
          const result = await getStatus({
            txHash: transactionHash,
            fromChain: step.action.fromChainId,
            toChain: step.action.toChainId,
            bridge: step.tool,
          });
          status = result.status;

          console.log(`   Status check ${attempts + 1}: ${status}`);

          if (status !== 'DONE' && status !== 'FAILED') {
            // Wait for 5 seconds before checking again
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        } catch {
          console.log(`   Status check ${attempts + 1}: Pending (API error, will retry)`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        attempts++;
      } while (status !== 'DONE' && status !== 'FAILED' && attempts < maxAttempts);

      if (status === 'FAILED') {
        throw new Error(`Transaction ${transactionHash} failed`);
      } else if (status === 'DONE') {
        console.log(`✅ Step ${i + 1} completed successfully`);
      } else {
        console.log(`⚠️ Step ${i + 1} status unclear after ${maxAttempts} attempts, but continuing...`);
      }
    } catch (error) {
      console.error(`❌ Error executing step ${i + 1}:`, error);
      throw error;
    }
  }

  console.log('\n🎉 All steps executed successfully!');
}

// Main execution function
async function main(fromAmountUSDC = 1) {
  console.log('🚀 Starting Arbitrum to Base CCTP Bridge...');

  try {
    // Step 1: Validate environment
    const config = validateEnvironment();

    // Step 2: Setup wallet and clients
    const account = privateKeyToAccount(config.PRIVATE_KEY);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const walletClient = createWalletClient({
      account,
      chain: arbitrum,
      transport: http(CHAIN_CONFIGS.arbitrum.rpcUrl),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const publicClient = createPublicClient({
      chain: arbitrum,
      transport: http(CHAIN_CONFIGS.arbitrum.rpcUrl),
    });

    console.log(`👤 User address: ${account.address}`);

    // Step 3: Get route from Arbitrum to Base
    const transferAmount = (fromAmountUSDC * 1_000_000).toString(); // Convert USDC to 6 decimals
    console.log(`💰 Transfer amount: ${fromAmountUSDC} USDC (${transferAmount} raw)`);
    const route = await getCCTPRoute(transferAmount, account.address);

    // Step 4: Execute the route manually
    // await executeRouteSteps(route, walletClient, publicClient);

    console.log('\n🎯 Bridge Summary:');
    console.log(`   From: Arbitrum (${CHAIN_CONFIGS.arbitrum.chainId})`);
    console.log(`   To: Base (${CHAIN_CONFIGS.base.chainId})`);
    console.log(`   Amount: ${fromAmountUSDC} USDC`);
    console.log(`   Bridge: ${route.steps[0]?.tool || 'Unknown'}`);
    console.log(`   Gas Cost: $${route.gasCostUSD || '0'}`);

    console.log('\n✅ Cross-chain bridge route found successfully!');
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    throw error;
  }
}

// Run the script
const usdcAmount = 100;
main(usdcAmount).catch(console.error);
