import dotenv from "dotenv";
import {
    toMetaMaskSmartAccount,
    Implementation,
    createDelegation,
    signDelegation,
    getDeleGatorEnvironment,
    createExecution,
    redeemDelegations,
    DelegationFramework,
    SINGLE_DEFAULT_MODE,
    type ExecutionStruct,
    type ExecutionMode,
    type Delegation
} from "@metamask/delegation-toolkit";
import {
    createWalletClient,
    createPublicClient,
    http,
    parseUnits,
    type Address,
    zeroAddress,
    parseEther,
    encodeFunctionData
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { lineaSepolia, sepolia } from "viem/chains";
import path from "path";
import { createBundlerClient } from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env.delegate") });

// Configuration constants
const TARGET_ADDRESS: Address = "0xf46A02660F466dA0BfD558A02a53FD891Fb33A44";
const CHAIN = sepolia;

// Environment variable validation and setup
function validateEnvironment() {
    const RPC_URL = process.env.RPC_URL;
    const PRIVATE_KEY_DELEGATOR = process.env.PRIVATE_KEY_DELEGATOR as `0x${string}`;
    const PRIVATE_KEY_DELEGATE = process.env.PRIVATE_KEY_DELEGATE as `0x${string}`;
    const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY;
    const ERC20_ADDRESS = process.env.ERC20_ADDRESS as Address;

    if (!RPC_URL) {
        throw new Error("RPC_URL must be set in environment variables");
    }

    if (!PRIVATE_KEY_DELEGATOR || !PRIVATE_KEY_DELEGATE) {
        throw new Error("PRIVATE_KEY_DELEGATOR and PRIVATE_KEY_DELEGATE must be set in environment variables");
    }

    if (!PIMLICO_API_KEY) {
        throw new Error("PIMLICO_API_KEY must be set in environment variables");
    }

    return {
        RPC_URL,
        PRIVATE_KEY_DELEGATOR,
        PRIVATE_KEY_DELEGATE,
        PIMLICO_API_KEY,
        ERC20_ADDRESS
    };
}

// Account setup
function setupAccounts(config: ReturnType<typeof validateEnvironment>) {
    console.log("📝 Setting up accounts...");

    const delegatorEoa = privateKeyToAccount(config.PRIVATE_KEY_DELEGATOR);
    const delegateEoa = privateKeyToAccount(config.PRIVATE_KEY_DELEGATE);

    console.log(`Account 1 (Owner): ${delegatorEoa.address}`);
    console.log(`Account 2 (Delegate): ${delegateEoa.address}`);

    return { delegatorEoa, delegateEoa };
}

// Client setup
function setupClients(config: ReturnType<typeof validateEnvironment>, delegatorEoa: any) {
    const publicClient = createPublicClient({
        chain: CHAIN,
        transport: http(config.RPC_URL),
    });

    const delegatorWalletClient = createWalletClient({
        account: delegatorEoa,
        chain: CHAIN,
        transport: http(config.RPC_URL),
    });

    return { publicClient, delegatorWalletClient };
}

// Smart account creation
async function createSmartAccount(publicClient: any, delegatorEoa: any) {
    console.log("🔐 Creating smart account...");

    const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [delegatorEoa.address, [], [], []],
        deploySalt: "0x",
        signatory: { account: delegatorEoa },
    });

    console.log(`Smart Account Address: ${smartAccount.address}`);
    return smartAccount;
}

// Delegation creation and signing
async function createAndSignDelegation(smartAccount: any, delegateEoa: any) {
    console.log("📜 Creating delegation...");

    const delegation = createDelegation({
        to: delegateEoa.address,
        from: smartAccount.address,
        caveats: [], // Root delegation with no restrictions
    });

    console.log("✍️ Signing delegation...");

    const signature = await smartAccount.signDelegation({
        delegation,
    });

    const signedDelegation = {
        ...delegation,
        signature,
    };

    console.log("✅ Delegation created and signed!");
    return signedDelegation;
}

