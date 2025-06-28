import { type Delegation, type ExecutionStruct, getDeleGatorEnvironment, DelegationFramework, ExecutionMode, SINGLE_DEFAULT_MODE } from '@metamask/delegation-toolkit';
import { encodeSupplyCallData, erc20Abi, encodeApproveTokensCallData } from './yield /aave';
import { delegateWalletClient } from '@/clients/delegateWalletClient';
import { publicClient } from '@/clients/publicClient';
import { IAutoHodlTx } from '../types/auto-hodl.types';
import { VIEM_CHAIN } from '@/config';
import { AAVE_POOL_ADDRESS, MM_CARD_ADDRESSES, TOKEN_DECIMAL_MULTIPLIER, USDC_ADDRESSES } from './constants';

/**
 * Redeems Aave delegations using the DTK pattern from the documentation
 * Based on: https://docs.metamask.io/delegation-toolkit/how-to/redeem-delegation/
 *
 * Note: This is a simplified implementation. In production, you would need:
 * 1. Proper DelegationFramework.encode.redeemDelegations() from DTK
 * 2. Signed delegations from the smart account owner
 * 3. Proper error handling and validation
 */
export async function redeemAaveDelegations(delegations: Delegation[], executions: ExecutionStruct[]): Promise<`0x${string}`> {
  // Following the DTK documentation pattern for redeeming with an EOA
  // For multiple executions, we need arrays for delegations, modes, and executions
  const delegationsArray = delegations.map((delegation) => [delegation]);
  const executionsArray = executions.map((execution) => [execution]);

  // SINGLE_DEFAULT_MODE from the working script
  const mode: ExecutionMode = SINGLE_DEFAULT_MODE;
  const modesArray = delegations.map(() => mode);

  // TODO: Replace with proper DelegationFramework.encode.redeemDelegations()
  // This is a placeholder that demonstrates the structure
  console.log('Delegation redemption structure:', {
    delegationsArray: delegationsArray.length,
    modesArray: modesArray.length,
    executionsArray: executionsArray.length,
    delegationManager: getDeleGatorEnvironment(VIEM_CHAIN.id).DelegationManager,
  });

  const redeemDelegationCalldata = DelegationFramework.encode.redeemDelegations({
    delegations: delegationsArray,
    modes: modesArray,
    executions: executionsArray,
  });

  // Placeholder transaction - in production this would use the proper DTK encoding
  const transactionHash = await delegateWalletClient.sendTransaction({
    to: getDeleGatorEnvironment(VIEM_CHAIN.id).DelegationManager,
    data: redeemDelegationCalldata,
    chain: VIEM_CHAIN,
  });

  return transactionHash;
}

export async function processTransferForRoundUp(transfer: IAutoHodlTx) {
  const {
    spendTxHash: hash,
    spendFrom: from,
    spendTo: to,
    spendToken: token,
    spendAmount: amount,
    spendChainId: chainId,
    accountId,
    account,
  } = transfer;

  console.log('Processing transfer:', {
    hash,
    from,
    to,
    token,
    amount,
    chainId,
    accountId,
  });

  // Skip processing if no account is associated with this transaction
  if (!accountId || !account) {
    console.log('Skipping transfer - no associated account found');
    return null;
  }

  // Only process transfers to MetaMask Card addresses
  const isToMMCard = MM_CARD_ADDRESSES.some((cardAddress) => cardAddress.toLowerCase() === to.toLowerCase());
  if (!isToMMCard) {
    console.log('Skipping transfer - recipient is not a MetaMask Card address:', to);
    return null;
  }

  // Only process USDC transfers
  const isUSDC = USDC_ADDRESSES.some((usdcAddress) => usdcAddress.toLowerCase() === token.toLowerCase());
  if (!isUSDC) {
    console.log('Skipping transfer - token is not USDC:', token);
    return null;
  }

  // Extract delegation from the account data
  const delegation = account.delegation as Delegation;
  if (!delegation) {
    console.error('No delegation found for account:', accountId);
    return null;
  }

  // Derive values from account data
  const roundUpToDollar = account.roundUpToDollar;
  const tokenSourceAddress = account.tokenSourceAddress;
  // const roundUpMode = account.roundUpMode; // Available if needed for future logic

  // Calculate savings amount for round-up using account settings
  const roundUpAmount = roundUpToDollar * TOKEN_DECIMAL_MULTIPLIER;
  const asset = token as `0x${string}`;
  const savingsAmount = calculateSavingsAmount(BigInt(amount), BigInt(roundUpAmount));
  const onBehalfOf = tokenSourceAddress as `0x${string}`; // Use savings address or fallback to spendTo

  // Create executions for Aave pool operations (approve + supply)
  const encodedApproveCallData = encodeApproveTokensCallData(AAVE_POOL_ADDRESS, savingsAmount);
  const encodedSupplyCallData = encodeSupplyCallData(asset, savingsAmount, onBehalfOf);

  // Create execution structs following the DTK pattern
  const executions: ExecutionStruct[] = [
    {
      target: asset, // Approve the token to Aave pool
      value: BigInt(0),
      callData: encodedApproveCallData,
    },
    {
      target: AAVE_POOL_ADDRESS, // Supply to Aave pool
      value: BigInt(0),
      callData: encodedSupplyCallData,
    },
  ];

  // Redeem delegation using the proper DTK pattern with the fetched delegation
  const transactionHash = await redeemAaveDelegations([delegation, delegation], executions);

  console.log('Encoded approve call data:', encodedApproveCallData);
  console.log('Encoded supply call data:', encodedSupplyCallData);
  console.log('Redeem Delegation Transaction Hash:', transactionHash);
  return transactionHash;
}

function calculateSavingsAmount(amount: bigint, roundUpTo: bigint) {
  const roundUpAmount = ((amount + roundUpTo - BigInt(1)) / roundUpTo) * roundUpTo;
  const savingsAmount = roundUpAmount - amount;
  return savingsAmount;
}

export async function processTransfersForRoundUp(transfers: IAutoHodlTx[]) {
  // Process each relevant transfer
  for (const transfer of transfers) {
    await processTransferForRoundUp(transfer);
  }
}

/**
 * Sends both approve and supply transactions using delegateWalletClient (EOA)
 * @param transfer - The transfer object
 * @param spender - The address to approve (Aave pool address)
 * @param aavePoolAddress - The Aave pool contract address
 */
export async function sendApproveAndSupplyWithDelegate(transfer: IAutoHodlTx, aavePoolAddress: `0x${string}`) {
  const { spendToken: token, spendAmount: amount } = transfer;
  // const { spendFrom: from, spendTo: to } = transfer; // Available if needed

  // Approve transaction
  const approveTxHash = await delegateWalletClient.writeContract({
    address: token as `0x${string}`,
    abi: erc20Abi,
    functionName: 'approve',
    args: [aavePoolAddress, BigInt(amount)],
  });
  // Optionally wait for confirmation here if needed
  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

  // Supply transaction - TODO: Implement actual supply logic
  // const roundUpAmount = 100;
  // const tokenBalance = 100;
  // const asset = token as `0x${string}`;
  // const savingsAmount = calculateSavingsAmount(BigInt(amount), BigInt(roundUpAmount), BigInt(tokenBalance));
  // const onBehalfOf = recipient as `0x${string}`;
  // const referralCode = 0;
}
