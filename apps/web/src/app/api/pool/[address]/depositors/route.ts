import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getProvider } from "@/lib/dhedge-readonly";
import { formatUnits } from "ethers/lib/utils";

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// Known protocol fund addresses (add more as needed)
const PROTOCOL_FUNDS: Record<string, string> = {
  "0x0000000000000000000000000000000000000000": "Null Address",
  // Add other known protocol addresses here
};

interface Depositor {
  address: string;
  balance: string;
  balanceFormatted: number;
  valueUsd: number;
  label?: string;
}

// Helper to get share price
const getSharePrice = async (poolAddress: string, provider: ethers.providers.JsonRpcProvider): Promise<number> => {
  try {
    const contract = new ethers.Contract(poolAddress, ERC20_ABI, provider);
    // This is a simplified calculation - in production would use composition for accurate TVL
    return 1; // Default to 1 if unable to calculate
  } catch {
    return 1;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const poolAddress = params.address;
    const provider = getProvider();
    const contract = new ethers.Contract(poolAddress, ERC20_ABI, provider);

    // Get pool token decimals
    const decimals = await contract.decimals().catch(() => 18);

    // Query Transfer events to find unique depositors
    // Looking at all Transfer events where `to` is not zero (receives)
    const transferFilter = contract.filters.Transfer(null, null);
    
    // Get events from last ~90 days of blocks (approximate)
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 2_000_000); // ~90 days on Polygon

    const events = await contract.queryFilter(transferFilter, fromBlock, currentBlock);

    // Collect unique addresses
    const addressSet = new Set<string>();
    for (const event of events) {
      if (event.args) {
        addressSet.add(event.args.from.toLowerCase());
        addressSet.add(event.args.to.toLowerCase());
      }
    }

    // Remove zero address
    addressSet.delete("0x0000000000000000000000000000000000000000");

    // Get balances for each address
    const addresses = Array.from(addressSet);
    const balancePromises = addresses.map(async (addr) => {
      try {
        const balance = await contract.balanceOf(addr);
        return { address: addr, balance };
      } catch {
        return { address: addr, balance: ethers.BigNumber.from(0) };
      }
    });

    const balances = await Promise.all(balancePromises);

    // Filter out zero balances and format
    const sharePrice = await getSharePrice(poolAddress, provider);
    
    const depositors: Depositor[] = balances
      .filter((b) => b.balance.gt(0))
      .map((b) => {
        const balanceFormatted = Number(formatUnits(b.balance, decimals));
        return {
          address: b.address,
          balance: b.balance.toString(),
          balanceFormatted,
          valueUsd: balanceFormatted * sharePrice,
          label: PROTOCOL_FUNDS[b.address.toLowerCase()],
        };
      })
      .sort((a, b) => b.balanceFormatted - a.balanceFormatted);

    return NextResponse.json({
      status: "success",
      poolAddress,
      totalDepositors: depositors.length,
      depositors,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