// Delegation redemption setup
function setupDelegationRedemption(signedDelegation: any) {
    const delegations: Delegation[] = [signedDelegation];
    const mode: ExecutionMode = SINGLE_DEFAULT_MODE;
    const executions: ExecutionStruct[] = [{
        target: TARGET_ADDRESS,
        value: parseUnits("1", 0),
        callData: "0x"
    }];

    return { delegations, mode, executions };
}

// Delegation redemption setup for ERC20 transfer
function setupERC20DelegationRedemption(signedDelegation: any, erc20Address: Address, recipientAddress: Address) {
    const delegations: Delegation[] = [signedDelegation];
    const mode: ExecutionMode = SINGLE_DEFAULT_MODE;

    // ERC20 transfer function signature: transfer(address to, uint256 amount)
    const transferCalldata = encodeFunctionData({
        abi: [
            {
                name: "transfer",
                type: "function",
                stateMutability: "nonpayable",
                inputs: [
                    { name: "to", type: "address" },
                    { name: "amount", type: "uint256" }
                ],
                outputs: [{ name: "", type: "bool" }]
            }
        ],
        functionName: "transfer",
        args: [recipientAddress, 1n] // 1 unit with 6 decimal places
    });

    const executions: ExecutionStruct[] = [{
        target: erc20Address,
        value: parseUnits("0", 0), // No ETH value for ERC20 transfer
        callData: transferCalldata
    }];

    return { delegations, mode, executions };
}

// Delegation redemption setup for Aave deposit
function setupAaveDelegationRedemption(signedDelegation: any) {
    const delegations: Delegation[] = [signedDelegation];
    const mode: ExecutionMode = SINGLE_DEFAULT_MODE;

    // Aave addresses and constants
    const AAVE_TOKEN = "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a";
    const AAVE_VAULT = "0x56771cEF0cb422e125564CcCC98BB05fdc718E77"; // From vanilla-aave.ts logs
    const DEPOSIT_AMOUNT = parseUnits("1", 18); // 1 AAVE token (18 decimals)

    // For this demo, let's just do the approval step to test the delegation mechanism
    // In a real scenario, you'd first transfer AAVE tokens to the smart account
    const approveCalldata = encodeFunctionData({
        abi: [
            {
                name: "approve",
                type: "function",
                stateMutability: "nonpayable",
                inputs: [
                    { name: "spender", type: "address" },
                    { name: "amount", type: "uint256" }
                ],
                outputs: [{ name: "", type: "bool" }]
            }
        ],
        functionName: "approve",
        args: [AAVE_VAULT as Address, DEPOSIT_AMOUNT]
    });

    const executions: ExecutionStruct[] = [
        {
            target: AAVE_TOKEN as Address,
            value: parseUnits("0", 0),
            callData: approveCalldata
        }
    ];

    return { delegations, mode, executions };
}

// Transaction execution
async function executeDelegationRedemption(
    config: ReturnType<typeof validateEnvironment>,
    delegateEoa: any,
    delegations: Delegation[],
    mode: ExecutionMode,
    executions: ExecutionStruct[]
) {
    console.log("💸 Redeeming delegation to send 1 wei...");

    const delegateWalletClient = createWalletClient({
        account: delegateEoa,
        chain: CHAIN,
        transport: http(config.RPC_URL),
    });

    const redeemDelegationCalldata = DelegationFramework.encode.redeemDelegations({
        delegations: [delegations],
        modes: [mode],
        executions: [executions]
    });

    const transactionHash = await delegateWalletClient.sendTransaction({
        to: getDeleGatorEnvironment(CHAIN.id).DelegationManager,
        data: redeemDelegationCalldata,
        chain: CHAIN,
        account: delegateEoa,
        // maxFeePerGas: 100_000_000_000n,
    });

    return transactionHash;
}

