import { GrowthCard } from '@/components/ui/cards/GrowthCard';
import { TotalSavingsCard } from '@/components/ui/cards/TotalSavingsCard';
import { YieldEarnedCard } from '@/components/ui/cards/YieldEarnedCard';
import { useAaveATokenBalance } from '@/hooks/useAaveATokenBalance';

export function SavingsInfoCards({
  loading: savingsLoading,
  totalSavings,
}: {
  loading: boolean;
  totalSavings: number;
}): React.JSX.Element {
  const {
    data: { balance, balanceFormatted },
    isLoading: balanceLoading,
  } = useAaveATokenBalance();

  const isLoading = savingsLoading || balanceLoading;

  let savings = 0;
  let savingsFormatted = '0';

  if (!savingsLoading && totalSavings > 0) {
    savings = totalSavings;
    savingsFormatted = savings.toFixed(2);
  }

  let yieldEarned = 0;
  let yieldEarnedFormatted = '0';

  if (!savingsLoading && !balanceLoading && !!balance) {
    yieldEarned = balanceFormatted - totalSavings;
    yieldEarnedFormatted = yieldEarned.toFixed(2);
  }

  let growthPercent = 0;
  let growthPercentFormatted = '0';

  if (!savingsLoading && !balanceLoading && totalSavings > 0) {
    growthPercent = (yieldEarned / totalSavings) * 100;
    growthPercentFormatted = growthPercent.toFixed(2);
  }

  return (
    <div className='grid grid-cols-1 sm:col-span-3 sm:grid-cols-3 gap-5'>
      {/* Total Savings Card */}
      <TotalSavingsCard loading={isLoading} amount={savingsFormatted} />

      {/* Yield Earned Card */}
      <YieldEarnedCard loading={isLoading} yieldEarned={yieldEarnedFormatted} />

      {/* Growth Card */}
      <GrowthCard loading={isLoading} growthPercent={growthPercentFormatted} />
    </div>
  );
}
