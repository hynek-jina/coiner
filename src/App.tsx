import TrezorConnect from "@trezor/connect-web";
import { useAtom } from "jotai";
import BubbleChart from "./components/BubbleChart";
import { xpubAtom } from "./state/atoms";
import DoAccountDiscovery from "./utils/AccountDiscovery";
// import ComposeTransaction from "./utils/ComposeTransaction";
// import FindPendingTxs from "./utils/FindPendingTxs";
// import GetUtxos from "./utils/GetUtxos";
import MergeDiscoveredTransactions from "./utils/MergeDiscoveredTransactions";
import PendingTransactions from "./utils/PendingTransactions";
// import SignTransaction from "./utils/SignTransaction";
// import { pendingTransactionsDummyData } from "./utils/tests/data/pendingTransactionDummy";
import { useEffect } from "react";
import { pendingTransactionsAtom } from "./state/atoms";

function App() {
  const [xpub] = useAtom(xpubAtom);
  const [pendingTransactions] = useAtom(pendingTransactionsAtom);

  useEffect(() => {
    TrezorConnect.init({
      lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
      manifest: {
        email: "developer@xyz.com",
        appUrl: "http://your.application.com",
      },
    });
  }, []);

  return (
    <div
      style={{ backgroundColor: "black", color: "white", minHeight: "100vh" }}
    >
      {xpub ? (
        <div style={{ border: "2px solid blue" }}>
          <b>BubbleChart</b>
          <BubbleChart />
        </div>
      ) : (
        <></>
      )}
      <div>
        <b>Account Discovery</b>
        <DoAccountDiscovery />
      </div>

      {/* <div style={{ border: "2px solid blue" }}>
        <b>FindPendingTxs</b>
        <FindPendingTxs />
      </div> */}
      <div style={{ border: "2px solid blue" }}>
        <b>Pending Transactions</b>
        <PendingTransactions pendingTransactions={pendingTransactions} />
      </div>
      <div style={{ border: "2px solid blue" }}>
        <b>MergeDiscoveredTransactions</b>
        <MergeDiscoveredTransactions />
      </div>
    </div>
  );
}

export default App;
