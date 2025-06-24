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

const main = async () => {
    console.log("🚀 Starting DTK delegation script...");

    // Configuration from environment variables
    const RPC_URL = process.env.RPC_URL
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

    // Target address to send 1 wei to
    const TARGET_ADDRESS: Address = "0xf46A02660F466dA0BfD558A02a53FD891Fb33A44";
    const chain = sepolia;

    try {
        // Step 1: Create accounts from private keys
        console.log("📝 Setting up accounts...");
        const delegatorEoa = privateKeyToAccount(PRIVATE_KEY_DELEGATOR); // Owner of smart account
        const delegateEoa = privateKeyToAccount(PRIVATE_KEY_DELEGATE); // Delegate

        console.log(`Account 1 (Owner): ${delegatorEoa.address}`);
        console.log(`Account 2 (Delegate): ${delegateEoa.address}`);

        // Create clients
        const publicClient = createPublicClient({
            chain,
            transport: http(RPC_URL),
        });

        const walletClient = createWalletClient({
            account: delegatorEoa,
            chain,
            transport: http(RPC_URL),
        });

        // Step 2: Create smart account with delegatorEoa as owner
        console.log("🔐 Creating smart account...");
        const smartAccount = await toMetaMaskSmartAccount({
            client: publicClient,
            implementation: Implementation.Hybrid,
            deployParams: [delegatorEoa.address, [], [], []],
            deploySalt: "0x",
            signatory: { account: delegatorEoa },
        });

        console.log(`Smart Account Address: ${smartAccount.address}`);

        // const pimlicoUrl = `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${PIMLICO_API_KEY}`

        // const bundlerClient = createBundlerClient({
        //     client: publicClient,
        //     transport: http(pimlicoUrl)
        // });

        // const pimlicoClient = createPimlicoClient({
        //     transport: http(pimlicoUrl), // You can get the API Key from the Pimlico dashboard.
        // });

        // const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

        // const userOperationHash = await bundlerClient.sendUserOperation({
        //     account: smartAccount,
        //     calls: [
        //         {
        //             to: TARGET_ADDRESS,
        //             value: parseUnits("1", 0)
        //         }
        //     ],
        //     ...fee
        // });

        // const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        //     hash: userOperationHash
        // });

        // console.log(receipt.transactionHash);

        // Step 3: Create root delegation to delegateEoa
        console.log("📜 Creating delegation...");
        const delegation = createDelegation({
            to: delegateEoa.address,
            from: smartAccount.address,
            caveats: [], // Root delegation with no restrictions
        });

        // Step 4: Sign the delegation with the smart account owner
        console.log("✍️ Signing delegation...");
        const delegationManager = getDeleGatorEnvironment(chain.id).DelegationManager;

        const signature = await smartAccount.signDelegation({
            delegation,
        });

        const signedDelegation = {
            ...delegation,
            signature,
        };

        console.log("✅ Delegation created and signed!");

        // Step 5: Redeem the delegation to send 1 wei
        console.log("💸 Redeeming delegation to send 1 wei...");

        // Create delegate wallet client
        const delegateWalletClient = createWalletClient({
            account: delegateEoa,
            chain,
            transport: http(RPC_URL),
        });

        // Create execution to send 1 wei to target address
        const delegations: Delegation[] = [signedDelegation];

        // SINGLE_DEFAULT_MODE is the default execution mode.
        const mode: ExecutionMode = SINGLE_DEFAULT_MODE;

        // For SINGLE execution modes, the executions array must be length 1.
        // Modify the executions to fit your use case.
        const executions: ExecutionStruct[] = [{
            target: TARGET_ADDRESS,
            value: parseUnits("1", 0),
            callData: "0x"
        }];

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

        const redeemDelegationCalldata = DelegationFramework.encode.redeemDelegations({
            delegations: [delegations],
            modes: [mode],
            executions: [executions]
        });

        const transactionHash = await delegateWalletClient.sendTransaction({
            to: getDeleGatorEnvironment(chain.id).DelegationManager,
            data: redeemDelegationCalldata,
            chain,
            // maxFeePerGas: 100_000_000_000n,
        });

        console.log(`🎉 Delegation redeemed successfully!`);
        console.log(`   - Transaction Hash: ${transactionHash}`);

    } catch (error) {
        console.error("❌ Error occurred:", error);
        throw error;
    }
};

// Run the script
main().catch(console.error);