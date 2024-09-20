import { PendingTransactions } from "../../state/atoms";
import {
  filterOwnOutputs,
  filterTransactionsByType,
  mergeChangeAddresses,
  transformTransactionsData,
} from "../MergeDiscoveredTransactions";

export const PendingTransactionTestData: PendingTransactions = [
  {
    type: "sent",
    txid: "63095944964a30d0cd3fca093456e544411e2103d99325ed65e6cc400bd5b3b3",
    hex: "0200000000010153e20ead4d02a8f09921429dfe5f706a06fde4b146ba4879dbeb787679f1aa8a0100000000fdffffff0240420f000000000016001472492df26d17ddea589d7bb3d92a4cad3df47f5bd4501e0000000000160014920f1acf6f95ccc6c0ea00671304553ef242602d024730440220326af4060645789c6b0f35a8307364bdcafc68f1bcf9cc4d8b9c3663159f2a48022078f79c85a648c5b511fbdd1cf9b0ef7e10d45c25674981ecb40f5fa1128b056701210262dd05e41b05b4ea1263d8f3a375e51b4a2814dc01b5f08cee8ca33ce308b423b43b2d00",
    blockTime: 1726822029,
    blockHeight: -1,
    lockTime: 2964404,
    amount: "1000000",
    fee: "141",
    vsize: 141,
    feeRate: "1",
    targets: [
      {
        n: 0,
        addresses: ["tb1qwfyjmundzlw75kya0weaj2jv457lgl6mrd45mj"],
        isAddress: true,
        amount: "1000000",
      },
    ],
    tokens: [],
    internalTransfers: [],
    rbf: true,
    details: {
      vin: [
        {
          txid: "8aaaf1797678ebdb7948ba46b1e4fd066a705ffe9d422199f0a8024dad0ee253",
          vout: 1,
          sequence: 4294967293,
          n: 0,
          addresses: ["tb1qg3hcnjc0hm9qam6h3tkzmqnmfwwg597483wa93"],
          isAddress: true,
          isOwn: true,
          value: "2986913",
          isAccountOwned: true,
        },
      ],
      vout: [
        {
          value: "1000000",
          n: 0,
          hex: "001472492df26d17ddea589d7bb3d92a4cad3df47f5b",
          addresses: ["tb1qwfyjmundzlw75kya0weaj2jv457lgl6mrd45mj"],
          isAddress: true,
        },
        {
          value: "1986772",
          n: 1,
          hex: "0014920f1acf6f95ccc6c0ea00671304553ef242602d",
          addresses: ["tb1qjg834nm0jhxvds82qpn3xpz48meyycpd2qca7h"],
          isAddress: true,
          isOwn: true,
          isAccountOwned: true,
        },
      ],
      size: 222,
      totalInput: "2986913",
      totalOutput: "2986772",
    },
  },
  {
    type: "sent",
    txid: "58a5cf69d34ce82c98776a64cc64b7020182bf26e1178b7e59709b48b8e9b8ac",
    hex: "02000000000101510721769d1d0ea4aef61cb5e940d90764664f05ad2f1735934ae8b01a9d99540100000000fdffffff0240420f0000000000160014202f722bbb22b82dd17796dcc24800fd5d9da67b021d7d0000000000160014920f1acf6f95ccc6c0ea00671304553ef242602d0247304402200ea622a33e5e0550f22d465cbe4e3fee2d943e92cc824681fc0c1e7efadf9630022078e3b71dbd795a1919bdb7e44402803fe4172b226faaca51d834e243f209e87a012103a6f4721b7fc7e005966fa589d573126a3c297ad1f37dad63920aec1ba2df21d6c23b2d00",
    blockTime: 1726822029,
    blockHeight: -1,
    lockTime: 2964418,
    amount: "1000000",
    fee: "141",
    vsize: 141,
    feeRate: "1",
    targets: [
      {
        n: 0,
        addresses: ["tb1qyqhhy2amy2uzm5thjmwvyjqql4wemfnmsuu355"],
        isAddress: true,
        amount: "1000000",
      },
    ],
    tokens: [],
    internalTransfers: [],
    rbf: true,
    details: {
      vin: [
        {
          txid: "54999d1ab0e84a9335172fad054f666407d940e9b51cf6aea40e1d9d76210751",
          vout: 1,
          sequence: 4294967293,
          n: 0,
          addresses: ["tb1qcz6fzph265ma3k3s6ljysr02ggq6yf3z2ca3kg"],
          isAddress: true,
          isOwn: true,
          value: "9199567",
          isAccountOwned: true,
        },
      ],
      vout: [
        {
          value: "1000000",
          n: 0,
          hex: "0014202f722bbb22b82dd17796dcc24800fd5d9da67b",
          addresses: ["tb1qyqhhy2amy2uzm5thjmwvyjqql4wemfnmsuu355"],
          isAddress: true,
        },
        {
          value: "8199426",
          n: 1,
          hex: "0014920f1acf6f95ccc6c0ea00671304553ef242602d",
          addresses: ["tb1qjg834nm0jhxvds82qpn3xpz48meyycpd2qca7h"],
          isAddress: true,
          isOwn: true,
          isAccountOwned: true,
        },
      ],
      size: 222,
      totalInput: "9199567",
      totalOutput: "9199426",
    },
  },
];

const keepSendOnly = () =>
  filterTransactionsByType(PendingTransactionTestData, "sent");

describe("Transform transaction Data", () => {
  it("should filter sent transactions", () => {
    expect(transformTransactionsData(keepSendOnly()).vsize).toBe(282);
  });
});

describe("Merge change addresses", () => {
  it("should merge change addresses", () => {
    const mergedChangeAddresses = mergeChangeAddresses(
      transformTransactionsData(keepSendOnly())
    );
    const changeAddresses = filterOwnOutputs(mergedChangeAddresses);
    const changeAmount = changeAddresses.reduce(
      (sum, output) => sum + Number(output.amount),
      0
    );
    expect([0, 1]).toContain(changeAddresses.length);
    expect(changeAmount).toBe(10_186_198);
  });
});
