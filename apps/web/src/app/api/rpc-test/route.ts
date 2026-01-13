export const runtime = "nodejs";

export async function GET() {
  const rpcUrl =
   'https://polygon-mainnet.g.alchemy.com/v2/rQzQUwgUS3lDBKJSUlN6e';

  if (!rpcUrl) {
    return Response.json(
      { status: "fail", msg: "Missing Polygon RPC env var" },
      { status: 500 }
    );
  }

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_chainId",
      params: [],
    }),
  });

  const body = await res.text();
  return Response.json({
    status: res.status,
    body: body.slice(0, 500),
  });
}
