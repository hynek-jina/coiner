import TrezorConnect from "@trezor/connect-web";
// import { useState } from "react";

const FindTxs = () => {
  // const [buttonOutput, setButtonOutput] = useState("");

  const handleTrezorButtonClick = async () => {
    try {
      const getTransactions = await TrezorConnect.blockchainGetTransactions({
        coin: "test",
        txs: [
          "9f0006d32bd6590a2dfe9c44918bd0f7631d3444eda045defa7b81ce50e9ff59",
        ],
      });
      console.log("getTransactions: ", getTransactions);
    } catch (error) {
      console.error(error);
    }
  };

  return handleTrezorButtonClick();
  // <>
  //   <div>
  //     <p>Pending transactions</p>
  //     <button onClick={handleTrezorButtonClick}>
  //       Update Pending Transactions
  //     </button>

  //     <div>{buttonOutput}</div>
  //   </div>
  // </>
};

export default FindTxs;
