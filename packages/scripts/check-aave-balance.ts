// File: check-aave-balance.ts
//------------------------------------------------------------
// Check Aave vault balances for smart account
//------------------------------------------------------------
import dotenv from 'dotenv';
import { createPublicClient, http, formatUnits, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { erc20Abi } from 'viem';
import path from 'path';
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.delegate') });

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY_DELEGATOR = process.env.PRIVATE_KEY_DELEGATOR as `0x${string}`;
const PRIVATE_KEY_DELEGATE = process.env.PRIVATE_KEY_DELEGATE as `0x${string}`;

if (!RPC_URL || !PRIVATE_KEY_DELEGATOR || !PRIVATE_KEY_DELEGATE) {
  throw new Error('RPC_URL and PRIVATE_KEY_DELEGATOR and PRIVATE_KEY_EOA must be set in environment variables');
}

// Addresses from your successful runs
const AAVE_TOKEN = '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a';
const AAVE_POOL = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951';
// Note: aAAVE token address needs to be found - this is what you receive when supplying to the pool

const main = async () => {
  console.log('🔍 Checking Aave balances for smart account...\n');

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  // Recreate the same smart account
  const delegatorEoa = privateKeyToAccount(PRIVATE_KEY_DELEGATOR);
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [delegatorEoa.address, [], [], []],
    deploySalt: '0x',
    signatory: { account: delegatorEoa },
  });
  // const smartAccount = privateKeyToAccount(PRIVATE_KEY_DELEGATOR);
  // const smartAccount = privateKeyToAccount(PRIVATE_KEY_DELEGATE);

  console.log(`📋 Account Details:`);
  console.log(`   Smart Account: ${smartAccount.address}`);
  console.log(`   Owner (EOA): ${delegatorEoa.address}`);
  console.log(`   AAVE Token: ${AAVE_TOKEN}`);
  console.log(`   Aave Pool: ${AAVE_POOL}\n`);

  try {
    // 1. Check AAVE token balance
    const aaveBalance = await publicClient.readContract({
      address: AAVE_TOKEN as Address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [smartAccount.address],
    });

    console.log(`💰 AAVE Token Balance: ${formatUnits(aaveBalance, 18)} AAVE`);

    // 2. Check AAVE token allowance to pool
    const allowance = await publicClient.readContract({
      address: AAVE_TOKEN as Address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [smartAccount.address, AAVE_POOL as Address],
    });

    console.log(`✅ AAVE Allowance to Pool: ${formatUnits(allowance, 18)} AAVE`);

    // 3. Check if we can get aAAVE token address from the pool
    console.log(`🔍 Checking pool supply...`);

    // For now, let's try to get reserve data to find the aToken address
    const poolAbi = [
      {
        name: 'getReserveData',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'asset', type: 'address' }],
        outputs: [
          {
            name: '',
            type: 'tuple',
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
          },
        ],
      },
    ] as const;

    let aTokenBalance = 0n;
    try {
      const reserveData = await publicClient.readContract({
        address: AAVE_POOL as Address,
        abi: poolAbi,
        functionName: 'getReserveData',
        args: [AAVE_TOKEN as Address],
      });

      const aTokenAddress = reserveData.aTokenAddress;
      console.log(`📍 aAAVE Token Address: ${aTokenAddress}`);

      // Check aAAVE balance
      aTokenBalance = await publicClient.readContract({
        address: aTokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [smartAccount.address],
      });

      console.log(`🏦 aAAVE Balance: ${formatUnits(aTokenBalance, 18)} aAAVE`);
    } catch (error) {
      console.log(`⚠️ Could not fetch aToken data: ${error}`);
    }

    // 4. Analysis
    console.log(`\n📊 Analysis:`);

    if (allowance > 0n) {
      console.log(`✅ Delegation worked! Smart account has approved ${formatUnits(allowance, 18)} AAVE to the pool`);
    } else {
      console.log(`❌ No allowance found - delegation may have failed or been reverted`);
    }

    if (aTokenBalance > 0n) {
      console.log(`✅ Smart account has supplied AAVE and received ${formatUnits(aTokenBalance, 18)} aAAVE tokens`);
      console.log(`💡 This means the pool supply was successful!`);
    } else {
      console.log(`ℹ️ No aAAVE tokens found - either only approval was done or supply failed`);
    }

    if (aaveBalance > 0n) {
      console.log(`💰 Smart account has ${formatUnits(aaveBalance, 18)} AAVE tokens available`);
    } else {
      console.log(`ℹ️ Smart account has no AAVE tokens (normal for approval-only demo)`);
    }

    // 6. Check if smart account has been deployed
    const code = await publicClient.getBytecode({
      address: smartAccount.address,
    });

    if (code && code !== '0x') {
      console.log(`✅ Smart account is deployed (${code.length} bytes of code)`);
    } else {
      console.log(`ℹ️ Smart account not yet deployed (will deploy on first transaction)`);
    }
  } catch (error) {
    console.error('❌ Error checking balances:', error);
  }
};

main().catch(console.error);
