import TrezorConnect from "@trezor/connect-web";
import { useAtomValue } from "jotai";
import { transactionDataAtom } from "../state/atoms";

const SignTransaction = () => {
  const transactionData = useAtomValue(transactionDataAtom);

  const handleTrezorButtonClick = async () => {
    const signResult = await TrezorConnect.signTransaction(transactionData);
    console.log("signResult: ", signResult);
  };

  return (
    <>
      <label>Sign transaction:</label>
      <button onClick={handleTrezorButtonClick}>
        Sign Transaction with Trezor
      </button>
      Transaction data:
      <div>{JSON.stringify(transactionData)}</div>
    </>
  );
};

export default SignTransaction;
