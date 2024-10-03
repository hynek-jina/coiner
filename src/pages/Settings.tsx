import { useAtom } from "jotai";
import { coinAtom } from "../state/atoms";
import { Button, PageContainer, Row } from "../theme";
import "./Settings.css";

const Settings = () => {
  const [coin, setCoin] = useAtom(coinAtom);

  return (
    <PageContainer>
      <div>
        <h2>Settings</h2>
        {coin === "test" ? (
          <Row>
            <span>You are using testnet</span>
            <Button onClick={() => setCoin("btc")}>Switch to Bitcoin</Button>
          </Row>
        ) : (
          <Row>
            <p>You are using bitcoin</p>
            <Button onClick={() => setCoin("test")}>Switch to Testnet</Button>
          </Row>
        )}
      </div>
    </PageContainer>
  );
};

export default Settings;
