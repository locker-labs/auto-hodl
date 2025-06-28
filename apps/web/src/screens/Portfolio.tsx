import { BanknoteArrowUp, Cog, DollarSign, Shield, TrendingUp, MoveUpRight, Loader2 } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SavingsChart from '@/components/feature/SavingsChart';
import Link from 'next/link';
import { getTransactionLink } from '@/lib/blockExplorer';
import { useTransactions } from '@/hooks/useTransactions';
import { formatUnits } from 'viem';
import moment from 'moment';

export const Portfolio = (): React.JSX.Element => {
  const { txs: transactions, loading } = useTransactions();

  let totalSavings = 0;

  for (const tx of transactions) {
    const amount = Number(formatUnits(BigInt(tx.yieldDepositAmount ?? 0), 18));
    totalSavings += amount;
  }

  const data = {
    totalYield: '76',
    totalSavings,
    growth: '+13.69',
    apy: '4.8',
  };

  const chartData = [
    { month: 'Jan', value: 245.5 },
    { month: 'Feb', value: 567.2 },
    { month: 'Mar', value: 892.4 },
    { month: 'Apr', value: 1234.15 },
    { month: 'May', value: 1689.3 },
    { month: 'Jun', value: 2034.85 },
    { month: 'Jul', value: 2456.9 },
    { month: 'Aug', value: 2847.32 },
    { month: 'Sep', value: 3124.18 },
  ];

  return (
    <div className='w-full px-2 sm:px-5 py-5 grid grid-cols-12 gap-5'>
      {/* Left side */}
      <div className='col-span-12 lg:col-span-9 grid sm:grid-cols-3 gap-5'>
        {/* 1 - Total Savings Card */}
        <Card className='flex items-center justify-start rounded-xl border-2 border-[#fce2d8]'>
          <CardContent className='h-full w-full flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
            {/* Icon */}
            <div className='shrink-0 size-16 sm:size-20 md:size-16 lg:size-20 bg-[#ffc3ab] rounded-[5px] flex items-center justify-center'>
              <DollarSign className='min-w-12 min-h-12' size={48} color='#ff7a45' />
            </div>

            <div>
              <p className='text-black text-base text-left sm:text-center md:text-left'>Total Savings</p>
              <p className='font-bold text-[#ff7a45] text-2xl mt-1 text-left sm:text-center md:text-left'>
                {loading ? <Loader2 className={'animate-spin size-8'} color={'#ff7a45'} /> : `${data.totalSavings}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2 - Yield Earned Card */}
        <Card className='flex items-center justify-start rounded-xl border-2 border-[#c2ffae]'>
          <CardContent className='h-full w-full flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
            {/* Icon */}
            <div className='shrink-0 size-16 sm:size-20 md:size-16 lg:size-20 bg-[#f5fef2] rounded-[5px] flex items-center justify-center'>
              <BanknoteArrowUp className='min-w-12 min-h-12' size={48} color='#187710' />
            </div>

            <div>
              <p className='text-black text-base text-left sm:text-center md:text-left'>Yield Earned</p>
              <p className='font-bold text-[#187710] text-2xl mt-1 text-left sm:text-center md:text-left'>
                ${data.totalYield}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3 - Growth Card */}
        <Card className='flex items-center justify-start rounded-xl border-2 border-[#f699ff]/40'>
          <CardContent className='h-full w-full flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
            {/* Icon */}
            <div className='shrink-0 size-16 sm:size-20 md:size-16 lg:size-20 bg-[#fdf2fe] rounded-[5px] flex items-center justify-center'>
              <TrendingUp className='min-w-12 min-h-12' size={48} color='#3c1077' />
            </div>

            <div>
              <p className='text-black text-base text-left sm:text-center md:text-left'>Growth</p>
              <p className='font-bold text-[#3c1077] text-2xl mt-1 text-left sm:text-center md:text-left'>
                {data.growth}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 5 - Savings Growth Chart */}
        <Card className='m-0 p-0 sm:col-span-3 w-full h-full rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
          <CardContent className='p-6 md:p-10'>
            <h2 className='font-medium text-black text-2xl'>Savings Growth</h2>
            <div className='mt-5 h-100'>
              <SavingsChart chartData={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right */}
      <div className='col-span-12 lg:col-span-3 w-full flex flex-col md:flex-row lg:flex-col gap-5'>
        {/* 4 - Current Strategy Card */}
        <Card className='w-full h-fit rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
          <CardContent className='px-5'>
            <div className='w-full flex justify-between items-start gap-5'>
              <p className='font-normal text-black text-base'>Current Strategy</p>
              <Badge className='bg-emerald-100 text-[#187710] font-normal rounded-xl'>Low Risk</Badge>
            </div>

            <div className='mt-5 flex justify-start items-center gap-5'>
              <div className='w-20 h-20 bg-[#f8fad1] rounded-[5px] flex items-center justify-center'>
                <Shield className='min-w-12 min-h-12' size={48} color='#818526' />
              </div>
              <div>
                <p className='text-xl font-bold text-[#187710]'>~{data.apy}% APY</p>
                <p className='font-medium text-black text-sm'>USDC on Aave</p>
              </div>
            </div>

            <Button className='mt-5 group w-full h-12 bg-[#ffc8b2] hover:bg-[#cc927f] rounded-xl hover:shadow-[0px_2px_1.1px_#00000040] text-black font-medium cursor-not-allowed'>
              {/* Icon */}
              <Cog
                className='group-hover:rotate-45 transition-transform duration-300 min-w-5 min-h-5'
                size={20}
                color='black'
              />
              change settings
            </Button>
          </CardContent>
        </Card>

        {/* 6 - Recent Transactions Card */}
        <Card className='w-full m-0 p-5 h-full rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
          <CardContent className='m-0 p-0'>
            <div>
              <h2 className='mt-2 font-medium text-black text-2xl'>
                Recent
                <br />
                Transactions
              </h2>
              <p className='font-normal text-[#6b6b6b] text-base'>Your latest round-up savings</p>
            </div>

            {loading ? (
              <div className={'w-full h-full flex justify-center items-center'}>
                <Loader2 className={'animate-spin size-8'} color={'#ff7a45'} />
              </div>
            ) : transactions.length === 0 ? (
              <div className='mt-[15px] overflow-y-auto max-h-[274px] py-12 flex items-center justify-center w-full h-full '>
                <p>No recent transactions</p>
              </div>
            ) : (
              <div className='mt-[15px] overflow-y-auto max-h-[274px]'>
                {transactions.map((transaction) => {
                  const hash = transaction.spendTxHash ?? transaction.yieldDepositTxHash;

                  return (
                    <Link key={transaction.id} href={getTransactionLink(hash)} target='_blank' className='no-underline'>
                      <div className='flex flex-col gap-5 mb-3 bg-[#f8f8f8] rounded-[5px] cursor-pointer hover:bg-[#f0f0f0] transition-colors duration-200'>
                        <div className='flex items-center justify-between px-3 py-3.5'>
                          <div className='flex items-center gap-[9px]'>
                            <div className='w-[23px] h-[23px] bg-[#d2e2fd] rounded-[11.5px] flex items-center justify-center'>
                              <MoveUpRight className='min-w-3 min-h-3' size={12} color='#1e40af' />
                            </div>
                            <div>
                              <p className='font-normal text-black text-base text-left'>
                                {`${hash.slice(0, 6)}...${hash.slice(-4)}`}
                              </p>
                              <p className='font-normal text-[#6b6b6b] text-xs text-left'>
                                {moment(transaction.spendAt).format('MMM D, hh:mm A')}
                              </p>
                            </div>
                          </div>

                          <div className='text-right'>
                            <p className='font-normal text-black text-base text-center'>
                              {formatUnits(BigInt(transaction.yieldDepositAmount ?? 0), 18)}
                            </p>
                            <p className='font-normal text-[#6b6b6b] text-xs text-center'>
                              from ${formatUnits(BigInt(transaction.spendAmount), 18)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
