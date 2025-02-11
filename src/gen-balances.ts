import * as fsPromises from "node:fs/promises";
import { base64ToNeo3Address } from "./helper/CryptoHelper";
import { TBalance } from "./types/TBalance";
import { TTransfer } from "./types/TTransfer";
import { TNotification } from "./types/TNotification";
import { ADDRESS_BASE_64 } from "./constants";

async function main() {
  const file = await fsPromises.readFile(
    `./src/output/transfers-${ADDRESS_BASE_64}.json`
  );

  const balances: TBalance[] = [];

  const rows: TTransfer[] = JSON.parse(file.toString());

  rows.forEach((row: TTransfer) => {
    try {
      const notifications: TNotification[] = JSON.parse(row.notifications);

      for (const notification of notifications) {
        if (notification.eventname !== "Transfer") continue;

        const fromState = notification.state.value[0];
        const toState = notification.state.value[1];
        const amount = notification.state.value[2].value;

        const from =
          fromState?.type === "ByteString"
            ? base64ToNeo3Address(fromState.value as string)
            : "Mint";
        const to =
          toState?.type === "ByteString"
            ? base64ToNeo3Address(toState.value as string)
            : "Burn";

        balances.push({
          from,
          to,
          tokenHash: notification.contract,
          amount: amount ?? "0",
          type: from === "Mint" ? "Mint" : to === "Burn" ? "Burn" : "Transfer",
          fee: Number(row.netfee) + Number(row.sysfee),
        });
      }
    } catch (error) {
      console.error(
        "Erro ao processar JSON em notifications:",
        row.notifications
      );
    }
  });

  await fsPromises.writeFile(
    `./src/output/balances-${ADDRESS_BASE_64}.json`,
    JSON.stringify(balances, null, 2)
  );

  console.log("Done!");
}

main().catch(console.error);
