import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { VIEM_CHAIN } from '@/config';
const targetChainId: number = VIEM_CHAIN.id;

export function useCheckChain() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [shouldSwitchChain, setShouldSwitchChain] = useState(false);
  console.log(`⛓️ Connected chain id: ${chainId} Should switch chain: ${shouldSwitchChain}`);

  useEffect(() => {
    if (isConnected && chainId !== targetChainId) {
      setShouldSwitchChain(true);
    } else {
      setShouldSwitchChain(false);
    }
  }, [isConnected, chainId]);

  const switchToTargetChain = () => {
    if (shouldSwitchChain) {
      switchChain({ chainId: targetChainId });
    }
  };

  return {
    chainId,
    isConnected,
    shouldSwitchChain,
    switchToTargetChain,
    targetChainId,
  };
}
