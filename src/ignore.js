import TrezorConnect from "@trezor/connect-web";
import { useAtom } from "jotai";
import { useState } from "react";
import "./App.css";
import { transactionAtom } from "./state/atoms";
global.Buffer = Buffer;

TrezorConnect.init({
  lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
  manifest: {
    email: "developer@xyz.com",
    appUrl: "http://your.application.com",
  },
});

function App() {
  const [records, setRecords] = useState < string > "initial state";
  const [transaction, setTransaction] =
    useState < string > "no transaction prepared";
  const [testTransaction, setTestTransaction] = useAtom(transactionAtom);

  function addInput(input: any) {
    setTestTransaction((prevTransaction) => {
      const newInputs = [...prevTransaction.inputs, input];
      return {
        ...prevTransaction,
        inputs: newInputs,
        vsize: newInputs.length * 12, // TODO: calculate vsize
      };
    });
  }

  const newInput = {
    prevTxId: "abc", // TODO: link dynamic values
    index: 0,
    amount: 100,
    address: "address1",
  };

  const handleTrezorButtonClick = async () => {
    try {
      const discovery = await TrezorConnect.getAccountInfo({
        // path: "m/84'/1'/0'",
        descriptor:
          "vpub5Z1dr7Tk5iB1HP9Vtz3jM3an1eFnigrQxyLHnG1casbNCrTWrqLfdoFjr11q3xe3nGnrGezcZQCxusZAWWC4drqVWqaskuAEjnQVAN5YVRk",
        coin: "test",
        details: "txids",
      });

      if (discovery.success) {
        setRecords(JSON.stringify(discovery.payload));
      } else {
        console.error("Discovery error:", discovery.payload.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleComposeTransaction = async () => {
    const bitcoin = require("bitcoinjs-lib");
    const network = bitcoin.networks.testnet;
    const psbt = new bitcoin.Psbt({ network });

    let inputTxId =
      "78650322334f23c5145782cd125a07de6527b5d3c26d0571b1b51e41759ea6ea";
    let inputIndex = 1;
    let outputAddress = "tb1qk7z7kmavt4aqjs272rc5f8dzp78mzacexs46gn";
    let outputAmount = 8000;

    psbt.addInput({
      hash: inputTxId,
      index: inputIndex,
      // other options if needed
    });

    // Add outputs
    psbt.addOutput({
      address: outputAddress,
      value: outputAmount,
    });

    psbt.addOutput({
      address: outputAddress,
      value: outputAmount,
    });
  };

  return (
    <div className="App">
      <h1>Coiner</h1>
      <h2>Plain transaction builder - Testnet</h2>
      <li>Select inputs (transaction id and index)</li>
      <li>Select outputs (address and amount)</li>
      <li>generate unsigned transaction</li>
      <li>import this transaction into electrum to sign and broadcast</li>
      <div></div>
      <div>
        <button onClick={handleTrezorButtonClick}>
          List all transactions and UTXOs
        </button>
      </div>
      {records}

      <div>
        <button onClick={handleComposeTransaction}>Compose transaction</button>
      </div>
      {transaction}
      <div>
        <button onClick={() => addInput(newInput)}>Add input</button>
        <h3>Inputs:</h3>
        {testTransaction.inputs.map((input, index) => (
          <div key={index}>
            <p>PrevTxId: {input.prevTxId}</p>
            <p>Index: {input.index}</p>
            <p>Amount: {input.amount}</p>
            <p>Address: {input.address}</p>
          </div>
        ))}

        <h3>Outputs:</h3>
        {testTransaction.outputs.map((output, index) => (
          <div key={index}>
            <p>Address: {output.address}</p>
            <p>Amount: {output.amount}</p>
          </div>
        ))}

        <h3>Vsize:</h3>
        <p>{testTransaction.vsize}</p>
      </div>
    </div>
  );
}

export default App;
