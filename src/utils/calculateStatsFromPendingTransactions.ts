import { PendingTransaction, TransactionFeeStats } from "../state/atoms";
// calculate basic fee stats from list of pending transactions

const calculateTransactionsStats = (
  transactions: PendingTransaction[]
): TransactionFeeStats => {
  const totalFee = transactions.reduce(
    (acc, transaction) => acc + parseFloat(transaction.fee),
    0
  );
  const totalVsize = transactions.reduce(
    (acc, transaction) => acc + transaction.vsize,
    0
  );
  const yourFee = transactions
    .filter((transaction) => transaction.type === "sent")
    .reduce((acc, transaction) => acc + parseFloat(transaction.fee), 0);

  return {
    totalFee,
    totalVsize,
    averageFeeRate: parseFloat((totalFee / totalVsize).toFixed(2)),
    yourFee,
  };
};

export default calculateTransactionsStats;
