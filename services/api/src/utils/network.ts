import { Network } from "@dhedge/v2-sdk";

const allowOverride = process.env.ENABLE_NETWORK_OVERRIDE === "true";

export const resolveNetwork = (queryNetwork?: string): Network => {
  if (allowOverride && queryNetwork) {
    return queryNetwork as Network;
  }
  return Network.POLYGON;
};
