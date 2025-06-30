import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { abi } from '@/abis/AaveUiPoolDataProvider';
import {
  AAVE_POOL_ADDRESSES_PROVIDER,
  AAVE_UI_POOL_DATA_PROVIDER,
  TOKEN_ADDRESS,
  TOKEN_DECIMALS,
} from '@/lib/constants';
import { useAutoHodl } from '@/providers/autohodl-provider';

type TUserReserveDataObject = {
  underlyingAsset: string;
  scaledATokenBalance: bigint;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: bigint;
};

export interface IUserReserveData {
  0: Array<TUserReserveDataObject>;
  1: number;
}

export const useAaveATokenBalance = () => {
  const { isConnected, address: userAddress, chainId } = useAccount();
  const { tokenSourceAddress } = useAutoHodl();

  const {
    data: raw,
    isFetched,
    isFetching,
    isError,
    isLoading,
    isLoadingError,
  } = useReadContract({
    abi,
    address: AAVE_UI_POOL_DATA_PROVIDER,
    functionName: 'getUserReservesData',
    args: [AAVE_POOL_ADDRESSES_PROVIDER, tokenSourceAddress],
    chainId,
    query: {
      enabled: isConnected && !!tokenSourceAddress && !!userAddress,
      refetchOnWindowFocus: false, // Disable refetching on window focus
      refetchOnReconnect: true, // Enable refetching on reconnect
      refetchInterval: false, // Disable refetching at intervals
      staleTime: 0, // Disable stale data
    },
  });

  let balanceData = { balance: BigInt(0), balanceFormatted: 0 };

  if (raw) {
    const data = raw as IUserReserveData;

    const tokenData = data[0].filter((reserve: TUserReserveDataObject) => reserve.underlyingAsset === TOKEN_ADDRESS);

    const balance = tokenData[0].scaledATokenBalance;

    console.log('\nUser `aToken` Balance in Pool:', balance);

    balanceData = { balance, balanceFormatted: Number(formatUnits(balance, TOKEN_DECIMALS)) };
  }

  return { data: balanceData, isFetched, isFetching, isError, isLoading, isLoadingError };
};
