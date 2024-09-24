import TrezorConnect, { AccountInfo } from "@trezor/connect-web";
import { useAtom, useSetAtom } from "jotai";
import { accountInfoAtom, Utxo, utxoAtom, xpubAtom } from "../state/atoms";

const DoAccountDiscovery = () => {
  const path = "m/84'/1'/0'";
  const [xpub, setXpub] = useAtom(xpubAtom);
  const setAccountInfo = useSetAtom(accountInfoAtom);
  const [utxos, setUtxos] = useAtom(utxoAtom);

  const mapInitialUtxoAtom = (accountInfo: AccountInfo): Utxo[] | null => {
    if (!accountInfo || !accountInfo.utxo) {
      return null;
    }
    return accountInfo.utxo.map(
      ({ txid, vout, amount, blockHeight, address, path, confirmations }) => ({
        txid,
        vout: Number(vout),
        amount: Number(amount),
        blockHeight: Number(blockHeight),
        address,
        path,
        confirmations: Number(confirmations),
      })
    );
  };

  const handleTrezorButtonClick = async () => {
    try {
      const receivedPublicKey = await TrezorConnect.getPublicKey({
        path: path,
        coin: "test",
      });

      if (receivedPublicKey.success && receivedPublicKey.payload.xpubSegwit) {
        console.log(receivedPublicKey);
        const xpub = receivedPublicKey.payload.xpubSegwit;
        setXpub(xpub);

        const discovery = await TrezorConnect.getAccountInfo({
          descriptor: xpub,
          coin: "test",
          details: "txs", //"txids",
        });
        if (discovery.success) {
          setAccountInfo(discovery.payload);
          console.log("accountInfo: ", discovery.payload);
          const initialUtxoSet = mapInitialUtxoAtom(discovery.payload);

          if (initialUtxoSet) {
            setUtxos(initialUtxoSet);
            console.log("utxos: ", utxos);
          }
        }

        console.log("discovery: ", discovery);
      } else {
        console.error("Failed to get public key:", receivedPublicKey);
      }
    } catch (error) {
      console.error("Error during account discovery:", error);
    }
  };

  return (
    <>
      <div>
        Account path: {path}
        Account xpub: {xpub}
        <button onClick={handleTrezorButtonClick}>Account Discovery</button>
      </div>
    </>
  );
};

export default DoAccountDiscovery;
