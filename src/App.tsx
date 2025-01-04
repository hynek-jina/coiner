import TrezorConnect from "@trezor/connect-web";
// import ComposeTransaction from "./utils/ComposeTransaction";
// import FindPendingTxs from "./utils/FindPendingTxs";
// import GetUtxos from "./utils/GetUtxos";
// import SignTransaction from "./utils/SignTransaction";
// import { pendingTransactionsDummyData } from "./utils/tests/data/pendingTransactionDummy";
import { useEffect } from "react";
// import { pendingTransactionsAtom } from "./state/atoms";
// import { pendingTransactionsDummyData } from "./utils/tests/data/pendingTransactionDummy";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
// import { filterTransactionsByType } from "./utils/MergeDiscoveredTransactions";
import process from "process";
import Coins from "./pages/Coins";
import Experimental from "./pages/Experimental";
import Settings from "./pages/Settings";

window.process = process;

function App() {
  // const [xpub] = useAtom(xpubAtom);
  // const [pendingTransactions] = useAtom(pendingTransactionsAtom);
  // const sendOnly = filterTransactionsByType(pendingTransactions, "sent");
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
      <Router>
        <Navbar />
        <div style={{ paddingTop: "4rem" }}>
          <Routes>
            <Route path="/" element={<Coins />} />
            <Route path="/experimental" element={<Experimental />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
