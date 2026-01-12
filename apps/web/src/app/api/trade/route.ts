import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { Dapp, Dhedge, Network } from "@dhedge/v2-sdk";

const getProvider = () => {
  const rpc = process.env.NEXT_PUBLIC_POLYGON_RPC;
  if (!rpc) throw new Error("NEXT_PUBLIC_POLYGON_RPC not configured");
  return new ethers.providers.JsonRpcProvider(rpc);
};

// Helper to get balance from composition
const getBalanceFromComposition = (asset: string, composition: any[]): ethers.BigNumber => {
  const item = composition.find((x) => x.asset.toLowerCase() === asset.toLowerCase());
  return item?.balance || ethers.BigNumber.from(0);
};

export async function GET(request: NextRequest) {
  try {
    // Note: This endpoint requires a private key to execute transactions
    // Transactions should be signed client-side using wagmi
    return NextResponse.json(
      { 
        status: "fail", 
        msg: "trade requires server-side private key. Use client-side transaction signing instead." 
      },
      { status: 400 }
    );

    // Uncomment if you have a backend service with private key:
    /*
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get("pool");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const share = searchParams.get("share");
    const amount = searchParams.get("amount");
    const slippage = searchParams.get("slippage") || "1";
    const platform = searchParams.get("platform") || "ONEINCH";
    const feeAmount = searchParams.get("feeAmount") || "500";

    if (!poolAddress || !from || !to) {
      return NextResponse.json(
        { status: "fail", msg: "pool, from, and to parameters required" },
        { status: 400 }
      );
    }

    const provider = getProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const dhedge = new Dhedge(wallet, Network.POLYGON);
    const pool = await dhedge.loadPool(poolAddress);
    const composition = await pool.getComposition();
    const balance = getBalanceFromComposition(from, composition);

    let tradeAmount: ethers.BigNumber;
    if (share) {
      tradeAmount = balance.mul(share).div(100);
    } else if (amount) {
      tradeAmount = ethers.BigNumber.from(amount);
      if (tradeAmount.gt(balance)) tradeAmount = balance;
    } else {
      return NextResponse.json(
        { status: "fail", msg: "share or amount required" },
        { status: 400 }
      );
    }

    const txOptions = { gasLimit: "5000000" };
    const dApp = platform as Dapp;
    let tx;
    
    if (dApp === Dapp.UNISWAPV3) {
      tx = await pool.tradeUniswapV3(
        from,
        to,
        tradeAmount,
        Number(feeAmount),
        Number(slippage),
        txOptions
      );
    } else {
      tx = await pool.trade(dApp, from, to, tradeAmount, Number(slippage), txOptions);
    }

    return NextResponse.json({ status: "success", msg: tx.hash });
    */
  } catch (err: any) {
    return NextResponse.json(
      { status: "fail", msg: err?.message || err },
      { status: 400 }
    );
  }
}
