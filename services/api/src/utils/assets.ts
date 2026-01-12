import { polygonConfig } from "../config/polygon";

const whitelist = new Map(
  polygonConfig.assets.map((a) => [a.address.toLowerCase(), a])
);

export const isSupportedAsset = (address: string, requireDeposit = false) => {
  if (!address) return false;
  const entry = whitelist.get(address.toLowerCase());
  if (!entry) return false;
  if (requireDeposit && !entry.isDeposit) return false;
  return true;
};

export const validateAssetList = (assets: { asset: string; isDeposit: boolean }[]) => {
  if (!assets || assets.length === 0) throw new Error("At least one asset required");
  if (assets.length > 12) throw new Error("Maximum 12 assets allowed");
  const hasDeposit = assets.some((a) => a.isDeposit);
  if (!hasDeposit) throw new Error("At least one asset must be deposit-enabled");
  for (const a of assets) {
    if (!isSupportedAsset(a.asset)) throw new Error(`Unsupported asset ${a.asset}`);
  }
};
