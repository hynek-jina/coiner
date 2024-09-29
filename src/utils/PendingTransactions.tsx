import { PendingTransactions as PendingTransactionsType } from "../state/atoms";
import MergeAndSignDiscoveredTransactions from "./MergeDiscoveredTransactions";
import "./PendingTransactions.css";

export const PendingTransactions = ({
  pendingTransactions,
}: {
  pendingTransactions: PendingTransactionsType;
}) => {
  return (
    <div className="pending-transactions-container">
      {pendingTransactions.length > 0 && (
        <>
          <h2>Pending transactions under your control:</h2>
          {pendingTransactions.map((transaction, index) => (
            <div key={index} className="pending-transaction">
              <div className="head-row">
                <p className="left-aligned">Sending:</p>
                <p className="right-aligned">
                  {Number(transaction.amount).toLocaleString()} sat
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
            <div className="buttons-next-to-each-other">
              {/* <button className="secondary-button button" disabled>
                🚫 Cancel
              </button> */}
              <MergeAndSignDiscoveredTransactions />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingTransactions;
