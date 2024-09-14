import { MempoolFees } from "../state/atoms";
export async function fetchMempoolFees(): Promise<MempoolFees> {
  try {
    const response = await fetch(
      "https://mempool.space/testnet/api/v1/fees/recommended"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("fees: ", data);
    return data;
  } catch (error) {
    throw new Error(`API call error: ${(error as any).message}`);
  }
}
