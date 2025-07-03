import { BadgeDollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function MultiChainBalanceCard({ loading, amount }: { loading: boolean; amount: number }) {
  const formattedAmount = amount > 0 ? amount.toFixed(2) : '0';
  return (
    <Card className='flex items-center justify-start rounded-xl border-2 border-[#fce2d8]'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
        {/* Icon */}
        <div className='shrink-0 size-16 sm:size-20 md:size-16 lg:size-20 bg-[#ffc3ab] rounded-[5px] flex items-center justify-center'>
          <BadgeDollarSign className='min-w-12 min-h-12' size={48} color='#ff7a45' />
        </div>
        {/* Text Content */}
        <div>
          <p className='text-black text-base text-left sm:text-center md:text-left'>Multi Chain Balance</p>
          <p className='font-bold text-[#ff7a45] text-2xl mt-1 text-left sm:text-center md:text-left'>
            {loading ? <Loader2 className={'animate-spin size-8'} color={'#ff7a45'} /> : `$${formattedAmount}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
