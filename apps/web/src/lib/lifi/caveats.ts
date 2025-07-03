import { BalanceChangeType, createCaveatBuilder, type MetaMaskSmartAccount } from '@metamask/delegation-toolkit';
import { USDC_ADDRESS, LIFI_DIAMOND_ADDRESS } from '../constants';

export const getLifiCaveats = (delegator: MetaMaskSmartAccount, savingsAmount: bigint) => {
  const caveatBuilder = createCaveatBuilder(delegator.environment);

  const caveats = caveatBuilder
    // Hardcoded to sepolia
      .addCaveat('allowedTargets', [LIFI_DIAMOND_ADDRESS, USDC_ADDRESS as `0x${string}`])
    //   .addCaveat('allowedMethods', ["startBridgeTokensViaRelay(tuple,tuple)","approve(address,uint256)"])
    .addCaveat(
      'erc20BalanceChange',
      USDC_ADDRESS as `0x${string}`,
      delegator.address,
      savingsAmount,
      BalanceChangeType.Decrease,
    );
  return caveats;
};
