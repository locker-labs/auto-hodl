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
    parseEther
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
        PIMLICO_API_KEY
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

    const walletClient = createWalletClient({
        account: delegatorEoa,
        chain: CHAIN,
        transport: http(config.RPC_URL),
    });

    return { publicClient, walletClient };
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
    transactionHash: string
) {
    const delegationManager = getDeleGatorEnvironment(CHAIN.id).DelegationManager;

    console.log(`📋 Account:`);
    console.log(`   - Smart Account (Delegator): ${smartAccount.address}`);
    console.log(`   - Owner (Account 1): ${delegatorEoa.address}`);
    console.log(`   - Delegate (Account 2): ${delegateEoa.address}`);
    console.log(`   - Target Address: ${TARGET_ADDRESS}`);
    console.log(`   - Amount Sent: 1 wei`);
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

// Main execution function
const main = async () => {
    console.log("🚀 Starting DTK delegation script...");

    try {
        // Step 1: Validate environment and setup
        const config = validateEnvironment();
        const { delegatorEoa, delegateEoa } = setupAccounts(config);
        const { publicClient, walletClient } = setupClients(config, delegatorEoa);

        // Step 2: Create smart account
        const smartAccount = await createSmartAccount(publicClient, delegatorEoa);

        // Step 3: Create and sign delegation
        const signedDelegation = await createAndSignDelegation(smartAccount, delegateEoa);

        // Step 4: Setup redemption parameters
        const { delegations, mode, executions } = setupDelegationRedemption(signedDelegation);

        // Step 5: Execute delegation redemption
        const transactionHash = await executeDelegationRedemption(
            config,
            delegateEoa,
            delegations,
            mode,
            executions
        );

        // Step 6: Log summary
        logSummary(smartAccount, delegatorEoa, delegateEoa, signedDelegation, transactionHash);

    } catch (error) {
        console.error("❌ Error occurred:", error);
        throw error;
    }
};

// Run the script
main().catch(console.error);