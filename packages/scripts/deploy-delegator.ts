import path from 'node:path';
import dotenv from 'dotenv';
import { zeroAddress, type Hex } from 'viem';

import { sepolia as chain } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { privateKeyToAccount } from 'viem/accounts';

// Load environment variables from a specific .env file
dotenv.config({ path: path.resolve(__dirname, '.env.delegate') });

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY_DELEGATOR = process.env.PRIVATE_KEY_DELEGATOR as Hex;
const DEPLOY_SALT = process.env.DEPLOY_SALT as Hex;

if (!RPC_URL) {
  throw new Error('RPC_URL is not defined in the environment variables.');
}
if (!PRIVATE_KEY_DELEGATOR) {
  throw new Error('PRIVATE_KEY_DELEGATOR is not defined in the environment variables.');
}
if (!DEPLOY_SALT) {
  throw new Error('DEPLOY_SALT is not defined in the environment variables.');
}

// Create clients - public, bundler, and Pimlico
const publicClient = createPublicClient({
  chain,
  transport: http(),
});
// for sending user operations
const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(RPC_URL),
  paymaster: true,
});
// for getting gas prices
const pimlicoClient = createPimlicoClient({
  transport: http(RPC_URL),
});

// Create Delegator - account and smart account
const delegatorAccount = privateKeyToAccount(PRIVATE_KEY_DELEGATOR);
console.log('🔒 Delegator Account:', delegatorAccount.address);

const delegatorSmartAccount = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [delegatorAccount.address, [], [], []],
  deploySalt: DEPLOY_SALT,
  signatory: { account: delegatorAccount },
});
console.log('🧠 Delegator:', delegatorSmartAccount.address);

// Send a empty user operation to deploy the smart account
const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

const to = zeroAddress;
const value = 0n;
const data: Hex = '0x';
const call = { to, value, data };

console.log(
  `👨‍💻 Sending a user operation from Delegator: ${JSON.stringify({ ...call, value: String(value) }, null, 2)}`,
);

const userOperationHash = await bundlerClient.sendUserOperation({
  account: delegatorSmartAccount,
  calls: [call],
  ...fee,
});

console.log('#️⃣  userOperationHash:', userOperationHash);
