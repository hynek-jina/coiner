import TrezorConnect, {
  AccountInfo,
  SignTransaction,
} from "@trezor/connect-web";
import { PendingTransactions } from "../state/atoms";
import { accountInfoDummyData } from "./tests/data/accountInfoDummy";
import { pendingTransactionsDummyData } from "./tests/data/pendingTransactionDummy";

type TransactionData = {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  vsize: number;
};

interface TransactionInput {
  // direction: "input";
  txid: string;
  vout: number;
  address: string;
  isOwn: boolean;
  path: string;
  amount: number;
  scriptType?: inputScriptType;
}

interface TransactionOutput {
  // direction: "output";
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

export const transformTransactionsData = (
  transactions: PendingTransactions
): TransactionData => {
  return {
    inputs: transactions.flatMap((transaction) =>
      transaction.details.vin.map((input) => ({
        txid: input.txid,
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

  for (let i = 0; i < sortedInputs.length; i++) {
    selectedInputs.push(sortedInputs[i]);

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
    const matchingAddress = accountInfo.addresses?.used.find(
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
  return path.split("/").map((level) => {
    if (level.endsWith("'")) {
      return parseInt(level.slice(0, -1), 10) + 0x80000000; // Hardened
    }
    return parseInt(level, 10);
  });
};

const prepareForSigning = (
  transactionData: TransactionData
): SignTransaction => {
  // Převod inputů
  const inputs = transactionData.inputs.map((input) => ({
    address_n: getAddressN(input.path),
    prev_index: input.vout,
    prev_hash: input.txid,
    amount: input.amount,
    script_type: input.scriptType,
  }));

  // Převod outputů
  const outputs = transactionData.outputs.map((output) => ({
    address_n: getAddressN(output.path),
    amount: output.amount,
    script_type: output.scriptType,
  }));

  // Vrácení struktury pro signTransaction
  return {
    inputs,
    outputs,
    coin: "test",
    push: false,
    amountUnit: 3,
  };
};

const MergeDiscoveredTransactions = () => {
  // const accountInfo = useAtomValue(accountInfoAtom);
  const accountInfo = accountInfoDummyData;

  if (accountInfo === null) {
    return null;
  }

  const handleButtonClick = async () => {
    const keepSendOnly = filterTransactionsByType(
      pendingTransactionsDummyData,
      "sent"
    );
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

    console.log("removedRedundantInputs: ", removedRedundantInputs);

    const addedInputPaths = addPathToInputs(
      removedRedundantInputs,
      accountInfo
    );

    const addedScriptTypes = addScriptTypes(addedInputPaths);

    const toBeSignedTransaction = prepareForSigning(addedScriptTypes);
    console.log("toBeSignedTransaction: ", toBeSignedTransaction);

    const signResult = await TrezorConnect.signTransaction(
      toBeSignedTransaction
    );
    console.log("signResult: ", signResult);

    // TODO: Identify dependent transactions
  };

  return (
    <>
      <div>
        <p>Log merge of transactions</p>
        <button onClick={handleButtonClick}>merge pending</button>

        {/* <div>{buttonOutput}</div> */}
      </div>
    </>
  );
};

export default MergeDiscoveredTransactions;
