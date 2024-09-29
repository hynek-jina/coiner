import TrezorConnect from "@trezor/connect-web";
import { useAtom } from "jotai";
import BubbleChart from "./components/BubbleChart";
import { xpubAtom } from "./state/atoms";
import DoAccountDiscovery from "./utils/AccountDiscovery";
// import ComposeTransaction from "./utils/ComposeTransaction";
// import FindPendingTxs from "./utils/FindPendingTxs";
// import GetUtxos from "./utils/GetUtxos";
import PendingTransactions from "./utils/PendingTransactions";
// import SignTransaction from "./utils/SignTransaction";
// import { pendingTransactionsDummyData } from "./utils/tests/data/pendingTransactionDummy";
import { useEffect } from "react";
import { pendingTransactionsAtom } from "./state/atoms";
// import { pendingTransactionsDummyData } from "./utils/tests/data/pendingTransactionDummy";

function App() {
  const [xpub] = useAtom(xpubAtom);
  const [pendingTransactions] = useAtom(pendingTransactionsAtom);
  // const pendingTransactions = pendingTransactionsDummyData;

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
      style={{ backgroundColor: "#212120", color: "white", minHeight: "100vh" }}
    >
      {xpub ? (
        <div>
          <b>Coiner</b>
          <BubbleChart />
        </div>
      ) : (
        <></>
      )}

      <DoAccountDiscovery />

      <div>
        <PendingTransactions pendingTransactions={pendingTransactions} />
      </div>
    </div>
  );
}

export default App;
