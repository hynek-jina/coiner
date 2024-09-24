import TrezorConnect from "@trezor/connect-web";
import { useAtom, useAtomValue } from "jotai";
import {
  ChangeUtxo,
  accountInfoAtom,
  changeUtxoAtom,
  mempoolFeesAtom,
  pendingTransactionsAtom,
  unusedChangeUtxoAtom,
  // utxoAtom,
  xpubAtom,
} from "../state/atoms";
import { fetchMempoolFees } from "./GetMempoolFees";

// TrezorConnect.init({
//   lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
//   manifest: {
//     email: "developer@xyz.com",
//     appUrl: "http://your.application.com",
//   },
// });

const GetUtxos = () => {
  // const setUtxos = useSetAtom(utxoAtom);
  const [changeUtxos, setChangeUtxos] = useAtom(changeUtxoAtom);
  const [unusedChangeUtxos] = useAtom(unusedChangeUtxoAtom);
  const [xpub, setXpub] = useAtom(xpubAtom);
  const [accountInfo, setAccountInfo] = useAtom(accountInfoAtom);
  const [pendingTransactions] = useAtomValue(pendingTransactionsAtom);
  const [mempoolFees, setMempoolFees] = useAtom(mempoolFeesAtom);

  const getFees = async () => {
    const fees = await fetchMempoolFees();
    setMempoolFees(fees);
  };

  const handleTrezorButton2Click = async () => {
    try {
      const test = await TrezorConnect.blockchainGetTransactions({
        coin: "test",
        txs: [
          "9f0006d32bd6590a2dfe9c44918bd0f7631d3444eda045defa7b81ce50e9ff59",
        ],
      });
      console.log("test: ", test);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTrezorButtonClick = async () => {
    getFees();
    try {
      const discovery = await TrezorConnect.getAccountInfo({
        // path: "m/84'/1'/0'",
        descriptor: xpub,
        coin: "test",
        details: "txs", //"txids",
      });

      if (discovery.success) {
        setAccountInfo(discovery.payload);
        console.log("accountInfo: ", accountInfo);
        console.log(
          "pendingTransactions: ",
          accountInfo?.history.transactions?.filter(
            (transaction) => transaction.blockHeight === -1
          )
        );

        setChangeUtxos(
          (discovery.payload.addresses?.change?.map(
            ({ address, path, transfers, balance, sent, received }) => ({
              address,
              path,
              transfers,
              balance: balance as number | undefined,
              sent: sent as number | undefined,
              received: received as number | undefined,
            })
          ) as ChangeUtxo[]) || []
        );
        console.log("changeUtxos: ", changeUtxos);
        console.log("unusedChangeUtxos: ", unusedChangeUtxos);

        // const utxoData =
        //   discovery.payload.utxo?.map(
        //     (
        //       { txid, vout, amount, blockHeight, address, path, confirmations },
        //       index
        //     ) => ({
        //       txid,
        //       vout: Number(vout),
        //       amount: Number(amount),
        //       blockHeight: Number(blockHeight),
        //       address,
        //       path,
        //       confirmations: Number(confirmations),
        //     })
        //   ) ?? [];
        // setUtxos(utxoData);
      } else {
        console.error("Discovery error:", discovery.payload.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setXpub(event.target.value);
  };

  return (
    <>
      <div>
        <label>
          Xpub:
          <input type="text" value={xpub} onChange={handleInputChange} />
        </label>
        <button onClick={handleTrezorButtonClick}>Update UTXOs</button>
      </div>
      <div>Mining fees: {JSON.stringify(mempoolFees)}</div>
      <div>Change utxos:</div>
      <div>{JSON.stringify(changeUtxos)}</div>
      <div>Unused change utxos:</div>
      <div>{JSON.stringify(unusedChangeUtxos.flat())}</div>

      <div>Pending Transactions: {JSON.stringify(pendingTransactions)}</div>
      <button onClick={handleTrezorButton2Click}>
        Vypsat transakci do logu
      </button>
    </>
  );
};

export default GetUtxos;
