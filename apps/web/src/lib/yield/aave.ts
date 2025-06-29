import { aavePoolAbi } from './aavePoolAbi';
import { encodeFunctionData } from 'viem';

/**
 * Encodes call data for supplying assets to Aave pool
 * @param asset - The address of the asset to supply
 * @param amount - The amount to supply (in wei)
 * @param onBehalfOf - The address to supply on behalf of (use zero address for self)
 * @param referralCode - Referral code (use 0 for no referral)
 * @returns Encoded function data for the supply call
 */
export function encodeSupplyCallData(
  asset: `0x${string}`,
  amount: bigint,
  onBehalfOf: `0x${string}`,
  referralCode: number = 0,
): `0x${string}` {
  return encodeFunctionData({
    abi: aavePoolAbi,
    functionName: 'supply',
    args: [asset, amount, onBehalfOf, referralCode],
  });
}

/**
 * Encodes call data for withdrawing assets from Aave pool
 * @param asset - The address of the asset to withdraw
 * @param amount - The amount to withdraw (in wei, use type(uint256).max for max amount)
 * @param to - The address to receive the withdrawn assets
 * @returns Encoded function data for the withdraw call
 */
export function encodeWithdrawCallData(asset: `0x${string}`, amount: bigint, to: `0x${string}`): `0x${string}` {
  return encodeFunctionData({
    abi: aavePoolAbi,
    functionName: 'withdraw',
    args: [asset, amount, to],
  });
}

/**
 * Encodes call data for supplying assets with permit (for gasless approvals)
 * @param asset - The address of the asset to supply
 * @param amount - The amount to supply (in wei)
 * @param onBehalfOf - The address to supply on behalf of (use zero address for self)
 * @param referralCode - Referral code (use 0 for no referral)
 * @param deadline - Deadline for the permit
 * @param permitV - V component of the permit signature
 * @param permitR - R component of the permit signature
 * @param permitS - S component of the permit signature
 * @returns Encoded function data for the supplyWithPermit call
 */
export function encodeSupplyWithPermitCallData(
  asset: `0x${string}`,
  amount: bigint,
  onBehalfOf: `0x${string}`,
  referralCode: number,
  deadline: bigint,
  permitV: number,
  permitR: `0x${string}`,
  permitS: `0x${string}`,
): `0x${string}` {
  return encodeFunctionData({
    abi: aavePoolAbi,
    functionName: 'supplyWithPermit',
    args: [asset, amount, onBehalfOf, referralCode, deadline, permitV, permitR, permitS],
  });
}

// Minimal ERC20 ABI for approve
export const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

/**
 * Encodes call data for ERC20 approve
 * @param token - The address of the ERC20 token
 * @param spender - The address to approve
 * @param amount - The amount to approve (in wei)
 * @returns Encoded function data for the approve call
 */
export function encodeApproveTokensCallData(spender: `0x${string}`, amount: bigint): `0x${string}` {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
  });
}
