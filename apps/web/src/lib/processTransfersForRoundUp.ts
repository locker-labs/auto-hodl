import {
  type Delegation,
  type ExecutionStruct,
  getDeleGatorEnvironment,
  DelegationFramework,
  ExecutionMode,
  SINGLE_DEFAULT_MODE,
} from '@metamask/delegation-toolkit';
import { delegateWalletClient } from '@/clients/delegateWalletClient';
import { publicClient } from '@/clients/publicClient';
import { IAutoHodlTx } from '../types/auto-hodl.types';
import { VIEM_CHAIN } from '@/config';
import { AAVE_POOL_ADDRESS, MM_CARD_ADDRESSES, TOKEN_DECIMAL_MULTIPLIER, USDC_ADDRESSES } from './constants';
import { encodeApproveTokensCallData, encodeSupplyCallData, erc20Abi } from './yield/aave';
import { parseUnits } from 'viem';
import { updateTransactionWithYieldDepositByTxHash, type YieldDepositInfo } from './supabase/updateTransaction';
import { pimlicoClient } from '@/clients/pimlicoClient';
import { bridgeAndRedeem } from './lifi';
import { base } from 'viem/chains';
/**
 * Redeems Aave delegations using the DTK pattern from the documentation
 * Based on: https://docs.metamask.io/delegation-toolkit/how-to/redeem-delegation/
 *
 * Note: This is a simplified implementation. In production, you would need:
 * 1. Proper DelegationFramework.encode.redeemDelegations() from DTK
 * 2. Signed delegations from the smart account owner
 * 3. Proper error handling and validation
 */
