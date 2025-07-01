import { getRoutes,getQuote,RouteExtended, RoutesRequest, AllowDenyPrefer, QuoteRequest, getStepTransaction } from "@lifi/sdk";
import { VIEM_CHAIN } from "@/config";
import { TokenAddressMap } from "../constants";
import { Delegation, ExecutionStruct } from "@metamask/delegation-toolkit";
import { redeemAaveDelegations } from "../processTransfersForRoundUp";

/**
 * Fetches routes for a given chain and amount using the LiFi SDK.
 *
 * @param {number} chainId - The ID of the target blockchain.
 * @param {string} amount - The amount to be transferred.
 * @returns {Promise<Routes[]>} - A promise that resolves to an array of routes.
 */
async function requestRoute(delegatorAddress: `0x${string}`, chainId: number, amount: string) {
    const routesRequest: RoutesRequest = {
        fromChainId: VIEM_CHAIN.id,
        toChainId: chainId,
        fromTokenAddress: TokenAddressMap[VIEM_CHAIN.id],
        toTokenAddress: TokenAddressMap[chainId],
        fromAmount: amount,
        fromAddress: delegatorAddress,
        options: {
            bridges: {
                allow: ["mayanMCTP"],
            }
        }
    }
    const result = await getRoutes(routesRequest);
    return result.routes;
}

async function requestQuote(chainId: number, amount: string, senderAddress: `0x${string}`) {
    const quoteRequest: QuoteRequest = {
        fromChain: VIEM_CHAIN.id,
        toChain: chainId,
        fromToken: TokenAddressMap[VIEM_CHAIN.id],
        toToken: TokenAddressMap[chainId],
        fromAmount: amount,
        fromAddress: senderAddress,
        allowBridges: ["celercircle"], // Only allow CCTP V2
    };
    const quote = await getQuote(quoteRequest);
    return quote;

}

const getTransactionLinks = (route: RouteExtended) => {
    route.steps.forEach((step, index) => {
      step.execution?.process.forEach((process) => {
        if (process.txHash) {
          console.log(
            `Transaction Hash for Step ${index + 1}, Process ${process.type}:`,
            process.txHash
          )
        }
      })
    })
  }

export async function bridgeAndRedeem(delegation: Delegation,chainId: number, amount: string, senderAddress: `0x${string}`) {
    const routes = await requestRoute(senderAddress,chainId, amount);
    console.log("Routes:", routes);

    for (const step of routes[0].steps) {
        const data = await getStepTransaction(step);
        const execution: ExecutionStruct = {
            target: data.transactionRequest?.to as `0x${string}`,
            value: BigInt(0),
            callData: data.transactionRequest?.data as `0x${string}`,
        }
        await redeemAaveDelegations([delegation], [execution]);
    }
}