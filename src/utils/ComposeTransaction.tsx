import TrezorConnect from "@trezor/connect-web";

const data = {
  outputs: [
    { amount: "6000", address: "tb1qk7z7kmavt4aqjs272rc5f8dzp78mzacexs46gn" },
  ],
  coin: "test",
  account: {
    path: "m/84'/1'/0'",
    addresses: {
      used: [
        //adresy, na které byly poslány transakce - proč to tady je?
        {
          address: "tb1qfv8mwtk7mu7rzf85pcupp0zuhhkwhd34vggj0l",
          path: "m/84'/1'/0'/0/50",
          transfers: 1,
        },
      ],
      unused: [
        {
          // nepoužité receive adresy
          address: "tb1q92xj45ppqejkk7v2unr30dqy27emvp5yh8ru2m",
          path: "m/84'/1'/0'/1/50",
          transfers: 0,
        },
      ],
      change: [
        {
          // nepoužité change adresy
          address: "tb1q92xj45ppqejkk7v2unr30dqy27emvp5yh8ru2m",
          path: "m/84'/1'/0'/1/50",
          transfers: 0,
        },
      ],
    },
    // txid":"78650322334f23c5145782cd125a07de6527b5d3c26d0571b1b51e41759ea6ea","vout":1,"amount":"10000","blockHeight":2585441,"address":"tb1qfv8mwtk7mu7rzf85pcupp0zuhhkwhd34vggj0l","path":"m/84'/1'/0'/0/50","confirmations":232595},
    utxo: [
      {
        txid: "78650322334f23c5145782cd125a07de6527b5d3c26d0571b1b51e41759ea6ea",
        vout: 1,
        amount: "10000",
        blockHeight: 2585441,
        address: "tb1qfv8mwtk7mu7rzf85pcupp0zuhhkwhd34vggj0l",
        path: "m/84'/1'/0'/0/50",
        confirmations: 232595,
      },
    ],
  },
  feeLevels: [{ feePerUnit: "1" }, { feePerUnit: "10" }],
};

const ComposeTransaction = () => {
  const handleTrezorButtonClick = async () => {
    console.log("data: ", data);
    const composeResult = await TrezorConnect.composeTransaction(data);
    console.log("composeResult: ", composeResult);
  };

  return (
    <>
      <label>Compose transaction:</label>
      <button onClick={handleTrezorButtonClick}>Compose Transaction</button>
      {/* <div>{JSON.stringify(payload)}</div> */}
    </>
  );
};

export default ComposeTransaction;
