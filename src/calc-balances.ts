import * as fsPromises from "node:fs/promises";
import { TBalance } from "./types/TBalance";
import { TBalanceResult } from "./types/TBalanceResult";
import { base64ToNeo3Address } from "./helper/CryptoHelper";

async function main() {
  const addressBase64 = "qlnOoRBvT9RecNKDqaIV0QvZRG8=";

  const file = await fsPromises.readFile(
    `./src/output/balances-${addressBase64}.json`
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

  for (const tokenHash of Object.keys(groupedRows)) {
    const tokenRows = groupedRows[tokenHash];

    const balance = tokenRows.reduce(
      (acc, row) => {
        if (row.from === base64ToNeo3Address(addressBase64)) {
          acc.balance -= Number(row.amount);
        }

        if (row.to === base64ToNeo3Address(addressBase64)) {
          acc.balance += Number(row.amount);
        }

        return acc;
      },
      { tokenHash, balance: 0 }
    );

    balanceResult.push(balance);
  }

  await fsPromises.writeFile(
    `./src/output/balance-result-${addressBase64}.json`,
    JSON.stringify(balanceResult, null, 2)
  );

  console.log("Done!");
}

main().catch(console.error);
