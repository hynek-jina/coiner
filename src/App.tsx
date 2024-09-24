import TrezorConnect from "@trezor/connect-web";
import BubbleChart from "./components/BubbleChart";
import DoAccountDiscovery from "./utils/AccountDiscovery";
import ComposeTransaction from "./utils/ComposeTransaction";
import FindPendingTxs from "./utils/FindPendingTxs";
import GetUtxos from "./utils/GetUtxos";
import MergeDiscoveredTransactions from "./utils/MergeDiscoveredTransactions";
import SignTransaction from "./utils/SignTransaction";

function App() {
  TrezorConnect.init({
    lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
    manifest: {
      email: "developer@xyz.com",
      appUrl: "http://your.application.com",
    },
  });

  return (
    <div>
      <div style={{ border: "2px solid blue" }}>
        <b>BubbleChart</b>
        <BubbleChart />
      </div>
      <div style={{ border: "2px solid blue" }}>
        <b>Account Discovery</b>
        <DoAccountDiscovery />
      </div>
      <div style={{ border: "2px solid blue" }}>
        <b>MergeDiscoveredTransactions</b>
        <MergeDiscoveredTransactions />
      </div>
      <div style={{ border: "2px solid blue" }}>
        <b>FindPendingTxs</b>
        <FindPendingTxs />
      </div>
      <div style={{ border: "2px solid blue" }}>
        <b>GetUtxos</b>
        <GetUtxos />
      </div>
      <div style={{ border: "2px solid blue" }}>
        <b>ComposeTransaction</b>
        <ComposeTransaction />
      </div>
      <div style={{ border: "2px solid blue" }}>
        <b>SignTransaction</b>
        <SignTransaction />
      </div>
    </div>
  );
}

export default App;
