import TrezorConnect, {
  AccountInfo,
  SignTransaction,
} from "@trezor/connect-web";
import { PendingTransactions, pendingTransactionsAtom } from "../state/atoms";
// import { accountInfoDummyData } from "./tests/data/accountInfoDummy";
// import { pendingTransactionsDummyData } from "./tests/data/pendingTransactionDummy";
import { useAtomValue } from "jotai";
import { accountInfoAtom, coinAtom } from "../state/atoms";
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

// TODO: Use real data

export const filterTransactionsByType = (
  transactions: PendingTransactions,
  type: string
): PendingTransactions => {
  return transactions.filter((transaction) => transaction.type === type);
};

//TODO: Add parent/child to initial pending transactions
export const transformTransactionsData = (
  transactions: PendingTransactions
): TransactionData => {
  return {
    inputs: transactions.flatMap((transaction) =>
      transaction.details.vin.map((input) => ({
        txid: input.txid,
        pendingTxid: transaction.txid,
        vout: input.vout,
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

export const mergeChangeAddresses = (
  previousTransactionsData: TransactionData
): TransactionData => {
  const ownOutputsData = filterOwnOutputs(previousTransactionsData);

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
        amount: totalInputAmount - totalOutputAmount - fee,
      };
    }
    return output;
  });

  return {
    ...transactionData,
    outputs: updatedOutputs,
  };
};

// TODO - pokud je hodnota change outputu menší než dust, tak ji odstranit

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

const getAddressVSize = (address: string, type: "input" | "output"): number => {
  if (type === "input") {
    if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
      return 57.5; // Taproot input size
    } else if (address.startsWith("bc1") || address.startsWith("tb1")) {
      return 68; // SegWit input size
    } else if (address.startsWith("3") || address.startsWith("2")) {
      return 91; // P2SH input size
    } else if (
      address.startsWith("1") ||
      address.startsWith("m") ||
      address.startsWith("n")
    ) {
      return 148; // Legacy input size
    }
  } else if (type === "output") {
    if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
      return 43; // Taproot output size
    } else if (address.startsWith("bc1") || address.startsWith("tb1")) {
      return 31; // SegWit output size
    } else if (address.startsWith("3") || address.startsWith("2")) {
      return 32; // P2SH output size
    } else if (
      address.startsWith("1") ||
      address.startsWith("m") ||
      address.startsWith("n")
    ) {
      return 34; // Legacy output size
    }
  }
  return 0; // Default size if address type is unknown
};

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

  console.log("prepared inputs: ", inputs);

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
    push: true,
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

  const keepSendOnly = filterTransactionsByType(pendingTransactions, "sent");
  const transformedData = transformTransactionsData(keepSendOnly);

  const oldTotalFee = keepSendOnly.reduce(
    (acc, transaction) => acc + Number(transaction.fee),
    0
  );
  console.log("totalFee: ", oldTotalFee);

  const oldMaxFeeRate = Math.max(
    ...keepSendOnly.map((transaction) => Number(transaction.feeRate))
  );

  console.log("maxFeeRate: ", oldMaxFeeRate);
  const newFeeRate = oldMaxFeeRate + 1;
  console.log("newFeeRate: ", newFeeRate);

  const mergedChangeAddresses = mergeChangeAddresses(transformedData);
  const updatedChangeAddress = updateChangeAddress(
    mergedChangeAddresses,
    accountInfo
  );

  const removedRedundantInputs = removeRedundantInputs(
    updatedChangeAddress,
    newFeeRate
  );

  const adjustedChangeOutputAmount = adjustChangeOutputAmount(
    removedRedundantInputs,
    newFeeRate
  );

  const addedInputPaths = addPathToInputs(
    adjustedChangeOutputAmount,
    accountInfo
  );

  const addedScriptTypes = addScriptTypes(addedInputPaths);

  const toBeSignedTransaction = prepareForSigning(addedScriptTypes, coin);
  console.log("toBeSignedTransaction: ", toBeSignedTransaction);

  return toBeSignedTransaction;
};

// TODO: Identify dependent transactions

const MergeAndSignDiscoveredTransactions = () => {
  const coin = useAtomValue(coinAtom);
  const accountInfo = useAtomValue(accountInfoAtom);
  const pendingTransactions = useAtomValue(pendingTransactionsAtom);

  const handleButtonClick = async () => {
    const toBeSignedTransaction = mergeDiscoveredTransactions(
      accountInfo,
      pendingTransactions,
      coin
    );

    if (toBeSignedTransaction) {
      const signResult = await TrezorConnect.signTransaction(
        toBeSignedTransaction
      );
      console.log("signResult: ", signResult);
    } else {
      console.error("Failed to prepare transaction for signing.");
    }
  };

  return (
    <>
      <div>
        <button className="primary-button button" onClick={handleButtonClick}>
          💪 Merge
        </button>
      </div>
    </>
  );
};

export default MergeAndSignDiscoveredTransactions;
