// File: deposittokenViaStaticAToken.ts
//------------------------------------------------------------
// 1. Imports & basic setup
//------------------------------------------------------------
import dotenv from 'dotenv';
import {
    createPublicClient,
    createWalletClient,
    http,
    parseUnits,
    zeroAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { erc20Abi } from 'viem';
import path from 'path';

import { AaveV3Sepolia } from '@bgd-labs/aave-address-book';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.delegate') });

// IStaticATokenFactory ABI - minimal required functions
const IStaticATokenFactory = [
    {
        name: 'getStaticAToken',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'underlying', type: 'address' }],
        outputs: [{ name: '', type: 'address' }]
    },
    {
        name: 'deployStaticAToken',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'underlying', type: 'address' }],
        outputs: []
    }
] as const;

// ----- Environment variables -----------------------------------------------------
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY_DELEGATOR as `0x${string}`;
const USDC = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8'; // 6 decimals
const AAVE = '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a'; // 18 decimals - corrected address

const token = AAVE
const depositAmount = '1'; // "1 token"
const tokenDecimals = 18 // AAVE has 18 decimals
const decimals = 1e18

// Validation
if (!RPC_URL) {
    throw new Error('RPC_URL must be set in environment variables');
}

if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY_DELEGATOR must be set in environment variables');
}
//------------------------------------------------------------------------------

