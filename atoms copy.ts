// import { selectAtom } from "jotai/utils";
// import { type RecordApi } from "../api";
// import { atomWithMMKV } from "../utils/atomWithMMKV";
// import fetchAdminKey from "../utils/fetchAdminKey";
// import parseLnbitsUrl from "../utils/parseLnbitsUrl";

// interface UserInfo {
//   domain: string;
//   user: string;
//   wallet: string;
// }

// export const lnbitsUrlAtom = atomWithMMKV<string | null>("lnbitsurl", null);

// export const userInfoAtom = selectAtom(
//   lnbitsUrlAtom,
//   (lnbitsUrl): UserInfo | null => {
//     if (!lnbitsUrl) return null;
//     return parseLnbitsUrl(lnbitsUrl);
//   }
// );

// export const adminKeyAtom = selectAtom(
//   lnbitsUrlAtom,
//   async (lnbitsUrl): Promise<string | null> => {
//     if (!lnbitsUrl) return null;
//     const adminKey = await fetchAdminKey(lnbitsUrl);
//     return adminKey;
//   }
// );
// export const balanceAtom = atomWithMMKV("balance", 0);
// export const recordsAtom = atomWithMMKV("records", { records: [] } as {
//   records: RecordApi[];
// });
// export const filteredRecordsAtom = selectAtom(recordsAtom, (records) => {
//   const filteredRecords = records.records.filter(
//     (record) => record.uses - record.used >= 1
//   );
//   return filteredRecords;
// });
// export const allLotesValueAtom = selectAtom(filteredRecordsAtom, (records) => {
//   const totalAmount = records.reduce(
//     (sum: number, record: RecordApi) => sum + record.max_withdrawable,
//     0
//   );
//   return totalAmount;
// });

// export const refreshCounterAtom = atomWithMMKV("refreshCounter", 0);
// export const isFetchingAtom = atomWithMMKV("isFetching", false);
// export const lastFetchedAtom = atomWithMMKV("lastFetched", "");
// export const loteAmountAtom = atomWithMMKV("loteAmount", 0);
// export const nfcModalVisibilityAtom = atomWithMMKV("nfcModalVisibility", false);
// export const nfcModalMessageAtom = atomWithMMKV(
//   "nfcModalMessage",
//   "Scan the Lote"
// );
