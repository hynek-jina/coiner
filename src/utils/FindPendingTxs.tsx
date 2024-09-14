import TrezorConnect from "@trezor/connect-web";
import { useState } from "react";

const FindPendingTxs = () => {
  const [buttonOutput, setButtonOutput] = useState("");

  const handleTrezorButtonClick = async () => {
    try {
      const discovery = await TrezorConnect.getAccountInfo({
        // path: "m/84'/1'/0'",
        descriptor:
          "vpub5Z1dr7Tk5iB1HP9Vtz3jM3an1eFnigrQxyLHnG1casbNCrTWrqLfdoFjr11q3xe3nGnrGezcZQCxusZAWWC4drqVWqaskuAEjnQVAN5YVRk",
        coin: "test",
        details: "txs", //"txids",
      });

      if (discovery.success && discovery.payload.history.transactions) {
        const filteredTransactions =
          discovery.payload.history.transactions.filter(
            (transaction) => transaction.blockHeight === -1
          );
        setButtonOutput(JSON.stringify(filteredTransactions));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div>
        <p>Pending transactions</p>
        <button onClick={handleTrezorButtonClick}>
          Update Pending Transactions
        </button>

        <div>{buttonOutput}</div>
      </div>
    </>
  );
};

export default FindPendingTxs;
