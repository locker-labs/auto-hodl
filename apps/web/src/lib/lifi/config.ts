import { createConfig, EVM } from "@lifi/sdk";
import { RPC_URL, VIEM_CHAIN } from "@/config";
import {
  delegateWalletClient,
  delegateEoa,
} from "@/clients/delegateWalletClient";
import { baseSepolia } from "viem/chains";
import { createWalletClient, http } from "viem";
import type { Chain } from "viem";

const chains = [baseSepolia, VIEM_CHAIN];

createConfig({
  integrator: "Auto HODL",
  // Custom RPC URL for home chain
  rpcUrls: {
    [VIEM_CHAIN.id]: RPC_URL,
  },
  providers: [
    EVM({
      getWalletClient: async () => delegateWalletClient,
      switchChain: async (chainId) =>
        // Switch chain by creating a new wallet client
        createWalletClient({
          account: delegateEoa,
          chain: chains.find((chain) => chain.id == chainId) as Chain,
          transport: http(),
        }),
    }),
  ],
});
