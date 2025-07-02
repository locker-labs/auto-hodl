import { Shield, MoveUpRight, Loader2 } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import SavingsChart from '@/components/feature/SavingsChart';
import Link from 'next/link';
import { getTransactionLink } from '@/lib/blockExplorer';
import { useTransactions } from '@/hooks/useTransactions';
import { formatUnits } from 'viem';
import moment from 'moment';
import { MM_CARD_ADDRESSES, TOKEN_DECIMALS } from '@/lib/constants';
import { useAutoHodl } from '@/providers/autohodl-provider';
import { VIEM_CHAIN } from '@/config';
import { SavingsInfoCards } from '@/components/feature/SavingsInfoCards';
import { UpdateChainModeModal } from '@/components/feature/UpdateChainModeModal';
import { EChainMode } from '@/enums/chainMode.enums';

export const Portfolio = (): React.JSX.Element => {
  const { txs: transactions, loading } = useTransactions();
  const { triggerAddress, tokenSourceAddress, circleAddress, chainMode } = useAutoHodl();
  let totalSavings = 0;

  for (const tx of transactions) {
    const amount = Number(formatUnits(BigInt(tx.yieldDepositAmount ?? 0), TOKEN_DECIMALS));
    totalSavings += amount;
  }

  const data = {
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
        {/* 1 - 2 - 3 */}
        <SavingsInfoCards loading={loading} totalSavings={totalSavings} />

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
              <p className='font-normal text-black text-base'>Currently earning</p>
              {chainMode === EChainMode.SINGLE_CHAIN ? (
                <Badge className='bg-purple-100 text-[#3c1077] font-normal rounded-xl'>Single-Chain</Badge>
              ) : chainMode === EChainMode.MULTI_CHAIN ? (
                <Badge className='bg-blue-100 text-[#1e40af] font-normal rounded-xl'>Multi-Chain</Badge>
              ) : (
                <Badge className='bg-gray-100 text-[#6b6b6b] font-normal rounded-xl'>Not Set</Badge>
              )}
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

            <UpdateChainModeModal />
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
                              saved ${formatUnits(BigInt(transaction.yieldDepositAmount ?? 0), TOKEN_DECIMALS)}
                            </p>
                            <p className='font-normal text-[#6b6b6b] text-xs text-center'>
                              from ${formatUnits(BigInt(transaction.spendAmount), TOKEN_DECIMALS)}
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

      {/* How to use section */}
      <div className='col-span-12 mt-8'>
        <Card className='w-full rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
          <CardContent className='p-6 md:p-8'>
            <h2 className='font-medium text-black text-2xl mb-6'>How to use Auto-HODL</h2>

            <div className='grid md:grid-cols-3 gap-6'>
              {/* Step 1 */}
              <div className='flex flex-col items-start'>
                <div className='w-8 h-8 bg-[#ff7a45] rounded-full flex items-center justify-center text-white font-bold text-sm mb-3'>
                  1
                </div>
                <h3 className='font-semibold text-lg mb-2'>Send USDC</h3>
                <p className='text-gray-600 text-sm mb-3'>
                  Send USDC from{' '}
                  {triggerAddress ? (
                    <span className='font-mono text-xs bg-gray-100 px-1 rounded'>{triggerAddress}</span>
                  ) : (
                    'your trigger address'
                  )}{' '}
                  to any simulated MetaMask Card address on {VIEM_CHAIN.name}:
                </p>
                <p className='text-gray-600 text-sm mb-3'>
                  <strong>Token Source Address:</strong>{' '}
                  {tokenSourceAddress ? (
                    <span className='font-mono text-xs bg-blue-100 px-1 rounded'>{tokenSourceAddress}</span>
                  ) : (
                    'Loading...'
                  )}{' '}
                  (must contain USDC)
                </p>

                <div className='bg-gray-50 rounded-lg p-3 w-full'>
                  <p className='text-xs font-mono text-gray-700 mb-1'>US Card:</p>
                  <p className='text-xs font-mono break-all'>{MM_CARD_ADDRESSES[0]}</p>
                  <p className='text-xs font-mono text-gray-700 mb-1 mt-2'>International Card:</p>
                  <p className='text-xs font-mono break-all'>{MM_CARD_ADDRESSES[1]}</p>
                  <p className='text-xs font-mono text-gray-700 mb-1 mt-2'>Test Card:</p>
                  <p className='text-xs font-mono break-all'>{MM_CARD_ADDRESSES[2]}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className='flex flex-col items-start'>
                <div className='w-8 h-8 bg-[#187710] rounded-full flex items-center justify-center text-white font-bold text-sm mb-3'>
                  2
                </div>
                <h3 className='font-semibold text-lg mb-2'>Auto Round-up</h3>
                <p className='text-gray-600 text-sm mb-3'>
                  Our system automatically detects your transaction and calculates the round-up amount to the nearest
                  dollar.
                </p>
                <div className='bg-green-50 rounded-lg p-3 w-full'>
                  <p className='text-sm text-green-800'>
                    <strong>Example:</strong> Send $12.30 → Round up to $13.00
                  </p>
                  <p className='text-sm text-green-700 mt-1'>Savings amount: $0.70</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className='flex flex-col items-start'>
                <div className='w-8 h-8 bg-[#3c1077] rounded-full flex items-center justify-center text-white font-bold text-sm mb-3'>
                  3
                </div>
                <h3 className='font-semibold text-lg mb-2'>Yield Strategy</h3>
                <p className='text-gray-600 text-sm mb-3'>
                  Using your delegation, we automatically process the round-up amount based on your chain mode:
                </p>
                
                {chainMode === EChainMode.SINGLE_CHAIN ? (
                  <div className='bg-purple-50 rounded-lg p-3 w-full mb-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Shield size={16} className='text-purple-600' />
                      <p className='text-sm font-semibold text-purple-800'>Single-Chain Mode</p>
                    </div>
                    <p className='text-sm text-purple-700'>
                      Funds are directly deposited into Aave on {VIEM_CHAIN.name} to earn yield immediately.
                    </p>
                  </div>
                ) : chainMode === EChainMode.MULTI_CHAIN ? (
                  <div className='bg-blue-50 rounded-lg p-3 w-full mb-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Shield size={16} className='text-blue-600' />
                      <p className='text-sm font-semibold text-blue-800'>Multi-Chain Mode</p>
                    </div>
                    <p className='text-sm text-blue-700 mb-2'>
                      Funds are bridged using LiFi/CCTP v2 and sent to your Circle address on Base for optimal yield.
                    </p>
                    {circleAddress && (
                      <p className='text-xs font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded break-all'>
                        Circle Address on Base: {circleAddress}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className='bg-gray-50 rounded-lg p-3 w-full mb-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Shield size={16} className='text-gray-600' />
                      <p className='text-sm font-semibold text-gray-800'>Chain Mode Not Set</p>
                    </div>
                    <p className='text-sm text-gray-700'>
                      Configure your chain mode to see how funds will be processed.
                    </p>
                  </div>
                )}

                <div className='bg-purple-50 rounded-lg p-3 w-full'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Shield size={16} className='text-purple-600' />
                    <p className='text-sm font-semibold text-purple-800'>Secure & Automated</p>
                  </div>
                  <p className='text-sm text-purple-700'>
                    Your delegation enables secure, automatic processing without manual intervention.
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-start gap-3'>
                <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <span className='text-white text-xs font-bold'>!</span>
                </div>
                <div>
                  <p className='text-blue-800 font-semibold text-sm mb-1'>Note:</p>
                  <p className='text-blue-700 text-sm'>
                    Only USDC transactions to MetaMask Card addresses will trigger automatic round-up savings. Your
                    token source address must contain sufficient USDC for the round-up amounts. Your delegation ensures
                    all operations are secure and under your control.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
