import { PendingTransactions as PendingTransactionsType } from "../state/atoms";

const PendingTransactions = ({
  pendingTransactions,
}: {
  pendingTransactions: PendingTransactionsType;
}) => {
  return (
    <div>
      {pendingTransactions.map((transaction, index) => (
        <div key={index}>
          <p>Type: {transaction.type}</p>
          <p>Targets: {transaction.details.vout.length}</p>
          <p>Amount: {transaction.amount}</p>
        </div>
      ))}
    </div>
  );
};

export default PendingTransactions;
