import { mergeDiscoveredTransactions } from "../MergeDiscoveredTransactions";
import { accountInfoDummyData } from "./data/accountInfoDummy";
import { pendingTransactionsDummyData } from "./data/pendingTransactionDummy";
import { toBeSignedDummy } from "./data/toBeSignedDummy";

describe("Merge of Pending transactions", () => {
  it("Do the proper merge of pending transactions", () => {
    const toBeSignedData = mergeDiscoveredTransactions(
      accountInfoDummyData,
      pendingTransactionsDummyData
    );
    expect(toBeSignedData).toEqual(toBeSignedDummy);
  });
});
