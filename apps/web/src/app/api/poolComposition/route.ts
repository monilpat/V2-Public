import { NextRequest, NextResponse } from "next/server";
import { getDhedgeReadOnly } from "@/lib/dhedge-readonly";

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

    const dhedge = getDhedgeReadOnly();
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
