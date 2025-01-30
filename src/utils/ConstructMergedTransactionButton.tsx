// Button which
// 1. merge all relevant transactions -> prepare the transaction for signing
// 2. calculate the stats of the merged transactions

import { useAtomValue, useSetAtom } from "jotai";
import {
  accountInfoAtom,
  coinAtom,
  extendedTransactionsAtom,
  mergedTransactionsStatsAtom,
  pendingTransactionsAtom,
  toBeSignedTransactionAtom,
} from "../state/atoms";
// import calculateTransactionsStats from "./calculateStatsFromPendingTransactions";
import { mergeDiscoveredTransactions } from "./mergeDiscoveredTransactions";

const ConstructMergedTransactionButton: React.FC = () => {
  // const setPendingTransactionsStats = useSetAtom(pendingTransactionsStatsAtom);
  const pendingTransactions = useAtomValue(pendingTransactionsAtom);
  const extendedTransactions = useAtomValue(extendedTransactionsAtom);
  const accountInfo = useAtomValue(accountInfoAtom);
  const coin = useAtomValue(coinAtom);
  const setMergedTransactionsStats = useSetAtom(mergedTransactionsStatsAtom);
  const setToBeSignedTransaction = useSetAtom(toBeSignedTransactionAtom);

  const handleButtonClick = () => {
    const transactionList = extendedTransactions
      ? extendedTransactions
      : pendingTransactions;

    console.log("transactionList", transactionList);

    const dataFromMergeDiscoveredTransactions = mergeDiscoveredTransactions(
      accountInfo,
      transactionList,
      coin
    );

    if (dataFromMergeDiscoveredTransactions) {
      const toBeSignedTransaction =
        dataFromMergeDiscoveredTransactions.toBeSignedTransaction;
      const calculatedStats =
        dataFromMergeDiscoveredTransactions.calculatedTransactionsStats;

      console.log("toBeSignedTransaction", toBeSignedTransaction);
      setToBeSignedTransaction(toBeSignedTransaction);

      setMergedTransactionsStats(calculatedStats);
    } else {
      console.error("dataFromMergeDiscoveredTransactions is null");
    }
  };
  return (
    <>
      <button onClick={handleButtonClick}>Construct Merged Transaction</button>
    </>
  );
};

export default ConstructMergedTransactionButton;
