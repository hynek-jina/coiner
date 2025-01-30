import TrezorConnect, { SignTransaction } from "@trezor/connect-web";
import { useAtomValue } from "jotai";
import React from "react";
import {
  mergedTransactionsStatsAtom,
  pendingTransactionsStatsAtom,
} from "../state/atoms";
import "./PendingTransactions.css";

interface SignTransactionWithTrezorProps {
  toBeSignedTransaction: SignTransaction;
}

const SignTransactionWithTrezor: React.FC<SignTransactionWithTrezorProps> = ({
  toBeSignedTransaction,
}) => {
  const pendingTransactionsStats = useAtomValue(pendingTransactionsStatsAtom);
  const mergedTransactionsStats = useAtomValue(mergedTransactionsStatsAtom);
  const calculatedSavings =
    pendingTransactionsStats.yourFee - mergedTransactionsStats.yourFee;

  const handleTrezorButtonClick = async () => {
    const signResult = await TrezorConnect.signTransaction(
      toBeSignedTransaction
    );
    console.log("signResult: ", signResult);
  };

  return (
    <>
      {toBeSignedTransaction && (
        <button
          className="button primary-button"
          onClick={handleTrezorButtonClick}
        >
          Save {calculatedSavings} sats
        </button>
      )}
    </>
  );
};

export default SignTransactionWithTrezor;
