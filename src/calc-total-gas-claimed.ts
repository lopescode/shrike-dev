import { dbConnection } from "./database/dbConnection";

async function main() {
  let totalClaims = 0;
  let totalGasClaimed = 0;

  const transferQuery = `SELECT notifications
    FROM transactions
    WHERE notifications LIKE '%"contract":"0xd2a4cff31913016155e38e474a2c06d08be276cf","eventname":"Transfer","state":{"type":"Array","value":[{"type":"Any","value":null%'`;

  const rows = dbConnection.prepare(transferQuery).all() as { notifications: string }[];
  rows.forEach((row) => {
    const notifications = JSON.parse(row.notifications);
    for (const notification of notifications) {
      if (notification.eventname === "Transfer"
            && notification.state.value[0].value === null
            && notification.contract === "0xd2a4cff31913016155e38e474a2c06d08be276cf") {
        const value = parseInt(notification.state.value[2].value);
        const amount = value / 1e8;
        totalGasClaimed += amount;
        totalClaims++;
      }
    }
  });

  console.log(`Total claims: ${totalClaims}`);
  console.log(`Total claimed: ${totalGasClaimed} GAS`);
}

main().catch(console.error);
