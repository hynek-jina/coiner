import { PendingTransactions as PendingTransactionsType } from "../state/atoms";
import "./PendingTransactions.css";

// This component hadnle UI of the pending transactions

export const PendingTransactions = ({
  pendingTransactions,
}: {
  pendingTransactions: PendingTransactionsType;
}) => {
  return (
    <>
      {pendingTransactions.length > 0 && (
        <>
          <h2>Pending transactions</h2>
          {pendingTransactions.map((transaction, index) => (
            <div key={index} className="pending-transaction">
              <div className="head-row">
                <p className="left-aligned">
                  {" "}
                  {transaction.type === "sent"
                    ? "Sending"
                    : transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1)}
                </p>
                <p className="right-aligned">
                  {transaction.type === "sent"
                    ? Number(transaction.amount).toLocaleString() + " sat"
                    : ""}
                </p>
              </div>
              <div className="details-row">
                <span className="left-aligned">+ Fee</span>
                <span className="right-aligned">
                  <span>{transaction.vsize} vB</span>
                  <span>{transaction.feeRate} sat/vB</span>
                  <span>{transaction.fee} sat</span>
                </span>
              </div>
            </div>
          ))}

          {pendingTransactions.length > 1 && (
            <div className="buttons-next-to-each-other"></div>
          )}
        </>
      )}
    </>
  );
};

export default PendingTransactions;
