import { ITransfer } from './types';

function processTransferForRoundUp(transfer: ITransfer) {
  console.log('Processing transfer:', {
    hash: transfer.transactionHash,
    from: transfer.from,
    to: transfer.to,
    token: transfer.tokenSymbol,
    amount: transfer.amount,
    chain: transfer.chain,
  });

  // TODO
  // - Store transfer in database
  // - Fetch savings address and round up amount from DB for address
  // - Calculate round-up amount
  // - Trigger savings transaction and save to DB
}

export function processTransfersForRoundUp(transfers: ITransfer[]) {
  // Process each relevant transfer
  for (const transfer of transfers) {
    processTransferForRoundUp(transfer);
  }
}
