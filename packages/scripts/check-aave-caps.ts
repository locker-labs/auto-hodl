// File: check-aave-caps.ts
//------------------------------------------------------------
// Check supply caps and utilization for all assets on Sepolia Aave
//------------------------------------------------------------
import dotenv from 'dotenv';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import path from 'path';

import { AaveV3Sepolia } from '@bgd-labs/aave-address-book';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.delegate') });

const RPC_URL = process.env.RPC_URL;

if (!RPC_URL) {
  throw new Error('RPC_URL must be set in environment variables');
}

// Common assets on Sepolia with their decimals
const ASSETS = {
  USDC: { address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', decimals: 6 },
  WETH: { address: '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c', decimals: 18 },
  DAI: { address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357', decimals: 18 },
  LINK: { address: '0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5', decimals: 18 },
  USDT: { address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6 },
  WBTC: { address: '0x29f2D40B0605204364af54EC677bD022dA425d03', decimals: 8 },
  AAVE: { address: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', decimals: 18 },
  GHO: { address: '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60', decimals: 18 },
};

// Protocol Data Provider ABI
const protocolDataProviderAbi = [
  {
    name: 'getReserveConfigurationData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { name: 'decimals', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'liquidationThreshold', type: 'uint256' },
      { name: 'liquidationBonus', type: 'uint256' },
      { name: 'reserveFactor', type: 'uint256' },
      { name: 'usageAsCollateralEnabled', type: 'bool' },
      { name: 'borrowingEnabled', type: 'bool' },
      { name: 'stableBorrowRateEnabled', type: 'bool' },
      { name: 'isActive', type: 'bool' },
      { name: 'isFrozen', type: 'bool' },
    ],
  },
  {
    name: 'getReserveCaps',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { name: 'borrowCap', type: 'uint256' },
      { name: 'supplyCap', type: 'uint256' },
    ],
  },
  {
    name: 'getReserveData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { name: 'unbacked', type: 'uint256' },
      { name: 'accruedToTreasuryScaled', type: 'uint256' },
      { name: 'totalAToken', type: 'uint256' },
      { name: 'totalStableDebt', type: 'uint256' },
      { name: 'totalVariableDebt', type: 'uint256' },
      { name: 'liquidityRate', type: 'uint256' },
      { name: 'variableBorrowRate', type: 'uint256' },
      { name: 'stableBorrowRate', type: 'uint256' },
      { name: 'averageStableBorrowRate', type: 'uint256' },
      { name: 'liquidityIndex', type: 'uint256' },
      { name: 'variableBorrowIndex', type: 'uint256' },
      { name: 'lastUpdateTimestamp', type: 'uint40' },
    ],
  },
] as const;

const main = async () => {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  console.log('🔍 Checking Aave V3 Sepolia supply caps and utilization...\n');
  console.log(
    'Asset'.padEnd(8) +
      'Supply Cap'.padEnd(15) +
      'Current Supply'.padEnd(18) +
      'Available'.padEnd(15) +
      'Utilization'.padEnd(12) +
      'Status',
  );
  console.log('─'.repeat(80));

  const dataProvider = {
    address: AaveV3Sepolia.AAVE_PROTOCOL_DATA_PROVIDER as `0x${string}`,
    abi: protocolDataProviderAbi,
  };

  const results = [];

  for (const [symbol, { address, decimals }] of Object.entries(ASSETS)) {
    try {
      // Get supply caps
      const [borrowCap, supplyCap] = await publicClient.readContract({
        ...dataProvider,
        functionName: 'getReserveCaps',
        args: [address as `0x${string}`],
      });

      // Get current supply data
      const reserveData = await publicClient.readContract({
        ...dataProvider,
        functionName: 'getReserveData',
        args: [address as `0x${string}`],
      });

      // Get configuration to check if active
      const configData = await publicClient.readContract({
        ...dataProvider,
        functionName: 'getReserveConfigurationData',
        args: [address as `0x${string}`],
      });

      const totalSupply = reserveData[2]; // totalAToken
      const supplyCapFormatted = supplyCap === 0n ? 'No Cap' : formatUnits(supplyCap, decimals);
      const totalSupplyFormatted = formatUnits(totalSupply, decimals);

      let available = 'N/A';
      let utilization = 'N/A';
      let status = 'Unknown';

      if (supplyCap === 0n) {
        available = 'Unlimited';
        utilization = 'N/A';
        status = '🟢 Available';
      } else {
        const availableAmount = supplyCap - totalSupply;
        available = formatUnits(availableAmount, decimals);
        const utilizationPercent = (Number(totalSupply) / Number(supplyCap)) * 100;
        utilization = `${utilizationPercent.toFixed(1)}%`;

        if (availableAmount <= 0n) {
          status = '🔴 Full';
        } else if (utilizationPercent > 90) {
          status = '🟡 Near Full';
        } else {
          status = '🟢 Available';
        }
      }

      if (!configData[8]) {
        // isActive
        status = '⚫ Inactive';
      }

      if (configData[9]) {
        // isFrozen
        status = '🔵 Frozen';
      }

      console.log(
        symbol.padEnd(8) +
          String(supplyCapFormatted).padEnd(15) +
          String(totalSupplyFormatted).padEnd(18) +
          String(available).padEnd(15) +
          String(utilization).padEnd(12) +
          status,
      );

      results.push({
        symbol,
        address,
        supplyCap,
        totalSupply,
        available: supplyCap === 0n ? 'unlimited' : formatUnits(supplyCap - totalSupply, decimals),
        utilization: supplyCap === 0n ? 0 : (Number(totalSupply) / Number(supplyCap)) * 100,
        status: status.replace(/[🟢🟡🔴⚫🔵] /, ''),
        isActive: configData[8],
        isFrozen: configData[9],
      });
    } catch (error) {
      console.log(symbol.padEnd(8) + 'Error fetching data'.padEnd(50) + '❌ Error');
      console.error(`Error for ${symbol}:`, error);
    }
  }

  // Summary of best options
  console.log('\n📊 Summary - Best assets to use:');
  const availableAssets = results.filter(
    (r) =>
      r.isActive &&
      !r.isFrozen &&
      (r.available === 'unlimited' || (typeof r.available === 'string' && parseFloat(r.available) > 0)),
  );

  if (availableAssets.length === 0) {
    console.log('❌ No assets currently available for deposits');
  } else {
    console.log('✅ Available assets (sorted by capacity):');
    availableAssets
      .sort((a, b) => {
        if (a.available === 'unlimited') return -1;
        if (b.available === 'unlimited') return 1;
        return parseFloat(b.available) - parseFloat(a.available);
      })
      .forEach((asset) => {
        console.log(
          `   ${asset.symbol}: ${asset.available === 'unlimited' ? 'No supply cap' : `${asset.available} available`}`,
        );
      });
  }
};

main().catch(console.error);
