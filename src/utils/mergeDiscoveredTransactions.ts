import { AccountInfo, SignTransaction } from "@trezor/connect-web";
import {
  PendingTransaction,
  PendingTransactions,
  TransactionFeeStats,
} from "../state/atoms";
import "./PendingTransactions.css";

type TransactionData = {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  vsize: number;
};

interface TransactionInput {
  txid: string; //previous transaction id
  pendingTxid: string; //current transaction id
  vout: number;
  address: string;
  isOwn: boolean;
  path: string;
  amount: number;
  scriptType?: inputScriptType;
}

interface TransactionOutput {
  txid: string;
  // vout: number;
  address: string;
  isOwn: boolean;
  path: string;
  amount: number;
  scriptType?: outputScriptType;
}

type inputScriptType =
  | "SPENDADDRESS"
  | "SPENDMULTISIG"
  | "SPENDWITNESS"
  | "SPENDP2SHWITNESS"
  | "SPENDTAPROOT";

type outputScriptType =
  | "PAYTOADDRESS"
  | "PAYTOMULTISIG"
  | "PAYTOWITNESS"
  | "PAYTOP2SHWITNESS"
  | "PAYTOTAPROOT";

export const isSentOrDescendant = (
  transaction: PendingTransaction
): boolean => {
  return transaction.type === "sent" || transaction.type === "descendant";
};

export const transformTransactionsData = (
  transactions: PendingTransactions
): TransactionData => {
  return {
    inputs: transactions.flatMap((transaction) =>
      transaction.details.vin.map((input) => ({
        txid: input.txid,
        pendingTxid: transaction.txid,
        vout: input.vout ?? 0, // TODO check that it is really 0 when not present
        address: input.addresses[0],
        isOwn: input.isOwn ?? false,
        path: "",
        amount: Number(input.value),
      }))
    ),
    outputs: transactions.flatMap((transaction) =>
      transaction.details.vout.map((output) => ({
        txid: transaction.txid,
        address: output.addresses[0],
        isOwn: output.isOwn ?? false,
        path: "",
        amount: Number(output.value),
      }))
    ),
    vsize: transactions.reduce(
      (sum, transaction) => sum + transaction.vsize,
      0
    ),
  };
};

export const filterOwnOutputs = (transactionData: TransactionData) => {
  return transactionData.outputs.filter((output) => output.isOwn);
};
export const removeDescendantInputsAndRelatedOutputs = (
  previousTransactionsData: TransactionData
): TransactionData => {
  const toBeDeletedOutputs = previousTransactionsData.inputs
    .filter((input) => !input.isOwn)
    .map((input) => input.txid);

  previousTransactionsData.inputs = previousTransactionsData.inputs.filter(
    (input) => input.isOwn
  );

  previousTransactionsData.outputs = previousTransactionsData.outputs.filter(
    (output) => !toBeDeletedOutputs.includes(output.txid)
  );

  return previousTransactionsData;
};

export const mergeChangeAddresses = (
  previousTransactionsData: TransactionData
): TransactionData => {
  const ownOutputsData = filterOwnOutputs(previousTransactionsData);

  // TODO - handle case when there are no own outputs

  const totalAmount = ownOutputsData.reduce(
    (sum, output) => sum + output.amount,
    0
  );

  const mergedOutputs: TransactionOutput[] = [
    {
      ...ownOutputsData[0],
      amount: totalAmount,
    },
    ...previousTransactionsData.outputs.filter((output) => !output.isOwn),
  ];

  return {
    ...previousTransactionsData,
    outputs: mergedOutputs,
  };
};

const adjustChangeOutputAmount = (
  transactionData: TransactionData,
  newFeeRate?: number
): TransactionData => {
  const { inputs, outputs, vsize } = transactionData;

  const totalInputAmount = inputs.reduce((sum, input) => sum + input.amount, 0);

  const totalOutputAmount = outputs
    .filter((output) => !output.isOwn)
    .reduce((sum, output) => sum + output.amount, 0);

  const fee = newFeeRate ? vsize * newFeeRate : 0;
  const updatedOutputs = outputs.map((output) => {
    if (output.isOwn) {
      return {
        ...output,
        amount: Math.round(totalInputAmount - totalOutputAmount - fee),
      };
    }
    return output;
  });

  return {
    ...transactionData,
    outputs: updatedOutputs,
  };
};