const main = async () => {
    // 2. Clients
    const account = privateKeyToAccount(PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });
    const walletClient = createWalletClient({ chain: sepolia, transport: http(RPC_URL), account });

    // 3. Grab—or deploy—the Static-aToken ("vault") for token
    const factory = {
        address: AaveV3Sepolia.LEGACY_STATIC_A_TOKEN_FACTORY as `0x${string}`,
        abi: IStaticATokenFactory,
    };

    // Ask registry for the vault
    let vaultAddress: `0x${string}` = await publicClient.readContract({
        ...factory,
        functionName: 'getStaticAToken',
        args: [token as `0x${string}`],
    });

    // If nobody has deployed it yet on Sepolia, do it once
    if (vaultAddress === zeroAddress) {
        console.log('No vault yet. Deploying…');
        const { request } = await publicClient.simulateContract({
            ...factory,
            functionName: 'deployStaticAToken',
            args: [token as `0x${string}`],
            account,
        });
        await walletClient.writeContract(request);
        // wait a couple blocks, then query again
        vaultAddress = await publicClient.readContract({
            ...factory,
            functionName: 'getStaticAToken',
            args: [token as `0x${string}`],
        });
    }
    console.log('✓ vault (statatoken) at →', vaultAddress);

    // 4. Check balances and limits before proceeding
    console.log('🔍 Checking balances and limits...');

    // Check token balance
    const tokenBalance = await publicClient.readContract({
        address: token as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account.address],
    });
    console.log(`token Balance: ${Number(tokenBalance) / decimals} token`);

    // Check vault limits
    const extendedStataAbi = [
        {
            name: 'deposit',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'assets', type: 'uint256' },
                { name: 'receiver', type: 'address' }
            ],
            outputs: [{ name: 'shares', type: 'uint256' }]
        },
        {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }]
        },
        {
            name: 'convertToAssets',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'shares', type: 'uint256' }],
            outputs: [{ name: '', type: 'uint256' }]
        },
        {
            name: 'maxDeposit',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'receiver', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }]
        },
        {
            name: 'totalSupply',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'uint256' }]
        },
        {
            name: 'totalAssets',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'uint256' }]
        }
    ] as const;

    const maxDeposit = await publicClient.readContract({
        address: vaultAddress,
        abi: extendedStataAbi,
        functionName: 'maxDeposit',
        args: [account.address],
    });

    const totalSupply = await publicClient.readContract({
        address: vaultAddress,
        abi: extendedStataAbi,
        functionName: 'totalSupply',
        args: [],
    });

    const totalAssets = await publicClient.readContract({
        address: vaultAddress,
        abi: extendedStataAbi,
        functionName: 'totalAssets',
        args: [],
    });

    console.log(`Max Deposit Allowed: ${Number(maxDeposit) / decimals} token`);
    console.log(`Vault Total Supply: ${Number(totalSupply) / decimals} shares`);
    console.log(`Vault Total Assets: ${Number(totalAssets) / decimals} token`);

    const amount = parseUnits(depositAmount, tokenDecimals);
    console.log(`Attempting to deposit: ${Number(amount) / decimals} token`);

    // Check if we have enough token
    if (tokenBalance < amount) {
        throw new Error(`Insufficient token balance. Have: ${Number(tokenBalance) / decimals} token, Need: ${Number(amount) / decimals} token`);
    }

    // Check if deposit amount exceeds maximum allowed
    if (amount > maxDeposit) {
        console.log(`⚠️ Deposit amount (${Number(amount) / decimals} token) exceeds maximum allowed (${Number(maxDeposit) / decimals} token)`);
        console.log(`Adjusting deposit amount to maximum allowed...`);
        // Use the maximum allowed amount instead
        const adjustedAmount = maxDeposit;

        if (adjustedAmount === 0n) {
            console.log('⚠️ Static token vault is full. Trying direct Aave Pool interaction...');

            // Check Aave supply caps first
            const dataProviderAbi = [
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
                        { name: 'supplyCap', type: 'uint256' },
                        { name: 'borrowCap', type: 'uint256' }
                    ]
                },
                {
                    name: 'getReserveData',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: 'asset', type: 'address' }],
                    outputs: [
                        { name: 'availableLiquidity', type: 'uint256' },
                        { name: 'totalStableDebt', type: 'uint256' },
                        { name: 'totalVariableDebt', type: 'uint256' },
                        { name: 'liquidityRate', type: 'uint256' },
                        { name: 'variableBorrowRate', type: 'uint256' },
                        { name: 'stableBorrowRate', type: 'uint256' },
                        { name: 'averageStableBorrowRate', type: 'uint256' },
                        { name: 'liquidityIndex', type: 'uint256' },
                        { name: 'variableBorrowIndex', type: 'uint256' },
                        { name: 'lastUpdateTimestamp', type: 'uint40' }
                    ]
                }
            ] as const;

            const dataProviderAddress = AaveV3Sepolia.AAVE_PROTOCOL_DATA_PROVIDER as `0x${string}`;

            try {
                const configData = await publicClient.readContract({
                    address: dataProviderAddress,
                    abi: dataProviderAbi,
                    functionName: 'getReserveConfigurationData',
                    args: [token as `0x${string}`],
                });

                const reserveData = await publicClient.readContract({
                    address: dataProviderAddress,
                    abi: dataProviderAbi,
                    functionName: 'getReserveData',
                    args: [token as `0x${string}`],
                });

                const supplyCap = Number(configData[10]) / decimals; // Supply cap in token
                const totalSupplied = (Number(reserveData[0]) + Number(reserveData[1]) + Number(reserveData[2])) / decimals;

                console.log(`📊 Aave token Market Status:`);
                console.log(`   Supply Cap: ${supplyCap} token`);
                console.log(`   Total Supplied: ${totalSupplied} token`);
                console.log(`   Available: ${supplyCap - totalSupplied} token`);
                console.log(`   Is Active: ${configData[8]}`);
                console.log(`   Is Frozen: ${configData[9]}`);

                if (totalSupplied >= supplyCap) {
                    console.log('❌ token supply cap reached on Aave Sepolia!');
                    console.log('💡 Suggestions:');
                    console.log('   1. Try a different asset (ETH, DAI, etc.)');
                    console.log('   2. Use mainnet instead of Sepolia');
                    console.log('   3. Wait for withdrawals to free up capacity');
                    return;
                }

            } catch (error) {
                console.log('Could not fetch supply cap data:', error);
            }

            // Alternative: Direct Aave Pool interaction
            const poolAbi = [
                {
                    name: 'supply',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [
                        { name: 'asset', type: 'address' },
                        { name: 'amount', type: 'uint256' },
                        { name: 'onBehalfOf', type: 'address' },
                        { name: 'referralCode', type: 'uint16' }
                    ],
                    outputs: []
                }
            ] as const;

            const poolAddress = AaveV3Sepolia.POOL as `0x${string}`;
            console.log(`Using direct Aave Pool at: ${poolAddress}`);

            // Approve token to the Pool
            await walletClient.writeContract({
                address: token as `0x${string}`,
                abi: erc20Abi,
                functionName: 'approve',
                args: [poolAddress, amount],
            });
            console.log('✓ Pool approval tx mined');

            // Supply to Aave Pool directly
            await walletClient.writeContract({
                address: poolAddress,
                abi: poolAbi,
                functionName: 'supply',
                args: [token as `0x${string}`, amount, account.address, 0],
            });
            console.log(`✓ Supplied ${depositAmount} token directly to Aave Pool`);

            // Check aToken balance (atoken on Sepolia)
            const aTokenAddress = '0x16dA4541aD1807f4443d92D26044C1147406EB80' as `0x${string}`; // atoken on Sepolia
            const aTokenBalance = await publicClient.readContract({
                address: aTokenAddress,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [account.address],
            });
            console.log('atoken Balance:', Number(aTokenBalance) / decimals, 'atoken');

            return; // Exit early since we used direct pool interaction
        }

        // Update amount to the maximum allowed
        console.log(`New deposit amount: ${Number(adjustedAmount) / decimals} token`);

        // 5. Approve token to the vault
        console.log(`Approving ${Number(adjustedAmount) / decimals} token to vault ${vaultAddress}...`);
        const approveTxHash = await walletClient.writeContract({
            address: token as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            args: [vaultAddress, adjustedAmount],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

        // Check allowance after approval
        const allowance = await publicClient.readContract({
            address: token as `0x${string}`,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [account.address, vaultAddress],
        });
        console.log(`✓ approval tx mined. Allowance: ${Number(allowance) / decimals} token`);

        // 6. Deposit into the vault
        await walletClient.writeContract({
            address: vaultAddress,
            abi: extendedStataAbi,
            functionName: 'deposit',
            args: [adjustedAmount, account.address],
        });
        console.log(`✓ deposited ${Number(adjustedAmount) / decimals} token`);

    } else {
        // 5. Approve token to the vault
        console.log(`Approving ${Number(amount) / decimals} token to vault ${vaultAddress}...`);
        const approveTxHash = await walletClient.writeContract({
            address: token as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            args: [vaultAddress, amount],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

        // Check allowance after approval
        const allowance = await publicClient.readContract({
            address: token as `0x${string}`,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [account.address, vaultAddress],
        });
        console.log(`✓ approval tx mined. Allowance: ${Number(allowance) / decimals} token`);

        // 6. Deposit into the vault
        await walletClient.writeContract({
            address: vaultAddress,
            abi: extendedStataAbi,
            functionName: 'deposit',
            args: [amount, account.address],
        });
        console.log(`✓ deposited ${depositAmount} token`);
    }

    // 7. Read back underlying balance (accrues as interest grows)
    const shares = await publicClient.readContract({
        address: vaultAddress,
        abi: extendedStataAbi,
        functionName: 'balanceOf',
        args: [account.address],
    });
    const assets = await publicClient.readContract({
        address: vaultAddress,
        abi: extendedStataAbi,
        functionName: 'convertToAssets',
        args: [shares],
    });
    console.log('Current underlying token:', Number(assets) / decimals, 'token');
};

// Run the script
main().catch(console.error);