// Summary logging
function logSummary(
    smartAccount: any,
    delegatorEoa: any,
    delegateEoa: any,
    signedDelegation: any,
    transactionHash: string,
    transferType: 'ETH' | 'ERC20' | 'AAVE' = 'ETH',
    erc20Address?: Address
) {
    const delegationManager = getDeleGatorEnvironment(CHAIN.id).DelegationManager;

    console.log(`📋 Account:`);
    console.log(`   - Smart Account (Delegator): ${smartAccount.address}`);
    console.log(`   - Owner (Account 1): ${delegatorEoa.address}`);
    console.log(`   - Delegate (Account 2): ${delegateEoa.address}`);

    if (transferType === 'AAVE') {
        console.log(`   - Action Type: Aave Token Approval`);
        console.log(`   - AAVE Token: 0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a`);
        console.log(`   - Aave Vault: 0x56771cEF0cb422e125564CcCC98BB05fdc718E77`);
        console.log(`   - Amount Approved: 1 AAVE token (18 decimals)`);
        console.log(`   - Note: This demo only approves tokens, doesn't deposit`);
    } else {
        console.log(`   - Target Address: ${TARGET_ADDRESS}`);
        if (transferType === 'ERC20') {
            console.log(`   - Transfer Type: ERC20 Token`);
            console.log(`   - Token Address: ${erc20Address}`);
            console.log(`   - Amount Sent: 1 token (6 decimals)`);
        } else {
            console.log(`   - Transfer Type: ETH`);
            console.log(`   - Amount Sent: 1 wei`);
        }
    }

    console.log(`   - Delegation Manager: ${delegationManager}`);

    console.log("\n🔍 Delegation Details:");
    console.log(`   - Delegate: ${signedDelegation.delegate}`);
    console.log(`   - Delegator: ${signedDelegation.delegator}`);
    console.log(`   - Authority: ${signedDelegation.authority}`);
    console.log(`   - Caveats: ${signedDelegation.caveats.length} (Root delegation - no restrictions)`);
    console.log(`   - Signature: ${signedDelegation.signature.substring(0, 10)}...`);

    console.log(`🎉 Delegation redeemed successfully!`);
    console.log(`   - Transaction Hash: ${transactionHash}`);
}

// Shared main execution function
const executeScript = async (transferType: 'ETH' | 'ERC20' | 'AAVE' = 'ETH') => {
    console.log(`🚀 Starting DTK delegation script (${transferType === 'AAVE' ? 'Aave Token Approval' : transferType + ' Transfer'})...`);

    try {
        // Step 1: Validate environment and setup
        const config = validateEnvironment();

        if (transferType === 'ERC20' && !config.ERC20_ADDRESS) {
            throw new Error("ERC20_ADDRESS must be set in environment variables for ERC20 transfer");
        }

        const { delegatorEoa, delegateEoa } = setupAccounts(config);
        const { publicClient, delegatorWalletClient } = setupClients(config, delegatorEoa);

        // Step 2: Create smart account
        const smartAccount = await createSmartAccount(publicClient, delegatorEoa);

        // Step 3: Create and sign delegation
        const signedDelegation = await createAndSignDelegation(smartAccount, delegateEoa);

        // Step 4: Setup redemption parameters based on transfer type
        let delegations, mode, executions;
        if (transferType === 'AAVE') {
            ({ delegations, mode, executions } = setupAaveDelegationRedemption(signedDelegation));
        } else if (transferType === 'ERC20') {
            ({ delegations, mode, executions } = setupERC20DelegationRedemption(signedDelegation, config.ERC20_ADDRESS!, TARGET_ADDRESS));
        } else {
            ({ delegations, mode, executions } = setupDelegationRedemption(signedDelegation));
        }

        // Step 5: Execute delegation redemption
        const transactionHash = await executeDelegationRedemption(
            config,
            delegateEoa,
            delegations,
            mode,
            executions
        );

        // Step 6: Log summary
        logSummary(
            smartAccount,
            delegatorEoa,
            delegateEoa,
            signedDelegation,
            transactionHash,
            transferType,
            transferType === 'ERC20' ? config.ERC20_ADDRESS : undefined
        );

    } catch (error) {
        console.error("❌ Error occurred:", error);
        throw error;
    }
};

// Convenience functions
const mainEth = () => executeScript('ETH');
const mainERC20 = () => executeScript('ERC20');
const mainAave = () => executeScript('AAVE');

// Run the script - Change this to mainERC20() or mainAave() to use different variants
const main = mainAave;
main().catch(console.error);