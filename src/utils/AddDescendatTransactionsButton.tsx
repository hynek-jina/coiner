// Button which
// 1. Finds all foreign descendat transactions
// 2. Fetches these transactions from mempool.space
// 3. Converts these transactions to the format used in the app
// 4. Adds these transactions to the pending transactions list

import { useAtomValue, useSetAtom } from "jotai";
import {
  childTransactionIDsAtom,
  extendedTransactionsAtom,
  networkAtom,
  pendingTransactionsAtom,
} from "../state/atoms";
import ConvertTransaction from "./ConvertTransaction";
import GetTransaction from "./GetTransaction";
import SearchForChildTransaction from "./SearchForChildTransaction";

const AddDescendatsTransactionButton = () => {
  const network = useAtomValue(networkAtom);
  const setExtendedTransactions = useSetAtom(extendedTransactionsAtom);
  const pendingTransactions = useAtomValue(pendingTransactionsAtom);
  const setChildTransactionIDs = useSetAtom(childTransactionIDsAtom);

  const handleButtonClick = async () => {
    setChildTransactionIDs([]);
    try {
      const newChildTransactionIDs = [];
      for (const transaction of pendingTransactions) {
        const result = await SearchForChildTransaction(
          transaction.txid,
          network
        );

        if (result) {
          newChildTransactionIDs.push(...result);
        }
      }
      setChildTransactionIDs(newChildTransactionIDs);

      for (const transactionID of newChildTransactionIDs) {
        const childTransaction = await GetTransaction(transactionID, network);
        if (childTransaction) {
          const convertedTransaction = ConvertTransaction(childTransaction);
          const extended = [...pendingTransactions, convertedTransaction];

          setExtendedTransactions(extended);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button onClick={handleButtonClick}>
        Extend transactions by child ones
      </button>
    </>
  );
};

export default AddDescendatsTransactionButton;
