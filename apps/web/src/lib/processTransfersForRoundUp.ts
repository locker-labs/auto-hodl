import { createExecution,DelegationFramework, Delegation, SINGLE_DEFAULT_MODE, getDeleGatorEnvironment} from "@metamask/delegation-toolkit";
import { encodeSupplyCallData, erc20Abi, encodeApproveTokensCallData } from './yield /aave';
import { delegateWalletClient } from '@/clients/delegateWalletClient';
import { publicClient } from '@/clients/publicClient';
import { AAVE_POOL_ADDRESS } from '@/config';
import { ITransfer } from './types';
import { VIEM_CHAIN } from '@/config';


export async function processTransferForRoundUp(transfer: ITransfer) {
  console.log('Processing transfer:', {
    hash: transfer.transactionHash,
    from: transfer.from,
    to: transfer.to,
    token: transfer.tokenSymbol,
    amount: transfer.amount,
    chain: transfer.chain,
  });

  // TODO
  // - Store transfer in database
  // - Fetch savings address and round up amount from DB for address
  // - Calculate round-up amount
  // - Trigger savings transaction and save to DB

  // Example: Encode call to transfer funds to Aave pool
  // NOTE: You must replace these with actual values from your DB or logic
  const roundUpAmount = 100;
  const tokenBalance = 100_000;
  const delegations: Delegation[] = [];
  const asset = transfer.tokenAddress as `0x${string}`;
  const amount = calculateSavingsAmount(BigInt(transfer.amount), BigInt(roundUpAmount), BigInt(tokenBalance));
  const onBehalfOf = transfer.from as `0x${string}`; // Or fetched savings address

  const encodedSupplyCallData = encodeSupplyCallData(asset, amount, onBehalfOf);
  const encodedApproveCallData = encodeApproveTokensCallData(asset, amount);
  const approvalExecution = createExecution(asset,0n,encodedApproveCallData,);
  const supplyExecution = createExecution(AAVE_POOL_ADDRESS,0n,encodedSupplyCallData,);
  const executions = [approvalExecution, supplyExecution];
  
  const redeemDelegationCalldata = DelegationFramework.encode.redeemDelegations({
    delegations: [ delegations ],
    modes: [ SINGLE_DEFAULT_MODE ],
    executions: [ executions ]
  });
  const transactionHash = await delegateWalletClient.sendTransaction({
    to: getDeleGatorEnvironment(VIEM_CHAIN.id).DelegationManager,
    data: redeemDelegationCalldata,
    VIEM_CHAIN,
  });
  console.log("Redeem Delegation Transaction Hash:", transactionHash);
  return transactionHash;
}


function calculateSavingsAmount(amount: bigint, roundUpTo: bigint, tokenBalance: bigint) {
  const roundUpAmount = ((amount + roundUpTo - BigInt(1)) / roundUpTo) * roundUpTo;
  let savingsAmount = BigInt(0);
  if (tokenBalance < roundUpAmount) {
    savingsAmount = tokenBalance - amount;
  } else {
    savingsAmount = roundUpAmount - amount;
  }
  return savingsAmount;
}

export function processTransfersForRoundUp(transfers: ITransfer[]) {
  // Process each relevant transfer
  for (const transfer of transfers) {
    processTransferForRoundUp(transfer);
  }
}

/**
 * Sends both approve and supply transactions using delegateWalletClient (EOA)
 * @param transfer - The transfer object
 * @param spender - The address to approve (Aave pool address)
 * @param aavePoolAddress - The Aave pool contract address
 */
export async function sendApproveAndSupplyWithDelegate(
  transfer: ITransfer,
  aavePoolAddress: `0x${string}`
) {
  // Approve transaction
  const approveTxHash = await delegateWalletClient.writeContract({
    address: transfer.tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'approve',
    args: [aavePoolAddress, BigInt(transfer.amount)],
  });
  // Optionally wait for confirmation here if needed
  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

  // Supply transaction
  const roundUpAmount = 100;
  const tokenBalance = 100;
  const asset = transfer.tokenAddress as `0x${string}`;
  const amount = calculateSavingsAmount(BigInt(transfer.amount), BigInt(roundUpAmount), BigInt(tokenBalance));
  const onBehalfOf = transfer.from as `0x${string}`;
  const referralCode = 0;
  
}