// TODO - remove dust change output

const updateChangeAddress = (
  transactionData: TransactionData,
  accountInfo: AccountInfo
): TransactionData => {
  let firstUnusedChangeAddress = accountInfo?.addresses?.change.find(
    (address) => address.transfers === 0
  );

  const updatedOutputs = transactionData.outputs.map((output) => {
    if (output.isOwn && firstUnusedChangeAddress) {
      return {
        ...output,
        address: firstUnusedChangeAddress.address,
        path: firstUnusedChangeAddress.path,
      };
    }
    return output;
  });

  return {
    ...transactionData,
    outputs: updatedOutputs,
  };
};

type ScriptTypeShortened = string;
type ScriptType = string;
type AddressInfo = { vSize: number; scriptType: ScriptType };

type AddressInfos = Record<ScriptTypeShortened, AddressInfo>;

const inputMap: AddressInfos = {
  bc1p: { vSize: 57.5, scriptType: "SPENDTAPROOT" },
  tb1p: { vSize: 57.5, scriptType: "SPENDTAPROOT" },
  bc1: { vSize: 68, scriptType: "SPENDWITNESS" },
  tb1: { vSize: 68, scriptType: "SPENDWITNESS" },
  "3": { vSize: 91, scriptType: "SPENDP2SHWITNESS" },
  "2": { vSize: 91, scriptType: "SPENDP2SHWITNESS" },
  "1": { vSize: 148, scriptType: "SPENDADDRESS" },
  m: { vSize: 148, scriptType: "SPENDADDRESS" },
  n: { vSize: 148, scriptType: "SPENDADDRESS" },
};
const outputMap: AddressInfos = {
  bc1p: { vSize: 43, scriptType: "PAYTOTAPROOT" },
  tb1p: { vSize: 43, scriptType: "PAYTOTAPROOT" },
  bc1: { vSize: 31, scriptType: "PAYTOWITNESS" },
  tb1: { vSize: 31, scriptType: "PAYTOWITNESS" },
  "3": { vSize: 32, scriptType: "PAYTOP2SHWITNESS" },
  "2": { vSize: 32, scriptType: "PAYTOP2SHWITNESS" },
  "1": { vSize: 34, scriptType: "PAYTOADDRESS" },
  m: { vSize: 34, scriptType: "PAYTOADDRESS" },
  n: { vSize: 34, scriptType: "PAYTOADDRESS" },
};

const getAddressVSize = (address: string, type: "input" | "output"): number => {
  const getInfo = (data: AddressInfos) => {
    // return Object.keys(data).reduce<AddressInfo | null>((acc, key) => {
    //   if (address.startsWith(key)) {
    //     return inputMap[key];
    //   }
    //   return acc;
    // }, null);
    const resultKey = Object.keys(data).find((key) => {
      return address.startsWith(key);
    });
    return resultKey ? data[resultKey] : null;
  };

  const addressInfo = getInfo(type === "input" ? inputMap : outputMap);
  return addressInfo?.vSize ?? 0;
};

// TODO refactor according above approach
const getInputScriptType = (address: string): inputScriptType => {
  if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
    return "SPENDTAPROOT";
  } else if (address.startsWith("bc1") || address.startsWith("tb1")) {
    return "SPENDWITNESS";
  } else if (address.startsWith("3") || address.startsWith("2")) {
    return "SPENDP2SHWITNESS";
  } else if (
    address.startsWith("1") ||
    address.startsWith("m") ||
    address.startsWith("n")
  ) {
    return "SPENDADDRESS";
  } else {
    return "SPENDADDRESS";
  }
};

const getOutputScriptType = (address: string): outputScriptType => {
  if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
    return "PAYTOTAPROOT";
  } else if (address.startsWith("bc1") || address.startsWith("tb1")) {
    return "PAYTOWITNESS";
  } else if (address.startsWith("3") || address.startsWith("2")) {
    return "PAYTOP2SHWITNESS";
  } else if (
    address.startsWith("1") ||
    address.startsWith("m") ||
    address.startsWith("n")
  ) {
    return "PAYTOADDRESS";
  } else {
    return "PAYTOADDRESS";
  }
};

