import { PROTO } from "@trezor/connect-web";
import { ChangeUtxo, Utxo } from "../state/atoms";

// Convert path to address_n
// ie "m/84'/1'/0'/1/50" => [2147483732, 2147483649, 2147483648, 1, 50]
export function pathToAddressN(path: string): number[] {
  return path
    .split("/")
    .slice(1) // remove 'm'
    .map((part) => {
      const hardened = part.endsWith("'");
      const index = parseInt(part);
      return hardened ? index + 0x80000000 : index;
    });
}

export function transformUtxoToInput(utxo: Utxo): PROTO.TxInputType {
  return {
    address_n: pathToAddressN(utxo.path),
    prev_index: utxo.vout,
    prev_hash: utxo.txid,
    amount: utxo.amount,
    script_type: "SPENDWITNESS",
    sequence: 4294967295,
  };
}

export function transformUnusedChangeUtxoToOutput(
  unusedChangeUtxo: ChangeUtxo
): PROTO.TxOutputType {
  return {
    address_n: pathToAddressN(unusedChangeUtxo.path),
    amount: 10000,
    script_type: "PAYTOWITNESS",
  };
}
