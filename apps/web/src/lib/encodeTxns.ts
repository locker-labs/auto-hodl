import { VaultAbi } from "./vaultAbi";
import Web3 from "web3";

/**
 * Encodes call data for the vault's deposit function using web3.
 * @param amount The amount to deposit (as a string or number).
 * @param receiver The address to receive the deposit.
 * @returns The ABI-encoded call data for the deposit function.
 */
export function encodeVaultDepositCallData(amount: string, receiver: string): string {
  const web3 = new Web3();
  // Find the deposit function ABI
  const depositAbi = VaultAbi.find(
    (item) => item.type === "function" && item.name === "deposit"
  );
  if (!depositAbi) {
    throw new Error("Deposit function ABI not found");
  }
  return web3.eth.abi.encodeFunctionCall(depositAbi as any, [amount, receiver]);
}

/**
 * Encodes call data for the vault's withdraw function using web3.
 * @param assets The amount of assets to withdraw (as a string or number).
 * @param receiver The address to receive the withdrawn assets.
 * @param owner The address of the owner of the assets.
 * @returns The ABI-encoded call data for the withdraw function.
 */
export function encodeVaultWithdrawCallData(assets: string, receiver: string, owner: string): string {
  const web3 = new Web3();
  // Find the withdraw function ABI
  const withdrawAbi = VaultAbi.find(
    (item) => item.type === "function" && item.name === "withdraw"
  );
  if (!withdrawAbi) {
    throw new Error("Withdraw function ABI not found");
  }
  return web3.eth.abi.encodeFunctionCall(withdrawAbi as any, [assets, receiver, owner]);
}
