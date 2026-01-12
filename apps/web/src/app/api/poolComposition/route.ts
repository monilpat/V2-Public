import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { Dhedge, Network } from "@dhedge/v2-sdk";

const getProvider = () => {
  const rpc = process.env.NEXT_PUBLIC_POLYGON_RPC;
  if (!rpc) throw new Error("NEXT_PUBLIC_POLYGON_RPC not configured");
  return new ethers.providers.JsonRpcProvider(rpc);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get("pool");
    
    if (!poolAddress) {
      return NextResponse.json(
        { status: "fail", msg: "pool parameter required" },
        { status: 400 }
      );
    }

    const provider = getProvider();
    const dhedge = new Dhedge(provider, Network.POLYGON);
    const pool = await dhedge.loadPool(poolAddress);
    const composition = await pool.getComposition();
    
    return NextResponse.json({ status: "success", msg: composition });
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