export async function redeemAaveDelegations(
  delegations: Delegation[],
  executions: ExecutionStruct[],
): Promise<`0x${string}`> {
  console.log('💸 Redeeming delegation...');

  // For multiple delegations, we need to provide arrays for each delegation
  const delegationsArray = delegations.map((delegation) => [delegation]);
  const modesArray = delegations.map((): ExecutionMode => SINGLE_DEFAULT_MODE);
  const executionsArray = executions.map((execution) => [execution]);

  const redeemDelegationCalldata = DelegationFramework.encode.redeemDelegations({
    delegations: delegationsArray,
    modes: modesArray,
    executions: executionsArray,
  });
  const fees = await pimlicoClient.getUserOperationGasPrice();

  const transactionHash = await delegateWalletClient.sendTransaction({
    to: getDeleGatorEnvironment(VIEM_CHAIN.id).DelegationManager,
    data: redeemDelegationCalldata,
    chain: VIEM_CHAIN,
    ...fees,
  });
  console.log('Redeem Delegation Transaction Hash:', transactionHash);
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

  console.log('Account data for processing:', {
    accountId,
    roundUpToDollar: account?.roundUpToDollar,
    roundUpToDollarType: typeof account?.roundUpToDollar,
    tokenSourceAddress: account?.tokenSourceAddress,
    hasAccount: !!account,
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

  // Validate roundUpToDollar before using it
  if (!roundUpToDollar || Number.isNaN(roundUpToDollar) || roundUpToDollar <= 0) {
    console.error('Invalid roundUpToDollar value for account:', {
      accountId,
      roundUpToDollar,
      type: typeof roundUpToDollar,
    });
    return null;
  }

  // Calculate savings amount for round-up using account settings
  const roundUpAmount = roundUpToDollar * TOKEN_DECIMAL_MULTIPLIER;
  const asset = token as `0x${string}`;

  // Validate TOKEN_DECIMAL_MULTIPLIER before using it
  if (!TOKEN_DECIMAL_MULTIPLIER || Number.isNaN(TOKEN_DECIMAL_MULTIPLIER)) {
    console.error('Invalid TOKEN_DECIMAL_MULTIPLIER for token:', {
      token,
      TOKEN_DECIMAL_MULTIPLIER,
      chainId,
    });
    return null;
  }

  // Debug the values before BigInt conversion
  console.log('Values before BigInt conversion:', {
    amount,
    amountType: typeof amount,
    roundUpToDollar,
    TOKEN_DECIMAL_MULTIPLIER,
    roundUpAmount,
    roundUpAmountType: typeof roundUpAmount,
    isAmountNaN: Number.isNaN(Number(amount)),
    isRoundUpAmountNaN: Number.isNaN(roundUpAmount),
  });

  const savingsAmount = calculateSavingsAmount(BigInt(amount), BigInt(roundUpAmount));
  const onBehalfOf = tokenSourceAddress as `0x${string}`; // Use savings address or fallback to spendTo

  // Validate amounts
  if (savingsAmount <= BigInt(0)) {
    console.log('Skipping transfer - savings amount is zero or negative:', savingsAmount.toString());
    return null;
  }

  // Check smart account token balance before processing
  try {
    const smartAccountBalance = (await publicClient.readContract({
      address: asset,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [onBehalfOf],
    })) as bigint;

    console.log('Smart account balance check:', {
      smartAccount: onBehalfOf,
      tokenBalance: smartAccountBalance.toString(),
      requiredAmount: savingsAmount.toString(),
      hasEnoughBalance: smartAccountBalance >= savingsAmount,
    });

    if (smartAccountBalance < savingsAmount) {
      console.log('Skipping transfer - smart account has insufficient token balance:', {
        available: smartAccountBalance.toString(),
        required: savingsAmount.toString(),
        deficit: (savingsAmount - smartAccountBalance).toString(),
      });
      return null;
    }
  } catch (error) {
    console.error('Failed to check smart account balance:', error);
    return null;
  }
  let transactionHash: `0x${string}` | null = null;
  let destinationChainId = chainId;
  if (account.chainMode === 'single-chain') {
    // Create executions for Aave pool operations (approve + supply)
    const encodedApproveCallData = encodeApproveTokensCallData(AAVE_POOL_ADDRESS, savingsAmount);
    const encodedSupplyCallData = encodeSupplyCallData(asset, savingsAmount, onBehalfOf);

    // Create execution structs following the DTK pattern
    const executions: ExecutionStruct[] = [
      {
        target: asset, // Approve the token to Aave pool
        value: parseUnits('0', 0),
        callData: encodedApproveCallData,
      },
      {
        target: AAVE_POOL_ADDRESS, // Supply to Aave pool
        value: parseUnits('0', 0),
        callData: encodedSupplyCallData,
      },
    ];

    // Redeem delegation using the proper DTK pattern with the fetched delegation
    transactionHash = await redeemAaveDelegations([delegation, delegation], executions);
  } else if (account.chainMode === 'multi-chain') {
    destinationChainId = base.id;
    transactionHash = await bridgeAndRedeem(
      delegation,
      destinationChainId,
      // Always bridge $1 to ensure there is a route
      '1000000',
      onBehalfOf,
      account.circleAddress as `0x${string}`,
    );
  }
  console.log('Redeem Delegation Transaction Hash:', transactionHash);
  // Check if transactionHash is valid
  if (!transactionHash) {
    console.error('Failed to redeem delegation - no transaction hash returned');
    return null;
  }

  // Update transaction with yield deposit information
  try {
    const yieldDepositInfo: YieldDepositInfo = {
      yieldDepositAmount: savingsAmount.toString(),
      yieldDepositChainId: destinationChainId,
      yieldDepositToken: asset,
      yieldDepositTxHash: transactionHash,
      yieldDepositAt: new Date().toISOString(),
    };

    await updateTransactionWithYieldDepositByTxHash(hash, yieldDepositInfo);
    console.log('✅ Successfully updated transaction with yield deposit info');
  } catch (error) {
    console.error('❌ Failed to update transaction with yield deposit info:', error);
    // Don't throw here - we still want to return the transaction hash even if DB update fails
  }

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
