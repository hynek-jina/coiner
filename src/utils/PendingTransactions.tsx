import { PendingTransactions as PendingTransactionsType } from "../state/atoms";

export const PendingTransactions = ({
  pendingTransactions,
}: {
  pendingTransactions: PendingTransactionsType;
}) => {
  return (
    <div>
      {pendingTransactions.map((transaction, index) => (
        <div key={index}>
          {/* Targets: {transaction.details.vout.length} */}
          <p>Sending: {Number(transaction.amount).toLocaleString()} sats</p>
        </div>
      ))}
    </div>
  );
};

export default PendingTransactions;
