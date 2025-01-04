//Find transactions that are descendants of a given transaction

import mempoolJS from "@mempool/mempool.js";
import { FeesMempoolBlocks } from "@mempool/mempool.js/lib/interfaces/bitcoin/fees";

interface Descendant {
  txid: string;
  fee: number;
  weight: number;
}

interface CPFPResponse {
  ancestors: any[];
  bestDescendant: any | null;
  descendants: Descendant[];
  effectiveFeePerVsize: number;
  sigops: number;
  fee: number;
  adjustedVsize: number;
}

// interface FeesMempoolBlocks {
//   blockSize: number;
//   blockVSize: number;
//   nTx: number;
//   totalFees: number;
//   medianFee: number;
//   feeRange: number[];
// }

const SearchForChildTransaction = async (
  txid: string,
  network: string
): Promise<string[] | null> => {
  try {
    const {
      bitcoin: { fees },
    } = mempoolJS({
      hostname: "mempool.space",
      network,
    });

    const receivedTransactions: CPFPResponse | FeesMempoolBlocks[] =
      await fees.getCPFP({ txid });
    console.log("receivedTransactions", receivedTransactions);

    // Check if `descendants` exists and is an array
    if (
      "descendants" in receivedTransactions &&
      Array.isArray(receivedTransactions.descendants)
    ) {
      const parsedTransactionIDs = receivedTransactions.descendants.map(
        (transaction: Descendant) => transaction.txid
      );
      console.log("parsedTransactionIDs", parsedTransactionIDs);
      return parsedTransactionIDs;
    } else {
      console.log("No descendants found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default SearchForChildTransaction;

//TODO

// getCPFP má sice vracet:
// export interface FeesMempoolBlocks { blockSize: number; blockVSize: number; nTx: number;
// totalFees: number; medianFee: number; feeRange: number[]; }

//Ale reálně z toho dostávám například: { "ancestors": [], "bestDescendant": null,
// "descendants": [ { "txid": "1186f6050b795d93df8d12fb4e7c2044ab4182aae19a3f46a1265949cedc5cdf",
// "fee": 306, "weight": 610 } ], "effectiveFeePerVsize": 1.5893027698185291, "sigops": 1, "fee": 110, "adjustedVsize": 109.25 }