const addScriptTypes = (transactionData: TransactionData): TransactionData => {
  const updatedInputs = transactionData.inputs.map((input) => {
    return {
      ...input,
      scriptType: getInputScriptType(input.address),
    };
  });

  const updatedOutputs = transactionData.outputs.map((output) => {
    return {
      ...output,
      scriptType: getOutputScriptType(output.address),
    };
  });

  return {
    ...transactionData,
    inputs: updatedInputs,
    outputs: updatedOutputs,
  };
};

const updateTransactionVSize = (
  transactionData: TransactionData
): TransactionData => {
  const inputVSize = transactionData.inputs.reduce(
    (acc, input) => acc + getAddressVSize(input.address, "input"),
    0
  );
  const outputVSize = transactionData.outputs.reduce(
    (acc, output) => acc + getAddressVSize(output.address, "output"),
    0
  );
  const headerVSize = 10.5; // TODO Distiguish legacy where the header size is 10
  const updatedVSize = inputVSize + outputVSize + headerVSize;

  return { ...transactionData, vsize: updatedVSize };
};

const calculateTransactionsStats = (
  transactionData: TransactionData,
  ownSendAmount: number
): TransactionFeeStats => {
  const totalInputAmount = transactionData.inputs.reduce(
    (acc, input) => acc + input.amount,
    0
  );
  const totalOutputAmount = transactionData.outputs.reduce(
    (acc, output) => acc + output.amount,
    0
  );
  const totalFee = totalInputAmount - totalOutputAmount;

  const yourInputAmount = transactionData.inputs
    .filter((input) => input.isOwn)
    .reduce((acc, input) => acc + input.amount, 0);
  const yourOutputAmount = transactionData.outputs
    .filter((output) => output.isOwn)
    .reduce((acc, output) => acc + output.amount, 0);
  const yourFee = yourInputAmount - ownSendAmount - yourOutputAmount;

  // TODO vypočítat, kolik jsem chtěl původně odeslat

  const totalVsize = transactionData.vsize;

  return {
    totalFee,
    yourFee,
    totalVsize,
    averageFeeRate: parseFloat((totalFee / totalVsize).toFixed(2)),
  };
};
// Napiš funkci, která z takovéhoto objektu spočítá fee stats
// {
//     "inputs": [
//       {
//           "txid": "1a5a955a58e07c10c7891208f5981b0a5b62d1fa6a7a2c286b331168df68efe8",
//           "pendingTxid": "2e6d979b0dd7ff2a6bb9a81af48533a59e45bf4c5e8279cf8a6b1c017db2125b",
//           "vout": 1,
//           "address": "tb1qdxm5nnl6fxgwe59s9lrd60n5s7whf0a7xssvnm",
//           "isOwn": true,
//           "path": "m/84'/1'/0'/1/63",
//           "amount": 1640700,
//           "scriptType": "SPENDWITNESS"
//       },
//       {
//           "txid": "9708ff40149e4591ccc205a073f27c5a95b3beb5ebd6dd6ba3b60b8f2f754780",
//           "pendingTxid": "3fb5b5f110d6a8ec214bb111d5cdeda6e1f9d54d8334b290216a315ece23d193",
//           "address": "tb1qz2xkz9xhsfwwhws0e2fdjyn4220yjnjp8eh5x5",
//           "isOwn": true,
//           "path": "m/84'/1'/0'/0/54",
//           "amount": 40000,
//           "scriptType": "SPENDWITNESS"
//       }
//   ],
//   "outputs": [
//       {
//           "txid": "2e6d979b0dd7ff2a6bb9a81af48533a59e45bf4c5e8279cf8a6b1c017db2125b",
//           "address": "tb1qtyfdl5hyycrfj443nw247hy3y7n6w4plp5e5y3",
//           "isOwn": true,
//           "path": "m/84'/1'/0'/1/67",
//           "amount": 1615201.9,
//           "scriptType": "PAYTOWITNESS"
//       },
//       {
//           "txid": "2e6d979b0dd7ff2a6bb9a81af48533a59e45bf4c5e8279cf8a6b1c017db2125b",
//           "address": "tb1pvlhk0k8gc6ueh4ejx5t0vdkqhrmjhws755s7sazjg2xgqgwsvctq4yhp50",
//           "isOwn": false,
//           "path": "",
//           "amount": 25000,
//           "scriptType": "PAYTOTAPROOT"
//       },
//       {
//           "txid": "1186f6050b795d93df8d12fb4e7c2044ab4182aae19a3f46a1265949cedc5cdf",
//           "address": "tb1q68gfn8033ah8ld8vagtcrgm08xcxsekpecuy34",
//           "isOwn": false,
//           "path": "",
//           "amount": 19584,
//           "scriptType": "PAYTOWITNESS"
//       },
//       {
//           "txid": "1186f6050b795d93df8d12fb4e7c2044ab4182aae19a3f46a1265949cedc5cdf",
//           "address": "tb1p8levqrwxjyra5gfdc3hh277e0xc2vprc0cnjqv9xh833pd2c9jds8suzfs",
//           "isOwn": false,
//           "path": "",
//           "amount": 20000,
//           "scriptType": "PAYTOTAPROOT"
//       }
//   ],
//   "vsize": 415.5
// }

