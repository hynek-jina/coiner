import { useAtomValue } from "jotai";
import {
  mergedTransactionsStatsAtom,
  pendingTransactionsStatsAtom,
} from "../state/atoms";

const ComparissonTable = () => {
  const pendingTransactionsStats = useAtomValue(pendingTransactionsStatsAtom);
  const mergedTransactionsStats = useAtomValue(mergedTransactionsStatsAtom);

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Separé transactions</th>
          <th>Merged into one</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total fee</td>
          <td>{pendingTransactionsStats.totalFee} sats</td>
          <td>{mergedTransactionsStats.totalFee} sats</td>
        </tr>
        <tr>
          <td>Your fee</td>
          <td>{pendingTransactionsStats.yourFee} sats</td>
          <td>{mergedTransactionsStats.yourFee} sats</td>
        </tr>
        <tr>
          <td>Total vSize</td>
          <td>{pendingTransactionsStats.totalVsize} vB</td>
          <td>{mergedTransactionsStats.totalVsize} vB</td>
        </tr>
        <tr>
          <td>Average Fee Rate</td>
          <td>{pendingTransactionsStats.averageFeeRate} sat/vB</td>
          <td>{mergedTransactionsStats.averageFeeRate} sat/vB</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ComparissonTable;
