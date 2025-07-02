import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { abi } from '@/abis/AaveUiPoolDataProvider';
import {
  AavePoolAddressesProviderMap,
  AaveUiPoolDataProviderMap,
  TokenAddressMap,
  TokenDecimalMap,
} from '@/lib/constants';
import { useAutoHodl } from '@/providers/autohodl-provider';
import { base } from 'viem/chains';

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

// For demo purposes, uses hardcoded base chain id
export const useCircleAddressAaveATokenBalance = () => {
  const { isConnected, address: userAddress } = useAccount();
  const { circleAddress } = useAutoHodl();

  const {
    data: raw,
    isFetched,
    isFetching,
    isError,
    isLoading,
    isLoadingError,
  } = useReadContract({
    abi,
    address: AaveUiPoolDataProviderMap[base.id],
    functionName: 'getUserReservesData',
    args: [AavePoolAddressesProviderMap[base.id], circleAddress],
    chainId: base.id,
    query: {
      enabled: isConnected && !!circleAddress && !!userAddress,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  let balanceData = { balance: BigInt(0), balanceFormatted: 0 };

  if (raw) {
    const data = raw as IUserReserveData;

    const tokenData = data[0].filter(
      (reserve: TUserReserveDataObject) => reserve.underlyingAsset === TokenAddressMap[base.id],
    );

    const balance = tokenData[0].scaledATokenBalance;

    console.log('\nUser Circle wallet `aToken` Balance on Base in Pool:', balance);

    balanceData = {
      balance,
      balanceFormatted: Number(formatUnits(balance, TokenDecimalMap[TokenAddressMap[base.id]])),
    };
  }

  return { data: balanceData, isFetched, isFetching, isError, isLoading, isLoadingError };
};
