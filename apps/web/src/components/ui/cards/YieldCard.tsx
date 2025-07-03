import { Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function YieldCard({ loading, amount }: { loading: boolean; amount: number }): React.JSX.Element {
  const formattedAmount = amount > 0 ? amount.toFixed(2) : '0';
  return (
    <Card className='flex items-center justify-start rounded-xl border-2 border-[#f699ff]/40'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
        {/* Icon */}
        <div className='shrink-0 size-16 sm:size-20 md:size-16 lg:size-20 bg-[#fdf2fe] rounded-[5px] flex items-center justify-center'>
          <TrendingUp className='min-w-12 min-h-12' size={48} color='#3c1077' />
        </div>
        {/* Text Content */}
        <div>
          <p className='text-black text-base text-left sm:text-center md:text-left'>Earned Yield</p>
          <p className='font-bold text-[#3c1077] text-2xl mt-1 text-left sm:text-center md:text-left'>
            {loading ? <Loader2 className={'animate-spin size-8'} color={'#3c1077'} /> : `$${formattedAmount}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
