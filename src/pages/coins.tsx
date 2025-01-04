import { useAtom } from "jotai";
import BubbleChart from "../components/BubbleChart";
import {
  extendedTransactionsAtom,
  pendingTransactionsAtom,
  xpubAtom,
} from "../state/atoms";
import DoAccountDiscovery from "../utils/AccountDiscovery";
import { filterTransactionsByType } from "../utils/MergeDiscoveredTransactions";
import PendingTransactions from "../utils/PendingTransactions";
import AddDescendatsTransactionButton from "../utils/AddDescendatTransactionsButton";

const Coins = () => {
  const [xpub] = useAtom(xpubAtom);
  const [pendingTransactions] = useAtom(pendingTransactionsAtom);
  const sendOnly = filterTransactionsByType(pendingTransactions, "sent");
  const [extendedTransactions] = useAtom(extendedTransactionsAtom);

  console.log("pending", pendingTransactions);
  return (
    <div>
      {xpub ? <BubbleChart /> : <DoAccountDiscovery />}

      <div>
        <PendingTransactions pendingTransactions={sendOnly} />
        <h3>Including child transaction</h3>
        <AddDescendatsTransactionButton />
        {extendedTransactions !== null && (
          <PendingTransactions pendingTransactions={extendedTransactions} />
        )}
      </div>
    </div>
  );
};

export default Coins;
