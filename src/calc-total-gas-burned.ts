import { dbConnection } from "./database/dbConnection";

async function main() {
  const transferQuery = `SELECT SUM(sysfee) as sum from transactions`

  const res = await dbConnection.prepare(transferQuery).get() as { sum: number};
  console.log(`Total burned: ${res.sum / 1e8} GAS`);
}

main().catch(console.error);
