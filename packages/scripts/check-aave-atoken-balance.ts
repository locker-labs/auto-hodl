import { createPublicClient, http } from 'viem';
import { sepolia as chain } from 'viem/chains';
import { abi } from './abis/aaveUiPoolDataProvider';

// TODO: Created this type manually from received response. Should use type provided by Aave
//   - https://github.com/aave/aave-utilities/blob/5759e66c911ceda8b474a1b1b7cb54ca050b4efb/packages/contract-helpers/src/v3-UiPoolDataProvider-contract/types.ts#L83
// type TUserReserveData = {
//   underlyingAsset: `0x${string}`; // Ethereum address
//   scaledATokenBalance: bigint;
//   usageAsCollateralEnabledOnUser: boolean;
//   stableBorrowRate: bigint;
//   scaledVariableDebt: bigint;
//   principalStableDebt: bigint;
//   stableBorrowLastUpdateTimestamp: bigint;
// };

// Aave address book
// https://aave.com/docs/resources/addresses

// https://aave.com/docs/developers/smart-contracts/pool-addresses-provider
// https://sepolia.etherscan.io/address/0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A
const aavePoolAddressProvider = '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A';

// https://aave.com/docs/developers/smart-contracts/view-contracts#uipooldataprovider
// https://sepolia.etherscan.io/address/0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A
const aaveUiPoolDataProvider = '0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE';

// https://sepolia.etherscan.io/address/0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a
const aaveTokenSepolia = '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a';

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

const userAddress = '0x16B2b8BF41E70D3988eE15aCf78285fd16f35C6e';

console.log('📋 Account Details:');
console.log(`   Chain: ${chain.name}`);
console.log(`   User Address: ${userAddress}`);
console.log(`   AAVE Token: ${aaveTokenSepolia}`);

async function getATokenBalances(): Promise<bigint> {
  const data = await publicClient.readContract({
    address: aaveUiPoolDataProvider,
    abi: abi,
    functionName: 'getUserReservesData',
    args: [aavePoolAddressProvider, userAddress],
  });

  // console.log(data[0]);

  const tokenData = data[0].filter((reserve: any) => reserve.underlyingAsset === aaveTokenSepolia);

  const balance = tokenData[0].scaledATokenBalance;

  console.log('\nUser `aToken` Balance in Pool:', balance);

  return balance;

  // // Each item in reservesData has an .underlyingAsset and .scaledATokenBalance
  // const formatted = reservesData
  //   .filter((reserve: any) => reserve.scaledATokenBalance > 0n)
  //   .map((reserve: any) => ({
  //     asset: reserve.underlyingAsset,
  //     aTokenBalance: reserve.scaledATokenBalance,
  //   }));
  //
  // console.log(formatted);
}

async function getReservesList() {
  const data = await publicClient.readContract({
    address: aaveUiPoolDataProvider,
    abi: abi,
    functionName: 'getReservesList',
    args: [aavePoolAddressProvider],
  });

  console.log(data);

  return data;
}

getATokenBalances().catch(console.error);
