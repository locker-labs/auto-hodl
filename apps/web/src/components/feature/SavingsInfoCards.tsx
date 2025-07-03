import { EarnedYield } from '@/components/ui/cards/GrowthCard';
import { MultiChainBalanceCard } from '../ui/cards/MultiChainBalanceCard';
import { AmountDepositedCard } from '@/components/ui/cards/YieldEarnedCard';
import { useAaveATokenBalance } from '@/hooks/useAaveATokenBalance';
import { useAutoHodl } from '@/providers/autohodl-provider';
import { useReadContract } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { useCircleAddressAaveATokenBalance } from '@/hooks/useCircleAddressAaveATokenBalance';
import { base as chain } from 'viem/chains';
import { TokenAddressMap, TokenDecimalMap } from '@/lib/constants';

const chainId = chain.id;

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
  const {
    data,
    isFetched: usdcBalanceFetched,
    isFetching: usdcBalanceFetching,
  } = useReadContract({
    chainId,
    abi: erc20Abi,
    address: TokenAddressMap[chainId],
    functionName: 'balanceOf',
    args: [circleAddress as `0x${string}`],
    query: {
      enabled: !!circleAddress,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const circleAddressUSDCBalance = data ? formatUnits(data, TokenDecimalMap[TokenAddressMap[chainId]]) : '0';

  console.log('useCircleUsdcBalance', {
    isFetched: usdcBalanceFetched,
    isFetching: usdcBalanceFetching,
    data,
    'TokenAddressMap[chainId]': TokenAddressMap[chainId],
    'TokenDecimalMap[TokenAddressMap[chainId]]': TokenDecimalMap[TokenAddressMap[chainId]],
  });

  const {
    data: { balanceFormatted: tokenSourceBalance },
    isLoading: tokenSourceBalanceLoading,
    isFetched: tokenSourceBalanceFetched,
  } = useAaveATokenBalance();

  const {
    data: { balanceFormatted: circleBalance },
    isLoading: circleBalanceLoading,
    isFetched: circleBalanceFetched,
  } = useCircleAddressAaveATokenBalance();

  const isLoading = savingsLoading || tokenSourceBalanceLoading || circleBalanceLoading;

  const isFetched = usdcBalanceFetched && tokenSourceBalanceFetched && circleBalanceFetched;

  console.log({
    savingsLoading,
    tokenSourceBalanceLoading,
    circleBalanceLoading,
  });

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
      <MultiChainBalanceCard loading={!isFetched} amount={circleAddressUSDCBalance} />

      {/* Amount Deposited Card */}
      <AmountDepositedCard loading={!isFetched} amountDeposited={totalBalanceFormatted} />

      {/* Earned Yield Card */}
      <EarnedYield loading={!isFetched} earnedYield={earnedYieldFormatted} />
    </div>
  );
}
