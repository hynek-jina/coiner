import { Tx } from "@mempool/mempool.js/lib/interfaces/bitcoin/transactions";
import { PendingTransaction } from "../state/atoms";

// Transform getTransaction data from mempool.space API to pending transactions structure

const convertTransaction = (tx: Tx): PendingTransaction => {
  return {
    type: "descendant",
    txid: tx.txid,
    // hex, blockTime, blockHeight
    lockTime: tx.locktime,
    // amount: tx.vout.reduce((acc, output) => acc + output.value, 0).toString(),
    amount: "",
    fee: tx.fee.toString(),
    vsize: tx.weight / 4,
    feeRate: (tx.fee / (tx.weight / 4)).toFixed(1).toString(),
    // targets, tokens, internalTransfers, rbf
    details: {
      vin: tx.vin.map((input, index) => ({
        txid: input.txid,
        vout: input.vout,
        sequence: parseInt(input.sequence, 10),
        n: index,
        addresses: input.prevout.scriptpubkey_address
          ? [input.prevout.scriptpubkey_address]
          : [],
        isAddress: !!input.prevout.scriptpubkey_address,
        // isOwn: true,
        // value: input.prevout.value.toString(),
        // isAccountOwned: true,
      })),
      vout: tx.vout.map((output, index) => ({
        value: output.value.toString(),
        n: index,
        addresses: output.scriptpubkey_address
          ? [output.scriptpubkey_address]
          : [],
        isAddress: !!output.scriptpubkey_address,
        // hex: output.scriptpubkey,
      })),
      size: tx.size,
      totalInput: tx.vin
        .reduce((acc, input) => acc + input.prevout.value, 0)
        .toString(),
      totalOutput: tx.vout
        .reduce((acc, output) => acc + output.value, 0)
        .toString(),
    },
  };
};

export default convertTransaction;
