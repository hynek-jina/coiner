import BubbleChart from "./components/BubbleChart";
import ComposeTransaction from "./utils/ComposeTransaction";
import FindPendingTxs from "./utils/FindPendingTxs";
import GetUtxos from "./utils/GetUtxos";
import MergeDiscoveredTransactions from "./utils/MergeDiscoveredTransactions";
import SignTransaction from "./utils/SignTransaction";

function App() {
  return (
    <div>
      <div style={{ border: "2px solid blue" }}>
        <b>BubbleChart</b>
        <BubbleChart />
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
