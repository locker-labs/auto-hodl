import { SingleChainBalanceCard } from '@/components/ui/cards/SingleChainBalanceCard';
import { MultiChainBalanceCard } from '@/components/ui/cards/MultiChainBalanceCard';
import { useAaveYieldBalance } from '@/hooks/useAaveYieldBalance';
import { useCircleTokenBalance } from '@/hooks/useCircleTokenBalance';

export function SavingsInfoCards({
  loading: savingsLoading,
  totalSavings,
}: {
  loading: boolean;
  totalSavings: number;
}): React.JSX.Element {
  // Circle address balance on Base Mainnet
  const { isFetched: circleUsdcBalanceFetched, balanceNumber: circleUsdcBalance } = useCircleTokenBalance();

  // Token source balance from Aave Yield on source chain (connected wallet)
  const {
    balanceFormatted: tokenSourceBalance,
    isFetched: tokenSourceBalanceFetched,
  } = useAaveYieldBalance();

  return (
    <div className='grid grid-cols-1 sm:col-span-2 sm:grid-cols-2 gap-5'>
      <SingleChainBalanceCard loading={!tokenSourceBalanceFetched} amount={tokenSourceBalance} />
      <MultiChainBalanceCard loading={!circleUsdcBalanceFetched} amount={circleUsdcBalance} />
    </div>
  );
}
