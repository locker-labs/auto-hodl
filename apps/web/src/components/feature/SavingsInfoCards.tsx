import { EarnedYield } from '@/components/ui/cards/GrowthCard';
import { MultiChainBalanceCard } from '../ui/cards/MultiChainBalanceCard';
import { AmountDepositedCard } from '@/components/ui/cards/YieldEarnedCard';
import { useAaveATokenBalance } from '@/hooks/useAaveATokenBalance';
import { useAutoHodl } from '@/providers/autohodl-provider';
import { useReadContract } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { useCircleAddressAaveATokenBalance } from '@/hooks/useCircleAddressAaveATokenBalance';
import { base } from 'viem/chains';
import { TokenAddressMap, TokenDecimalMap } from '@/lib/constants';

export function SavingsInfoCards({
  loading: savingsLoading,
  totalSavings,
}: {
  loading: boolean;
  totalSavings: number;
}): React.JSX.Element {
  const { circleAddress } = useAutoHodl();

  console.log('circleAddress', circleAddress);

  // circle address balance on Base Mainnet
  const { data } = useReadContract({
    chainId: base.id,
    abi: erc20Abi,
    address: TokenAddressMap[base.id],
    functionName: 'balanceOf',
    args: [circleAddress as `0x${string}`],
    query: {
      enabled: !!circleAddress,
    },
  });

  const circleAddressUSDCBalance = data ? formatUnits(data, TokenDecimalMap[TokenAddressMap[base.id]]) : '0';

  const {
    data: { balanceFormatted: tokenSourceBalance },
    isLoading: tokenSourceBalanceLoading,
  } = useAaveATokenBalance();

  const {
    data: { balanceFormatted: circleBalance },
    isLoading: circleBalanceLoading,
  } = useCircleAddressAaveATokenBalance();

  const isLoading = savingsLoading || tokenSourceBalanceLoading || circleBalanceLoading;

  let totalBalance = 0;
  let totalBalanceFormatted = '0';
  let earnedYield = 0;
  let earnedYieldFormatted = '0';

  if (!isLoading) {
    if (tokenSourceBalance) {
      totalBalance += tokenSourceBalance;
      totalBalanceFormatted = totalBalance.toFixed(2);
    }
    if (circleBalance) {
      totalBalance += circleBalance;
      totalBalanceFormatted = totalBalance.toFixed(2);
    }
    earnedYield = totalBalance - totalSavings;
    if (earnedYield > 0) {
      earnedYieldFormatted = earnedYield.toFixed(2);
    }
  }

  return (
    <div className='grid grid-cols-1 sm:col-span-3 sm:grid-cols-3 gap-5'>
      {/* MultiChain Balance Card */}
      <MultiChainBalanceCard loading={isLoading} amount={circleAddressUSDCBalance} />

      {/* Amount Deposited Card */}
      <AmountDepositedCard loading={isLoading} amountDeposited={totalBalanceFormatted} />

      {/* Earned Yield Card */}
      <EarnedYield loading={isLoading} earnedYield={earnedYieldFormatted} />
    </div>
  );
}
