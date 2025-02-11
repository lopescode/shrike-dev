import { TNotificationStateValue } from "./TNotificationStateValue";

export type TNotification = {
  contract: string;
  eventname: string;
  state: {
    type: "Array";
    value: TNotificationStateValue[];
  };
};
