import { useAtom } from "jotai";
import BubbleChart from "../components/BubbleChart";
import { pendingTransactionsAtom, xpubAtom } from "../state/atoms";
import DoAccountDiscovery from "../utils/AccountDiscovery";
import { filterTransactionsByType } from "../utils/MergeDiscoveredTransactions";
import PendingTransactions from "../utils/PendingTransactions";

const Coins = () => {
  const [xpub] = useAtom(xpubAtom);
  const [pendingTransactions] = useAtom(pendingTransactionsAtom);
  const sendOnly = filterTransactionsByType(pendingTransactions, "sent");

  return (
    <div>
      {xpub ? <BubbleChart /> : <DoAccountDiscovery />}

      <div>
        <PendingTransactions pendingTransactions={sendOnly} />
      </div>
    </div>
  );
};

export default Coins;