const calculateVsize = (transactionData: TransactionData): number => {
  const baseTxSize = 10; //
  const totalInputSize = transactionData.inputs.reduce((sum, input) => {
    return sum + getAddressVSize(input.address, "input");
  }, 0);
  const totalOutputSize = transactionData.outputs.reduce((sum, output) => {
    return sum + getAddressVSize(output.address, "output");
  }, 0);
  return baseTxSize + totalInputSize + totalOutputSize;
};

const removeRedundantInputs = (
  previousTransactionsData: TransactionData,
  feeRate: number
): TransactionData => {
  const totalDistantOutputValue = previousTransactionsData.outputs
    .filter((output) => !output.isOwn)
    .reduce((sum, output) => sum + output.amount, 0);

  const sortedInputs = previousTransactionsData.inputs.sort(
    (a, b) => b.amount - a.amount
  );

  let selectedInputs: TransactionInput[] = [];
  let temporaryVSize = 0;
  let filteredInputsAreSufficient = false;
  let temporaryTransactionData = previousTransactionsData;

  // Adding biggest input from each parent transaction
  const uniquePendingTxids = new Set(
    previousTransactionsData.inputs.map((input) => input.pendingTxid)
  );

  uniquePendingTxids.forEach((pendingTxid) => {
    const inputsFromTxid = sortedInputs.filter(
      (input) => input.pendingTxid === pendingTxid
    );
    if (inputsFromTxid.length > 0) {
      selectedInputs.push(inputsFromTxid[0]);
    }
  });

  // Check if the selected inputs are sufficient
  for (let i = selectedInputs.length; i < sortedInputs.length; i++) {
    temporaryTransactionData = {
      ...previousTransactionsData,
      inputs: selectedInputs,
    };

    temporaryVSize = calculateVsize(temporaryTransactionData);

    let temporaryInputsAmount = selectedInputs.reduce(
      (sum, input) => sum + input.amount,
      0
    );

    let changeOutputIndex = temporaryTransactionData.outputs.findIndex(
      (output) => output.isOwn
    );

    filteredInputsAreSufficient =
      temporaryVSize * feeRate + totalDistantOutputValue <=
      temporaryInputsAmount;

    if (filteredInputsAreSufficient) {
      const newChangeAmount =
        temporaryInputsAmount -
        totalDistantOutputValue -
        temporaryVSize * feeRate;

      temporaryTransactionData.outputs[changeOutputIndex].amount =
        newChangeAmount;

      break;
    } else {
      selectedInputs.push(sortedInputs[i]);
    }
  }

  if (!filteredInputsAreSufficient) {
    return previousTransactionsData;
  } else {
    return temporaryTransactionData;
  }
};

const addPathToInputs = (
  transactionData: TransactionData,
  accountInfo: AccountInfo
): TransactionData => {
  const updatedInputs = transactionData.inputs.map((input) => {
    const matchingAddress =
      accountInfo.addresses?.used.find(
        (addressInfo) => addressInfo.address === input.address
      ) ||
      accountInfo.addresses?.change.find(
        (addressInfo) => addressInfo.address === input.address
      );

    if (matchingAddress) {
      return {
        ...input,
        path: matchingAddress.path,
      };
    }

    return input;
  });

  return {
    ...transactionData,
    inputs: updatedInputs,
  };
};

