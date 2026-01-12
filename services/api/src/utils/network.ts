import { Network } from "@dhedge/v2-sdk";

const allowOverride = process.env.ENABLE_NETWORK_OVERRIDE === "true";

export const resolveNetwork = (queryNetwork?: string): Network => {
  if (allowOverride && queryNetwork) {
    return queryNetwork as Network;
  }
  return Network.POLYGON;
};

export const resolveRpcUrl = (network: Network): string => {
  switch (network) {
    case Network.POLYGON:
      return process.env.POLYGON_URL || "";
    case Network.OPTIMISM:
      return process.env.OPTIMISM_URL || "";
    case Network.ARBITRUM:
      return process.env.ARBITRUM_URL || "";
    case Network.ETHEREUM:
      return process.env.ETHEREUM_URL || "";
    case Network.BASE:
      return process.env.BASE_URL || "";
    default:
      return "";
  }
};
