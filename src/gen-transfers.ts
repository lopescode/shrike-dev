import * as fsPromises from "node:fs/promises";
import { ADDRESS_BASE_64 } from "./constants";
import { dbConnection } from "./database/dbConnection";

async function main() {
  const transferQuery = `SELECT hash, sender, sysfee, netfee, notifications
    FROM transactions
    WHERE notifications LIKE '%"eventname":"Transfer"%'
    AND notifications LIKE '%${ADDRESS_BASE_64}%';`;

  const rows = dbConnection.prepare(transferQuery).all();

  await fsPromises.writeFile(
    `./src/output/transfers-${ADDRESS_BASE_64}.json`,
    JSON.stringify(rows, null, 2)
  );

  console.log("Done!");
}

main().catch(console.error);
