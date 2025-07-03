import { useAutoHodl } from '@/providers/autohodl-provider';
import { useReadContract } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { base as chain } from 'viem/chains';
import { TokenAddressMap, TokenDecimalMap } from '@/lib/constants';

const chainId = chain.id;
const decimals = TokenDecimalMap[TokenAddressMap[chainId]];

export function useCircleTokenBalance() {
  const { circleAddress } = useAutoHodl();

  const { data, isFetched, isFetching } = useReadContract({
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

  console.log('useCircleTokenBalance', { isFetched, isFetching, data });

  const balanceNumber = data ? Number(formatUnits(data, decimals)) : 0;
  const balanceString = String(balanceNumber.toFixed(2));

  return {
    balance: data,
    isFetched,
    isFetching,
    balanceNumber,
    balanceString,
  };
}
