import { AccountInfo, SignTransaction } from "@trezor/connect-web";
import { atom } from "jotai";
import {
  pathToAddressN,
  transformUtxoToInput,
} from "../utils/TransformDerivationPaths";

export interface Utxo {
  txid: string;
  vout: number;
  amount: number;
  blockHeight: number;
  address: string;
  path: string;
  confirmations: number;
  selected?: boolean;
}

export interface ChangeUtxo {
  address: string;
  path: string;
  transfers: number;
  balance: number;
  sent: number;
  received: number;
}

interface Targets {
  n: number;
  addresses: string[];
  isAddress: boolean;
  amount?: string;
}
interface Vin {
  txid: string;
  vout: number;
  sequence: number;
  n: number;
  addresses: string[];
  isAddress: boolean;
  isOwn: boolean;
  value: string;
  isAccountOwned: boolean;
}
interface Vout {
  value: string;
  n: number;
  hex: string;
  addresses: string[];
  isAddress: boolean;
  isOwn?: boolean;
  isAccountOwned?: boolean;
}

interface Details {
  vin: Vin[];
  vout: Vout[];
  size: number;
  totalInput: string;
  totalOutput: string;
}

interface PendingTransaction {
  type: string;
  txid: string;
  hex: string;
  blockTime: number;
  blockHeight: number;
  lockTime: number;
  amount: string;
  fee: string;
  vsize: number;
  feeRate: string;
  targets: Targets[];
  tokens: any[];
  internalTransfers: any[];
  rbf: boolean;
  details: Details;
}

export type PendingTransactions = PendingTransaction[];

export interface MempoolFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export const coinAtom = atom<string>("test");

export const pathAtom = atom<string>((get) => {
  const coin = get(coinAtom);
  return coin === "test" ? "m/84'/1'/0'/0/0" : "m/84'/0'/0'/0/0";
});

export const transactionTemplateAtom = atom<SignTransaction>({
  inputs: [],
  outputs: [],
  coin: "test",
  push: false,
  amountUnit: 3,
});

export const accountInfoAtom = atom<AccountInfo | null>(null);

export const utxoAtom = atom<Utxo[]>([
  {
    txid: "78650322334f23c5145782cd125a07de6527b5d3c26d0571b1b51e41759ea6ea",
    vout: 0,
    amount: 1638,
    blockHeight: 2585441,
    address: "tb1ql4w0l2836awduxgfe4egjgd0t4my8cgtdf9052",
    path: "m/84'/1'/0'/1/49",
    confirmations: 230740,
  },
  {
    txid: "78650322334f23c5145782cd125a07de6527b5d3c26d0571b1b51e41759ea6ea",
    vout: 1,
    amount: 10000,
    blockHeight: 2585441,
    address: "tb1qfv8mwtk7mu7rzf85pcupp0zuhhkwhd34vggj0l",
    path: "m/84'/1'/0'/0/50",
    confirmations: 230740,
  },
]);
// export const utxoAtom = atom<Utxo[]>((get) => {
//   const accountInfo = get(accountInfoAtom);
//   console.log("máme accountInfo? ", accountInfo);
//   console.log("a i utxo?", accountInfo?.utxo);
//   if (!accountInfo || !accountInfo.utxo) {
//     return [
//       {
//         txid: "78650322334f23c5145782cd125a07de6527b5d3c26d0571b1b51e41759ea6ea",
//         vout: 0,
//         amount: 1638,
//         blockHeight: 2585441,
//         address: "tb1ql4w0l2836awduxgfe4egjgd0t4my8cgtdf9052",
//         path: "m/84'/1'/0'/1/49",
//         confirmations: 230740,
//       },
//       {
//         txid: "78650322334f23c5145782cd125a07de6527b5d3c26d0571b1b51e41759ea6ea",
//         vout: 1,
//         amount: 10000,
//         blockHeight: 2585441,
//         address: "tb1qfv8mwtk7mu7rzf85pcupp0zuhhkwhd34vggj0l",
//         path: "m/84'/1'/0'/0/50",
//         confirmations: 230740,
//       },
//     ];
//   }

//   return accountInfo.utxo.map(
//     ({ txid, vout, amount, blockHeight, address, path, confirmations }) => ({
//       txid,
//       vout: Number(vout),
//       amount: Number(amount),
//       blockHeight: Number(blockHeight),
//       address,
//       path,
//       confirmations: Number(confirmations),
//     })
//   );
// });

export const pendingTransactionsAtom = atom<PendingTransactions>((get) => {
  const accountInfo = get(accountInfoAtom);

  return (
    (accountInfo?.history.transactions
      ?.filter((transaction) => transaction.blockHeight === -1)
      .map((transaction) => ({
        ...transaction,
        blockTime: transaction.blockTime ?? 0, // Ensure blockTime is a number
        amount: transaction.amount.toString(), // Ensure amount is a string
        fee: transaction.fee.toString(), // Ensure fee is a string
        feeRate: transaction.feeRate?.toString(), // Ensure feeRate is a string
      })) as PendingTransaction[]) || []
  );
});

// Very simplified. In reality, the weight depends on script type and other factors.
const UTXO_WEIGHT = 72; // weight of each UTXO
const HEADER_WEIGHT = 10.5; // weight of the header
const OUTPUT_WEIGHT = 36; // weight of the output

export const transactionDataAtom = atom((get) => {
  const utxos = get(utxoAtom);
  const unusedChangeUtxo = get(unusedChangeUtxoAtom);
  const currentTransactionData = get(transactionTemplateAtom);
  const feeRate = get(mempoolFeesAtom).economyFee;

  const inputs = utxos
    .filter((utxo) => utxo.selected)
    .map((utxo) => transformUtxoToInput(utxo));
  const inputAmounts = inputs.reduce(
    (total, input) => total + Number(input.amount),
    0
  );
  const outputs = unusedChangeUtxo[0]
    ? [
        {
          address_n: pathToAddressN(unusedChangeUtxo[0].path),
          amount:
            inputAmounts -
            Math.round(
              (inputs.length * UTXO_WEIGHT +
                1 * OUTPUT_WEIGHT +
                HEADER_WEIGHT) *
                feeRate // currently assuming only one output
            ),
          script_type: "PAYTOWITNESS" as const,
        },
      ]
    : [];

  return {
    ...currentTransactionData,
    inputs,
    outputs,
  };
});

export const changeUtxoAtom = atom<ChangeUtxo[]>([]);

export const unusedChangeUtxoAtom = atom<ChangeUtxo[]>((get) => {
  const changeUtxos = get(changeUtxoAtom);
  return changeUtxos.filter((utxo) => utxo.transfers === 0);
});

export const totalAmountAtom = atom((get) => {
  const utxos = get(utxoAtom);
  return utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
});

export const xpubAtom = atom<string>("");

export const mempoolFeesAtom = atom<MempoolFees>({
  fastestFee: 0,
  halfHourFee: 0,
  hourFee: 0,
  economyFee: 0,
  minimumFee: 0,
});

export const availableBalanceAtom = atom((get) => {
  const totalAmount = get(totalAmountAtom);
  const utxos = get(utxoAtom);
  const fees = get(mempoolFeesAtom);

  const totalFee =
    utxos.length *
    (UTXO_WEIGHT + HEADER_WEIGHT + OUTPUT_WEIGHT) *
    fees.fastestFee;

  return totalAmount - totalFee;
});