const getAddressN = (path: string): number[] => {
  return path
    .split("/")
    .filter((level) => level !== "m")
    .map((level) => {
      if (level.endsWith("'")) {
        return parseInt(level.slice(0, -1), 10) + 0x80000000; // Hardened
      }
      return parseInt(level, 10);
    });
};

const prepareForSigning = (
  transactionData: TransactionData,
  coin: string
): SignTransaction => {
  const inputs = transactionData.inputs.map((input) => ({
    address_n: getAddressN(input.path),
    prev_index: input.vout,
    prev_hash: input.txid,
    amount: input.amount,
    script_type: input.scriptType,
  }));

  const outputs = [];

  for (const output of transactionData.outputs) {
    if (output.isOwn) {
      outputs.push({
        address_n: getAddressN(output.path),
        amount: output.amount,
        script_type: output.scriptType,
      });
    } else {
      outputs.push({
        address: output.address,
        amount: output.amount,
        script_type: output.scriptType,
      });
    }
  }

  return {
    inputs,
    outputs,
    coin: coin,
    push: false,
    amountUnit: 3,
  };
};

export const mergeDiscoveredTransactions = (
  accountInfo: AccountInfo | null,
  pendingTransactions: PendingTransactions,
  coin: string
) => {
  if (accountInfo === null) {
    return null;
  }
  // const setMergedTransactionsStats = useSetAtom(mergedTransactionsStatsAtom);
  const filteredTransactions = pendingTransactions.filter(isSentOrDescendant);
  console.log("filteredTransactions", filteredTransactions);
  const transformedData = transformTransactionsData(filteredTransactions);

  // update vsize

  const sentOnly = filteredTransactions.filter(
    (transaction) => transaction.type === "sent"
  );

  // const oldTotalFee = filteredTransactions.reduce(
  //   (acc, transaction) => acc + Number(transaction.fee),
  //   0
  // );
  // console.log("totalFee: ", oldTotalFee);

  const oldMaxFeeRate = Math.max(
    ...sentOnly.map((transaction) => Number(transaction.feeRate))
  );

  // console.log("maxFeeRate: ", oldMaxFeeRate);
  const newFeeRate = oldMaxFeeRate + 0.5; // TODO - consider descendant fee rates
  // console.log("newFeeRate: ", newFeeRate);

  const transformedSentOnly = transformTransactionsData(sentOnly);
  const ownSendAmount = transformedSentOnly.outputs
    .filter((output) => !output.isOwn)
    .reduce((sum, output) => sum + output.amount, 0);

  console.log("Own Send Amount:", ownSendAmount);

  console.log("transformedData", transformedData);
  const removedDescendantInputsAndRelatedOutputs =
    removeDescendantInputsAndRelatedOutputs(transformedData);
  console.log(
    "removedDescendantInputsAndRelatedOutputs",
    removedDescendantInputsAndRelatedOutputs
  );

  const mergedChangeAddresses = mergeChangeAddresses(
    removedDescendantInputsAndRelatedOutputs
  );

  const updatedChangeAddress = updateChangeAddress(
    mergedChangeAddresses,
    accountInfo
  );

  const removedRedundantInputs = removeRedundantInputs(
    updatedChangeAddress,
    newFeeRate
  );

  const updatedVSize = updateTransactionVSize(removedRedundantInputs);

  const adjustedChangeOutputAmount = adjustChangeOutputAmount(
    updatedVSize,
    newFeeRate
  );

  const addedInputPaths = addPathToInputs(
    adjustedChangeOutputAmount,
    accountInfo
  );

  const addedScriptTypes = addScriptTypes(addedInputPaths);

  const calculatedTransactionsStats = calculateTransactionsStats(
    addedScriptTypes,
    ownSendAmount
  );

  const toBeSignedTransaction = prepareForSigning(addedScriptTypes, coin);

  return { toBeSignedTransaction, calculatedTransactionsStats };
};
