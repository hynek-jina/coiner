import TrezorConnect, { AccountInfo } from "@trezor/connect-web";
import { useAtom, useSetAtom } from "jotai";
import { accountInfoAtom, Utxo, utxoAtom, xpubAtom } from "../state/atoms";

export const getXpub = async (path: string): Promise<string> => {
  const receivedPublicKey = await TrezorConnect.getPublicKey({
    path: path,
    coin: "test",
  });
  if (receivedPublicKey.success && receivedPublicKey.payload.xpubSegwit) {
    console.log(receivedPublicKey);
    return receivedPublicKey.payload.xpubSegwit;
  } else {
    return "";
  }
};

export const getAccountInfo = async (
  xpub: string
): Promise<AccountInfo | null> => {
  const discovery = await TrezorConnect.getAccountInfo({
    descriptor: xpub,
    coin: "test",
    details: "txs", //"txids",
  });
  if (discovery.success) {
    console.log("accountInfo: ", discovery.payload);
    return discovery.payload;
  } else {
    return null;
  }
};

export const mapInitialUtxoAtom = (accountInfo: AccountInfo): Utxo[] | null => {
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

const DoAccountDiscovery = () => {
  const [xpub, setXpub] = useAtom(xpubAtom);
  const path = "m/84'/1'/0'";
  const setAccountInfo = useSetAtom(accountInfoAtom);
  const [utxos, setUtxos] = useAtom(utxoAtom);

  const handleCompleteDiscovery = async () => {
    try {
      const receivedXpub = await getXpub(path);
      setXpub(receivedXpub);

      if (receivedXpub) {
        const accountInfo = await getAccountInfo(xpub);
        if (accountInfo) {
          setAccountInfo(accountInfo);
          const initialUtxoSet = mapInitialUtxoAtom(accountInfo);
          if (initialUtxoSet) {
            setUtxos(initialUtxoSet);
            console.log("utxos: ", utxos);
          }
        }
      }
    } catch (error) {
      console.error("Error during account discovery:", error);
    }
  };

  const handleDiscoveryWithoutTrezor = async () => {
    setXpub(
      "vpub5Z1dr7Tk5iB1HP9Vtz3jM3an1eFnigrQxyLHnG1casbNCrTWrqLfdoFjr11q3xe3nGnrGezcZQCxusZAWWC4drqVWqaskuAEjnQVAN5YVRk"
    );
    const accountInfo = await getAccountInfo(xpub);
    if (accountInfo) {
      setAccountInfo(accountInfo);
      const initialUtxoSet = mapInitialUtxoAtom(accountInfo);
      if (initialUtxoSet) {
        setUtxos(initialUtxoSet);
        console.log("utxos: ", utxos);
      }
    }
  };

  return (
    <>
      <div>
        <button onClick={handleCompleteDiscovery}>
          🔍 Discover Your Coins
        </button>
        <button onClick={handleDiscoveryWithoutTrezor}>
          Fast discovery (without Trezor)
        </button>
      </div>
    </>
  );
};

export default DoAccountDiscovery;
