// Button which
// 1. calculates the stats of the pending and descendant transactions

import { useAtomValue, useSetAtom } from "jotai";
import {
  extendedTransactionsAtom,
  pendingTransactionsStatsAtom,
} from "../state/atoms";
import calculateTransactionsStats from "./calculateStatsFromPendingTransactions";

const CalculateSepareTransactionsStatsButton = () => {
  const setPendingTransactionsStats = useSetAtom(pendingTransactionsStatsAtom);
  const extendedTransactions = useAtomValue(extendedTransactionsAtom);

  const handleButtonClick = () => {
    if (extendedTransactions === null) return;
    const calculatedStats = calculateTransactionsStats(extendedTransactions);
    setPendingTransactionsStats(calculatedStats);
  };
  return (
    <>
      <button onClick={handleButtonClick}>
        Calculate Separe Transactions Stats
      </button>
    </>
  );
};

export default CalculateSepareTransactionsStatsButton;
