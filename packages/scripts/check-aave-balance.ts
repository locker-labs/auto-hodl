// File: check-aave-balance.ts
//------------------------------------------------------------
// Check Aave vault balances for smart account
//------------------------------------------------------------
import dotenv from 'dotenv';
import {
    createPublicClient,
    http,
    formatUnits,
    type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { erc20Abi } from 'viem';
import path from 'path';
import {
    toMetaMaskSmartAccount,
    Implementation,
} from "@metamask/delegation-toolkit";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.delegate') });

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY_DELEGATOR = process.env.PRIVATE_KEY_DELEGATOR as `0x${string}`;
const PRIVATE_KEY_DELEGATE = process.env.PRIVATE_KEY_DELEGATE as `0x${string}`;

if (!RPC_URL || !PRIVATE_KEY_DELEGATOR || !PRIVATE_KEY_DELEGATE) {
    throw new Error('RPC_URL and PRIVATE_KEY_DELEGATOR and PRIVATE_KEY_EOA must be set in environment variables');
}

// Addresses from your successful runs
const AAVE_TOKEN = "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a";
const AAVE_VAULT = "0x56771cEF0cb422e125564CcCC98BB05fdc718E77";

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
        deploySalt: "0x",
        signatory: { account: delegatorEoa },
    });
    // const smartAccount = privateKeyToAccount(PRIVATE_KEY_DELEGATOR);
    // const smartAccount = privateKeyToAccount(PRIVATE_KEY_DELEGATE);


    console.log(`📋 Account Details:`);
    console.log(`   Smart Account: ${smartAccount.address}`);
    console.log(`   Owner (EOA): ${delegatorEoa.address}`);
    console.log(`   AAVE Token: ${AAVE_TOKEN}`);
    console.log(`   Aave Vault: ${AAVE_VAULT}\n`);

    try {
        // 1. Check AAVE token balance
        const aaveBalance = await publicClient.readContract({
            address: AAVE_TOKEN as Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [smartAccount.address],
        });

        console.log(`💰 AAVE Token Balance: ${formatUnits(aaveBalance, 18)} AAVE`);

        // 2. Check AAVE token allowance to vault
        const allowance = await publicClient.readContract({
            address: AAVE_TOKEN as Address,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [smartAccount.address, AAVE_VAULT as Address],
        });

        console.log(`✅ AAVE Allowance to Vault: ${formatUnits(allowance, 18)} AAVE`);

        // 3. Check vault share balance (stataAAVE)
        const vaultBalance = await publicClient.readContract({
            address: AAVE_VAULT as Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [smartAccount.address],
        });

        console.log(`🏦 Vault Shares (stataAAVE): ${formatUnits(vaultBalance, 18)} shares`);

        // 4. If we have vault shares, check the underlying value
        if (vaultBalance > 0n) {
            const extendedVaultAbi = [
                {
                    name: 'convertToAssets',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: 'shares', type: 'uint256' }],
                    outputs: [{ name: '', type: 'uint256' }]
                }
            ] as const;

            try {
                const underlyingAssets = await publicClient.readContract({
                    address: AAVE_VAULT as Address,
                    abi: extendedVaultAbi,
                    functionName: 'convertToAssets',
                    args: [vaultBalance],
                });

                console.log(`💎 Underlying AAVE Value: ${formatUnits(underlyingAssets, 18)} AAVE`);
            } catch (error) {
                console.log(`⚠️ Could not fetch underlying value: ${error}`);
            }
        }

        // 5. Check transaction history (recent blocks)
        console.log(`\n📊 Analysis:`);

        if (allowance > 0n) {
            console.log(`✅ Delegation worked! Smart account has approved ${formatUnits(allowance, 18)} AAVE to the vault`);
        } else {
            console.log(`❌ No allowance found - delegation may have failed or been reverted`);
        }

        if (vaultBalance > 0n) {
            console.log(`✅ Smart account has deposited AAVE and received ${formatUnits(vaultBalance, 18)} vault shares`);
        } else {
            console.log(`ℹ️ No vault shares found - only approval was done (as expected from the demo)`);
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