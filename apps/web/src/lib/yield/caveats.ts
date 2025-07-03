import { BalanceChangeType, createCaveatBuilder, type MetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { AAVE_POOL_ADDRESS, USDC_ADDRESS } from '../constants';

export const getAaveCaveats = (delegator: MetaMaskSmartAccount, savingsAmount: bigint) => {
  const caveatBuilder = createCaveatBuilder(delegator.environment);

  const caveats = caveatBuilder
    // Hardcoded to sepolia
    // .addCaveat('allowedTargets', [AAVE_POOL_ADDRESS, USDC_ADDRESS as `0x${string}`])
    // .addCaveat('allowedMethods', [
    //   {
    //     type: 'function',
    //     name: 'supply',
    //     inputs: [
    //       { name: 'asset', type: 'address', internalType: 'address' },
    //       { name: 'amount', type: 'uint256', internalType: 'uint256' },
    //       { name: 'onBehalfOf', type: 'address', internalType: 'address' },
    //       { name: 'referralCode', type: 'uint16', internalType: 'uint16' },
    //     ],
    //     outputs: [],
    //     stateMutability: 'nonpayable',
    //   },
    //   {
    //     type: 'function',
    //     name: 'approve',
    //     inputs: [
    //       { name: 'spender', type: 'address', internalType: 'address' },
    //       { name: 'amount', type: 'uint256', internalType: 'uint256' },
    //     ],
    //     outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    //     stateMutability: 'nonpayable',
    //   },
    // ])
    .addCaveat(
      'erc20BalanceChange',
      USDC_ADDRESS as `0x${string}`,
      delegator.address,
      savingsAmount,
      BalanceChangeType.Decrease,
    );
  return caveats;
};
