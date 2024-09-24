import TrezorConnect from "@trezor/connect-web";
import { useAtom } from "jotai";
import { accountInfoAtom, xpubAtom } from "../state/atoms";

const DoAccountDiscovery = () => {
  const path = "m/84'/1'/0'";
  const [xpub, setXpub] = useAtom(xpubAtom);
  const [accountInfo, setAccountInfo] = useAtom(accountInfoAtom);

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
          console.log("accountInto:", accountInfo);
        }

        console.log(discovery);
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
