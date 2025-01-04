import { useAtom } from "jotai";
import {
  extendedTransactionsAtom,
  PendingTransaction,
  PendingTransactions,
  pendingTransactionsAtom,
} from "../state/atoms";

// Transform getTransaction data from mempool.space API to pending transactions structure

const AddToPendingTransactions = (
  toBeAddedTransaction: PendingTransaction
): PendingTransactions | null => {
  const [pendingTransactions] = useAtom(pendingTransactionsAtom);
  const [extendedTransactions, setExtendedTransactions] = useAtom(
    extendedTransactionsAtom
  );

  const newPendingTransactions = [...pendingTransactions, toBeAddedTransaction];
  setExtendedTransactions(newPendingTransactions);

  return extendedTransactions;
};

export default AddToPendingTransactions;
