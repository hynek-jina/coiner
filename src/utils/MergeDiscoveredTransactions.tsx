import { PendingTransactions } from "../state/atoms";

const MergeDiscoveredTransactions = () => {
  // const [buttonOutput, setButtonOutput] = useState("");

  const handleButtonClick = async () => {
    const originalData: PendingTransactions = [
      {
        type: "sent",
        txid: "9f0006d32bd6590a2dfe9c44918bd0f7631d3444eda045defa7b81ce50e9ff59",
        hex: "01000000000101583fccf0862ac468eb2600e9704331bdebce2a1c087517d74c5702de732fd85b0100000000fdffffff02a0860100000000002251209b9e3733012d68ee1cf8312923990474ca2b3eb9e0474a7ba03806f53f82309dfb4ef100000000001600142a8d2ad02106656b798ae4c717b40457b3b6068402483045022100c50b15d3af71339d07c9acfee5ee43f66ee5163aafaf1ad7c13b796ba69d45a6022034fa37a809ec265c410f8cb10868cb52005b7d967ca9a71b984e7972a767e524012103bea4c23410490337d57151edc92a0f5f1dc8aaaca0c6ca244d4cae968ab04cce00000000",
        blockTime: 1717760591,
        blockHeight: -1,
        amount: "100000",
        fee: "15300",
        vsize: 153,
        feeRate: "100",
        targets: [
          {
            n: 0,
            addresses: [
              "tb1pnw0rwvcp945wu88cxy5j8xgywn9zk04eupr557aq8qr020uzxzwsml256v",
            ],
            isAddress: true,
            amount: "100000",
          },
        ],
        tokens: [],
        internalTransfers: [],
        rbf: true,
        details: {
          vin: [
            {
              txid: "5bd82f73de02574cd71775081c2aceebbd314370e90026eb68c42a86f0cc3f58",
              vout: 1,
              sequence: 4294967293,
              n: 0,
              addresses: ["tb1qsgc4av8rxez56935467q7kfj3e2fcx4swzs8f4"],
              isAddress: true,
              isOwn: true,
              value: "15929695",
              isAccountOwned: true,
            },
          ],
          vout: [
            {
              value: "100000",
              n: 0,
              hex: "51209b9e3733012d68ee1cf8312923990474ca2b3eb9e0474a7ba03806f53f82309d",
              addresses: [
                "tb1pnw0rwvcp945wu88cxy5j8xgywn9zk04eupr557aq8qr020uzxzwsml256v",
              ],
              isAddress: true,
            },
            {
              value: "15814395",
              n: 1,
              hex: "00142a8d2ad02106656b798ae4c717b40457b3b60684",
              addresses: ["tb1q92xj45ppqejkk7v2unr30dqy27emvp5yh8ru2m"],
              isAddress: true,
              isOwn: true,
              isAccountOwned: true,
            },
          ],
          size: 235,
          totalInput: "15929695",
          totalOutput: "15914395",
        },
      },
      {
        type: "sent",
        txid: "Edited 2nd transaction id",
        hex: "01000000000101583fccf0862ac468eb2600e9704331bdebce2a1c087517d74c5702de732fd85b0100000000fdffffff02a0860100000000002251209b9e3733012d68ee1cf8312923990474ca2b3eb9e0474a7ba03806f53f82309dfb4ef100000000001600142a8d2ad02106656b798ae4c717b40457b3b6068402483045022100c50b15d3af71339d07c9acfee5ee43f66ee5163aafaf1ad7c13b796ba69d45a6022034fa37a809ec265c410f8cb10868cb52005b7d967ca9a71b984e7972a767e524012103bea4c23410490337d57151edc92a0f5f1dc8aaaca0c6ca244d4cae968ab04cce00000000",
        blockTime: 1717760591,
        blockHeight: -1,
        amount: "100000",
        fee: "15300",
        vsize: 153,
        feeRate: "100",
        targets: [
          {
            n: 0,
            addresses: [
              "tb1pnw0rwvcp945wu88cxy5j8xgywn9zk04eupr557aq8qr020uzxzwsml256v",
            ],
            isAddress: true,
            amount: "100000",
          },
        ],
        tokens: [],
        internalTransfers: [],
        rbf: true,
        details: {
          vin: [
            {
              txid: "9f0006d32bd6590a2dfe9c44918bd0f7631d3444eda045defa7b81ce50e9ff59",
              vout: 1,
              sequence: 4294967293,
              n: 0,
              addresses: ["tb1q92xj45ppqejkk7v2unr30dqy27emvp5yh8ru2m"],
              isAddress: true,
              isOwn: true,
              value: "15814395",
              isAccountOwned: true,
            },
          ],
          vout: [
            {
              value: "100000",
              n: 0,
              hex: "51209b9e3733012d68ee1cf8312923990474ca2b3eb9e0474a7ba03806f53f82309d",
              addresses: [
                "tb1pnw0rwvcp945wu88cxy5j8xgywn9zk04eupr557aq8qr020uzxzwsml256v",
              ],
              isAddress: true,
            },
            {
              value: "15814395",
              n: 1,
              hex: "00142a8d2ad02106656b798ae4c717b40457b3b60684",
              addresses: ["tb1q92xj45ppqejkk7v2unr30dqy27emvp5yh8ru2m"],
              isAddress: true,
              isOwn: true,
              isAccountOwned: true,
            },
          ],
          size: 235,
          totalInput: "15929695",
          totalOutput: "15914395",
        },
      },
    ];
    const keepSendOnly = originalData.filter(
      (transaction) => transaction.type === "sent"
    );
    const transformedData = keepSendOnly.flatMap((transaction) =>
      transaction.details.vin
        .map((input) => ({
          direction: "input",
          txid: input.txid,
          vout: input.vout,
          address: input.addresses[0],
          isOwn: input.isOwn ?? false,
        }))
        .concat(
          transaction.details.vout.map((output) => ({
            direction: "output",
            txid: transaction.txid,
            vout: output.n,
            address: output.addresses[0],
            isOwn: output.isOwn ?? false,
          }))
        )
    );

    console.log(transformedData);

    // Identify dependent transactions
    // For dependent transactions calculate effective fee rate
    // Collect max fee rate from independend pending send transactions and comapre it with effective fee rate of dependent transactions
    //-> Identify biggest fee rate
    const maxFeeRate = Math.max(
      ...keepSendOnly.map((transaction) => Number(transaction.feeRate))
    );

    console.log("maxFeeRate: ", maxFeeRate);

    const inputs = transformedData.filter((item) => item.direction === "input");
    const outputs = transformedData.filter(
      (item) => item.direction === "output"
    );

    const filteredInputs = inputs.filter(
      (input) =>
        !outputs.some(
          (output) => output.txid === input.txid && output.vout === input.vout
        )
    );

    const filteredOutputs = outputs.filter(
      (output) =>
        !inputs.some(
          (input) => input.txid === output.txid && input.vout === output.vout
        )
    );

    const filteredData = [...filteredInputs, ...filteredOutputs];
    console.log(filteredData);

    // merge own outputs
    //calculta vsize
    // enhance output amount according to required fee rate
    // build transaction
    // sign transaction
  };

  return (
    <>
      <div>
        <p>Log merge of transactions</p>
        <button onClick={handleButtonClick}>merge pending</button>

        {/* <div>{buttonOutput}</div> */}
      </div>
    </>
  );
};

export default MergeDiscoveredTransactions;
