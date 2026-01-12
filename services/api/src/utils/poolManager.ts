import { ethers } from "ethers";
import { provider } from "./factory";
import PoolManagerLogicAbi from "../../abi/PoolManagerLogic.json";
import PoolLogicAbi from "../../abi/PoolLogic.json";

const IManagedAbi = [
  "function manager() external view returns (address)",
  "function trader() external view returns (address)",
  "function managerName() external view returns (string memory)",
];

export const getPoolManagerLogic = async (poolAddress: string): Promise<string | null> => {
  try {
    const poolContract = new ethers.Contract(poolAddress, PoolLogicAbi, provider);
    const managerLogicAddress = await poolContract.poolManagerLogic();
    return managerLogicAddress;
  } catch (e) {
    console.warn(`Failed to get poolManagerLogic for ${poolAddress}:`, e);
    return null;
  }
};

export const getManagerAndTrader = async (poolAddress: string): Promise<{ manager: string; trader: string }> => {
  try {
    const managerLogicAddress = await getPoolManagerLogic(poolAddress);
    if (!managerLogicAddress || managerLogicAddress === ethers.constants.AddressZero) {
      return { manager: ethers.constants.AddressZero, trader: ethers.constants.AddressZero };
    }

    const managerContract = new ethers.Contract(managerLogicAddress, IManagedAbi, provider);
    const [manager, trader] = await Promise.all([
      managerContract.manager().catch(() => ethers.constants.AddressZero),
      managerContract.trader().catch(() => ethers.constants.AddressZero),
    ]);

    return { manager, trader };
  } catch (e) {
    console.warn(`Failed to get manager/trader for ${poolAddress}:`, e);
    return { manager: ethers.constants.AddressZero, trader: ethers.constants.AddressZero };
  }
};

export const getPoolFees = async (poolAddress: string): Promise<{
  performanceFee: number;
  exitCooldown: number;
}> => {
  try {
    const managerLogicAddress = await getPoolManagerLogic(poolAddress);
    if (!managerLogicAddress || managerLogicAddress === ethers.constants.AddressZero) {
      return { performanceFee: 0, exitCooldown: 24 * 60 * 60 };
    }

    const managerContract = new ethers.Contract(managerLogicAddress, PoolManagerLogicAbi, provider);
    const [performanceFeeNumerator, , , , denominator] = await managerContract.getFee().catch(() => [0, 0, 0, 0, 10000]);
    
    // Get exit cooldown from factory (would need factory ABI)
    const exitCooldown = 24 * 60 * 60; // Default 1 day, can be enhanced

    return {
      performanceFee: denominator > 0 ? (Number(performanceFeeNumerator) / Number(denominator)) * 100 : 0,
      exitCooldown,
    };
  } catch (e) {
    console.warn(`Failed to get fees for ${poolAddress}:`, e);
    return { performanceFee: 0, exitCooldown: 24 * 60 * 60 };
  }
};
