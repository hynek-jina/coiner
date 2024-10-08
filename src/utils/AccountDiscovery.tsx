import TrezorConnect, { AccountInfo } from "@trezor/connect-web";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import trezorImage from "../images/TS5.png";
import {
  accountInfoAtom,
  coinAtom,
  pathAtom,
  Utxo,
  utxoAtom,
  xpubAtom,
} from "../state/atoms";
import { Button, ButtonLink, PageContainer } from "../theme";
import "./AccountDiscovery.css";

export const getXpub = async (path: string, coin: string): Promise<string> => {
  const receivedPublicKey = await TrezorConnect.getPublicKey({
    path: path,
    coin: coin,
  });
  if (receivedPublicKey.success && receivedPublicKey.payload.xpubSegwit) {
    console.log(receivedPublicKey);
    return receivedPublicKey.payload.xpubSegwit;
  } else {
    return "";
  }
};

export const getAccountInfo = async (
  xpub: string,
  coin: string
): Promise<AccountInfo | null> => {
  const discovery = await TrezorConnect.getAccountInfo({
    descriptor: xpub,
    coin: coin,
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
  const [utxos, setUtxos] = useAtom(utxoAtom);
  const setAccountInfo = useSetAtom(accountInfoAtom);
  const coin = useAtomValue(coinAtom);
  // const path = "m/84'/1'/0'";
  const path = useAtomValue(pathAtom);

  const handleCompleteDiscovery = async () => {
    try {
      const receivedXpub = await getXpub(path, coin);
      setXpub(receivedXpub);

      if (receivedXpub) {
        const accountInfo = await getAccountInfo(xpub, coin);
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
    // setXpub(
    //   "vpub5Z1dr7Tk5iB1HP9Vtz3jM3an1eFnigrQxyLHnG1casbNCrTWrqLfdoFjr11q3xe3nGnrGezcZQCxusZAWWC4drqVWqaskuAEjnQVAN5YVRk"
    // );
    const accountInfo = await getAccountInfo(xpub, coin);
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
      <PageContainer>
        {!xpub && (
          <div>
            <h2>Discover your coins</h2>
            <p>
              At first you need to connect your Trezor. Then click on the button
              below
            </p>
            <Button onClick={handleCompleteDiscovery}>
              🔍 Discover Your Coins
            </Button>

            <p>
              If you don't have a Trezor yet, order one{" "}
              <a href="https://affil.trezor.io/SHcK" className="link">
                here
              </a>
              .
            </p>
            <img src={trezorImage} alt="Trezor Safe 5" />
          </div>
        )}
        {xpub && (
          <ButtonLink onClick={handleDiscoveryWithoutTrezor}>
            ⟳ Refresh Data
          </ButtonLink>
        )}
      </PageContainer>
    </>
  );
};

export default DoAccountDiscovery;
