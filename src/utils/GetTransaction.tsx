import mempoolJS from "@mempool/mempool.js";

const GetTransaction = async (txid: string, network: string) => {
  try {
    const {
      bitcoin: { transactions },
    } = mempoolJS({
      hostname: "mempool.space",
      network,
    });
    const tx = await transactions.getTx({ txid });
    return tx;
  } catch (error) {
    console.error(error);
  }
};

export default GetTransaction;
