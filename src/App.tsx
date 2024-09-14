import BubbleChart from "./components/BubbleChart";
import GetUtxos from "./utils/GetUtxos";

function App() {
  return (
    <div>
      <BubbleChart />
      {/* <MergeDiscoveredTransactions /> */}
      {/* <FindPendingTxs /> */}
      <GetUtxos />
      {/* <ComposeTransaction /> */}
      {/* <SignTransaction /> */}
    </div>
  );
}

export default App;
