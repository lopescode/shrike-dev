import * as fsPromises from "node:fs/promises";
import { TBalance } from "./types/TBalance";
import { TBalanceResult } from "./types/TBalanceResult";
import { base64ToNeo3Address } from "./helper/CryptoHelper";
import { ADDRESS_BASE_64, GAS_SCRIPT_HASH } from "./constants";

async function main() {
  const file = await fsPromises.readFile(
    `./src/output/balances-${ADDRESS_BASE_64}.json`
  );

  const balanceResult: TBalanceResult[] = [];

  const rows: TBalance[] = JSON.parse(file.toString());

  const groupedRows = rows.reduce((acc, row) => {
    if (!acc[row.tokenHash]) {
      acc[row.tokenHash] = [];
    }

    acc[row.tokenHash].push(row);

    return acc;
  }, {} as Record<string, TBalance[]>);

  const nonNativeAssets = Object.keys(groupedRows).filter(
    (tokenHash) => tokenHash !== GAS_SCRIPT_HASH
  );

  for (const tokenHash of nonNativeAssets) {
    const tokenRows = groupedRows[tokenHash];

    const balance = tokenRows.reduce(
      (acc, row) => {
        if (row.from === base64ToNeo3Address(ADDRESS_BASE_64)) {
          acc.balance -= Number(row.amount);
        }

        if (row.to === base64ToNeo3Address(ADDRESS_BASE_64)) {
          acc.balance += Number(row.amount);
        }

        return acc;
      },
      { tokenHash, balance: 0 }
    );

    balanceResult.push(balance);
  }

  const nativeAssets = Object.keys(groupedRows).filter(
    (tokenHash) => tokenHash === GAS_SCRIPT_HASH
  );

  // SUM GAS

  let gasBalance = 0;

  for (const tokenHash of nativeAssets) {
    const tokenRows = groupedRows[tokenHash];

    const GASBalance = tokenRows.reduce(
      (acc, row) => {
        if (row.from === base64ToNeo3Address(ADDRESS_BASE_64)) {
          acc.balance -= Number(row.amount);
        }

        if (row.to === base64ToNeo3Address(ADDRESS_BASE_64)) {
          acc.balance += Number(row.amount);
        }

        return acc;
      },
      { tokenHash, balance: 0 }
    );

    gasBalance += GASBalance.balance;
  }

  // DECREASING GAS
  const transactionsWhereImSender = rows.filter(
    (row) => row.sender === base64ToNeo3Address(ADDRESS_BASE_64)
  );

  const groupedTransactionsByScriptHash = transactionsWhereImSender.reduce(
    (acc, row) => {
      if (!acc[row.scriptHash]) {
        acc[row.scriptHash] = [];
      }

      acc[row.scriptHash].push(row);

      return acc;
    },
    {} as Record<string, TBalance[]>
  );

  console.log(groupedTransactionsByScriptHash);

  const transactionsFromScriptHash = Object.keys(
    groupedTransactionsByScriptHash
  ).map((scriptHash) => groupedTransactionsByScriptHash[scriptHash]);

  let fee = 0;

  transactionsFromScriptHash.forEach((transaction) => {
    fee += transaction[0].fee;
  });

  console.log({
    gasBalance,
    fee,
  });

  balanceResult.push({
    tokenHash: GAS_SCRIPT_HASH,
    balance: gasBalance - fee,
  });

  await fsPromises.writeFile(
    `./src/output/balance-result-${ADDRESS_BASE_64}.json`,
    JSON.stringify(balanceResult, null, 2)
  );

  console.log("Done!");
}

main().catch(console.error);
