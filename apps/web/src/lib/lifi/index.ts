import type { QuoteRequest, RouteExtended, RoutesRequest } from "@lifi/sdk";
import { getQuote, getRoutes, getStepTransaction, getStatus } from "@lifi/sdk";
import type { Delegation, ExecutionStruct } from "@metamask/delegation-toolkit";
import { VIEM_CHAIN } from "@/config";
import { TokenAddressMap } from "@/lib/constants";
import { redeemAaveDelegations } from "@/lib/processTransfersForRoundUp";
import { encodeApproveTokensCallData } from "@/lib/yield/aave";

/**
 * Fetches routes for a given chain and amount using the LiFi SDK.
 *
 * @param {number} chainId - The ID of the target blockchain.
 * @param {string} amount - The amount to be transferred.
 * @returns {Promise<Routes[]>} - A promise that resolves to an array of routes.
 */
async function requestRoute(
  delegatorAddress: `0x${string}`,
  toAccount: `0x${string}`,
  chainId: number,
  amount: string
) {
  const routesRequest: RoutesRequest = {
    fromChainId: VIEM_CHAIN.id,
    toChainId: chainId,
    fromTokenAddress: TokenAddressMap[VIEM_CHAIN.id],
    toTokenAddress: TokenAddressMap[chainId],
    fromAmount: amount,
    fromAddress: delegatorAddress,
    toAddress: toAccount,
    options: {
      bridges: {
        allow: ["mayanMCTP"],
      },
    },
  };
  const result = await getRoutes(routesRequest);
  return result.routes;
}

export async function requestQuote(
  chainId: number,
  amount: string,
  senderAddress: `0x${string}`
) {
  const quoteRequest: QuoteRequest = {
    fromChain: VIEM_CHAIN.id,
    toChain: chainId,
    fromToken: TokenAddressMap[VIEM_CHAIN.id],
    toToken: TokenAddressMap[chainId],
    fromAmount: amount,
    fromAddress: senderAddress,
    allowBridges: ["mayanMCTP"], 
  };
  const quote = await getQuote(quoteRequest);
  return quote;
}

export const getTransactionLinks = (route: RouteExtended) => {
  route.steps.forEach((step, index) => {
    step.execution?.process.forEach((process) => {
      if (process.txHash) {
        console.log(
          `Transaction Hash for Step ${index + 1}, Process ${process.type}:`,
          process.txHash
        );
      }
    });
  });
};

export async function bridgeAndRedeem(
  delegation: Delegation,
  chainId: number,
  amount: string,
  senderAddress: `0x${string}`,
  recieverAddress: `0x${string}`,
) : Promise<`0x${string}`> {
  const routes = await requestRoute(senderAddress, recieverAddress, chainId, amount);
  // We expect one step.
  for (const step of routes[0].steps) {
    const data = await getStepTransaction(step);
    const approvalCallData = encodeApproveTokensCallData(
      data.transactionRequest?.to as `0x${string}`,
      BigInt(amount)
    );
    const approvalExecution: ExecutionStruct = {
      target: TokenAddressMap[VIEM_CHAIN.id],
      value: BigInt(0),
      callData: approvalCallData,
    };
    const bridgeExecution: ExecutionStruct = {
      target: data.transactionRequest?.to as `0x${string}`,
      value: BigInt(0),
      callData: data.transactionRequest?.data as `0x${string}`,
    };

    const transactionHash = await redeemAaveDelegations(
      [delegation, delegation],
      [approvalExecution, bridgeExecution]
    );
    return transactionHash;
    
    // let status;
    // do {
    //   const result = await getStatus({
    //     txHash: transactionHash,
    //     fromChain: step.action.fromChainId,
    //     toChain: step.action.toChainId,
    //     bridge: step.tool,
    //   });
    //   status = result.status;

    //   console.log(`Transaction status for ${transactionHash}:`, status);

    //   // Wait for a short period before checking the status again
    //   await new Promise((resolve) => setTimeout(resolve, 5000));
    // } while (status !== "DONE" && status !== "FAILED");

    // if (status === "FAILED") {
    //   console.error(`Transaction ${transactionHash} failed`);
    //   return;
    // }
  }
  throw new Error("No steps found or transaction could not be completed.");
}
