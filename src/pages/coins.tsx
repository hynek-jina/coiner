import { useAtom } from "jotai";
import BubbleChart from "../components/BubbleChart";
import {
  extendedTransactionsAtom,
  pendingTransactionsAtom,
  toBeSignedTransactionAtom,
  xpubAtom,
} from "../state/atoms";
import DoAccountDiscovery from "../utils/AccountDiscovery";
import "../utils/AccountDiscovery.css";
import AddDescendatsTransactionButton from "../utils/AddDescendatTransactionsButton";
import CalculateSepareTransactionsStatsButton from "../utils/CalculateSepareTransactionsStatsButton";
import ComparissonTable from "../utils/ComparissonTable";
import ConstructMergedTransactionButton from "../utils/ConstructMergedTransactionButton";
import { isSentOrDescendant } from "../utils/mergeDiscoveredTransactions";
import PendingTransactions from "../utils/PendingTransactions";
import SignTransactionWithTrezor from "../utils/SignTransaction";

const Coins = () => {
  const [xpub] = useAtom(xpubAtom);
  const [pendingTransactions] = useAtom(pendingTransactionsAtom);
  const filteredTransactions = pendingTransactions.filter(isSentOrDescendant);
  const [extendedTransactions] = useAtom(extendedTransactionsAtom);
  const [toBeSignedTransaction] = useAtom(toBeSignedTransactionAtom);

  return (
    <div>
      {xpub ? <BubbleChart /> : <DoAccountDiscovery />}

      <div>
        <div className="pending-transactions-container">
          <AddDescendatsTransactionButton />
          <CalculateSepareTransactionsStatsButton />
          <ConstructMergedTransactionButton />
          <PendingTransactions
            pendingTransactions={
              extendedTransactions !== null
                ? extendedTransactions
                : filteredTransactions
            }
          />
          {((extendedTransactions && extendedTransactions.length > 1) ||
            filteredTransactions.length > 1) && <ComparissonTable />}
          {toBeSignedTransaction && (
            <SignTransactionWithTrezor
              toBeSignedTransaction={toBeSignedTransaction}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Coins;
