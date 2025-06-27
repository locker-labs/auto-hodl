import { BanknoteArrowUp, Cog, DollarSign, Shield, TrendingUp, MoveUpRight } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SavingsChart from '@/components/feature/SavingsChart';
import Link from 'next/link';
import { getTransactionLink } from '@/lib/blockExplorer';

export const Portfolio = (): React.JSX.Element => {
  const data = {
    totalYield: '76',
    totalSavings: '555',
    growth: '+13.69',
    apy: '4.8',
  };

  // Transaction data for mapping
  const transactions = [
    {
      txHash: '0xf3871fab28ffe6a801a1dd0846c6116010b5e1d3cbbb96511c17ddbe195fa890',
      store: 'Hazelnut Coffee',
      date: 'Jan 13, 06:05 PM',
      amount: '$0.25',
      from: '$4.75',
    },
    {
      txHash: '0x1ae369a9a3301bf885113b5afe3d2254a08f798f88ac71b68de9fd5cb1a9d2d0',
      store: 'Grocery Store',
      date: 'Jan 13, 06:05 PM',
      amount: '$0.77',
      from: '$61.23',
    },
    {
      txHash: '0xf1c33316f48acf71bebb5888997ff5eff23221a69395964ec8e657f171a77853',
      store: 'BBQ',
      date: 'Jan 13, 06:05 PM',
      amount: '$0.25',
      from: '$4.75',
    },
    {
      txHash: '0x0b159608052a47b825b97396cf91a6643ee6354c2d256384715c9d3aab61448a',
      store: 'Grocery Store',
      date: 'Jan 13, 06:05 PM',
      amount: '$0.25',
      from: '$4.75',
    },
  ];

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
        <Card className='rounded-xl border-2 border-[#fce2d8]'>
          <CardContent className='flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
            {/* Icon */}
            <div className='shrink-0 size-16 sm:size-20 md:size-16 lg:size-20 bg-[#ffc3ab] rounded-[5px] flex items-center justify-center'>
              <DollarSign className='min-w-12 min-h-12' size={48} color='#ff7a45' />
            </div>

            <div>
              <p className='text-black text-base text-left sm:text-center md:text-left'>Total Savings</p>
              <p className='font-bold text-[#ff7a45] text-2xl mt-1 text-left sm:text-center md:text-left'>
                ${data.totalSavings}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2 - Yield Earned Card */}
        <Card className='rounded-xl border-2 border-[#c2ffae]'>
          <CardContent className='flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
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
        <Card className='rounded-xl border-2 border-[#f699ff]/40'>
          <CardContent className='flex flex-row sm:flex-col items-center md:flex-row gap-8 sm:gap-5'>
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
        <Card className='m-0 p-0 sm:col-span-3 w-full max-h-[549px] rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
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

            <div className='mt-[15px] overflow-y-auto max-h-[274px]'>
              {transactions.map((transaction) => (
                <Link
                  key={transaction.txHash}
                  href={getTransactionLink(transaction.txHash)}
                  target='_blank'
                  className='no-underline'
                >
                  <div className='flex flex-col gap-5 mb-3 bg-[#f8f8f8] rounded-[5px] cursor-pointer hover:bg-[#f0f0f0] transition-colors duration-200'>
                    <div className='flex items-center justify-between px-3 py-3.5'>
                      <div className='flex items-center gap-[9px]'>
                        <div className='w-[23px] h-[23px] bg-[#d2e2fd] rounded-[11.5px] flex items-center justify-center'>
                          <MoveUpRight className='min-w-3 min-h-3' size={12} color='#1e40af' />
                        </div>
                        <div>
                          <p className='font-normal text-black text-base text-left'>{transaction.store}</p>
                          <p className='font-normal text-[#6b6b6b] text-xs text-left'>{transaction.date}</p>
                        </div>
                      </div>

                      <div className='text-right'>
                        <p className='font-normal text-black text-base text-center'>{transaction.amount}</p>
                        <p className='font-normal text-[#6b6b6b] text-xs text-center'>from {transaction.from}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
