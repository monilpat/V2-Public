"use client";
import { polygonConfig } from "@/lib/polygon";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { trade as tradeApi, approveTrade } from "@/lib/api";
import { assetMeta, fetchPriceUSD } from "@/lib/prices";
import { useWriteContract, useReadContract, useAccount, useConnect, useDisconnect } from "wagmi";
import { poolLogicAbi, poolManagerLogicAbi, erc20Abi, poolFactoryAbi } from "@/lib/abi";
import { formatUnits, parseUnits, maxUint256 } from "viem";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { fetchPools } from "@/lib/pools";
import { StatCard } from "@/components/stats";
import { useToast } from "@/components/toast";
import { chainName } from "@/lib/chains";
import { NetworkSelector } from "@/components/network-selector";

const fetchComposition = async (pool: string) => {
  const res = await axios.get(`${API_BASE}/poolComposition`, { params: { pool } });
  return res.data.msg as any[];
};

const computeTvl = async (composition: any[]) => {
  let total = 0;
  for (const item of composition) {
    const meta = assetMeta.get(item.asset.toLowerCase());
    if (!meta) continue;
    const price = await fetchPriceUSD(item.asset);
    const bal = Number(formatUnits(BigInt(item.balance.hex || item.balance._hex || item.balance), meta.decimals));
    total += bal * price;
  }
  return total;
};

function PoolCard({ pool, defaultNetwork }: { pool: { name: string; address: string; symbol: string; network?: number }; defaultNetwork: number }) {
  const { Toast, push, clear } = useToast();
  const { data, isLoading, error } = useQuery({
    queryKey: ["composition", pool.address],
    queryFn: () => fetchComposition(pool.address),
    enabled: pool.address !== "0x0000000000000000000000000000000000000000",
  });
  const { data: tvl } = useQuery({
    queryKey: ["tvl", pool.address],
    queryFn: async () => (data ? computeTvl(data) : 0),
    enabled: !!data,
  });
  const [depositAsset, setDepositAsset] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [tradeFrom, setTradeFrom] = useState("");
  const [tradeTo, setTradeTo] = useState("");
  const [share, setShare] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [trader, setTrader] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: shareBalance } = useReadContract({
    address: pool.address as `0x${string}`,
    abi: poolLogicAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address && pool.address !== "0x0000000000000000000000000000000000000000" },
  });
  const { data: shareDecimals } = useReadContract({
    address: pool.address as `0x${string}`,
    abi: poolLogicAbi,
    functionName: "decimals",
    query: { enabled: !!address },
  });
  const { data: poolManagerLogicAddress } = useReadContract({
    address: pool.address as `0x${string}`,
    abi: poolLogicAbi,
    functionName: "poolManagerLogic",
    query: { enabled: pool.address !== "0x0000000000000000000000000000000000000000" },
  });

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Pool</div>
          <div className="text-xl font-semibold">{pool.name}</div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-white/5 text-sm">{pool.symbol}</span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs">
            {chainName(pool.network || defaultNetwork)}
          </span>
        </div>
      </div>
      {tvl !== undefined && (
        <div className="text-sm">
          <span className="text-muted">TVL</span>{" "}
          <span className="font-semibold">${tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      )}
      <a
        href={`https://polygonscan.com/address/${pool.address}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-accent2 break-all hover:underline"
      >
        {pool.address}
      </a>
      <div className="text-sm text-muted">Composition</div>
      {isLoading ? (
        <div className="text-muted text-sm">Loading...</div>
      ) : error ? (
        <div className="text-amber-400 text-sm">Failed to load composition</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {data.map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg px-3 py-2">
                <div className="font-semibold">{item.asset}</div>
                <div className="text-muted text-xs">Deposit: {item.isDeposit ? "yes" : "no"}</div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="text-sm font-semibold">Trader</div>
            <div className="flex gap-2 flex-wrap">
              <input
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm"
                placeholder="Trader address"
                value={trader}
                onChange={(e) => setTrader(e.target.value)}
              />
              <button
                className="btn-ghost"
                disabled={!poolManagerLogicAddress || !trader}
                onClick={async () => {
                  try {
                    clear(); setStatus("Setting trader...");
                    const hash = await writeContractAsync({
                      address: poolManagerLogicAddress as `0x${string}`,
                      abi: poolManagerLogicAbi,
                      functionName: "setTrader",
                      args: [trader as `0x${string}`],
                    });
                    const m = `Tx: ${hash}`; push(m, "success"); setStatus(m);
                  } catch (err: any) {
                    const m = err?.message || "Error"; setStatus(m); push(m, "error");
                  }
                }}
              >
                Set trader
              </button>
            </div>

            <div className="text-sm font-semibold">Deposit</div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm"
                placeholder="Asset address"
                value={depositAsset}
                onChange={(e) => setDepositAsset(e.target.value)}
              />
              <input
                className="w-28 bg-white/5 rounded-lg px-3 py-2 text-sm"
                placeholder="Amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button
                className="btn-primary"
                disabled={!address || !depositAsset || !depositAmount}
                onClick={async () => {
                  try {
                    if (!depositAsset || !depositAmount) { setStatus("Enter asset and amount"); return; }
                    clear(); setStatus("Approving...");
                    // Approve asset for deposit
                    await writeContractAsync({
                      address: depositAsset as `0x${string}`,
                      abi: erc20Abi,
                      functionName: "approve",
                      args: [pool.address as `0x${string}`, maxUint256],
                    });
                    push("Approved deposit", "success");
                    setStatus("Depositing...");
                    // Deposit into pool
                    const amount = parseUnits(depositAmount, 18); // Assuming 18 decimals, can be enhanced
                    const hash = await writeContractAsync({
                      address: pool.address as `0x${string}`,
                      abi: poolLogicAbi,
                      functionName: "deposit",
                      args: [depositAsset as `0x${string}`, amount],
                    });
                    const m = `Tx: ${hash}`; push(m, "success"); setStatus(m);
                  } catch (err: any) {
                    const m = err?.message || "Error"; setStatus(m); push(m, "error");
                  }
                }}
              >
                Deposit
              </button>
            </div>
            <div className="text-sm font-semibold pt-2">Trade</div>
            <div className="flex gap-2 flex-wrap">
              <input
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm"
                placeholder="From asset"
                value={tradeFrom}
                onChange={(e) => setTradeFrom(e.target.value)}
              />
              <input
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm"
                placeholder="To asset"
                value={tradeTo}
                onChange={(e) => setTradeTo(e.target.value)}
              />
              <input
                className="w-28 bg-white/5 rounded-lg px-3 py-2 text-sm"
                placeholder="% share"
                value={share}
                onChange={(e) => setShare(e.target.value)}
              />
              <button
                className="btn-ghost"
                disabled={!tradeFrom || !tradeTo || !share}
                onClick={async () => {
                  try {
                    clear(); setStatus("Approving trade...");
                    // Note: Trade approval and execution is complex and may require dHEDGE SDK
                    // For now, keeping API call but it will need backend service or SDK integration
                    await approveTrade(pool.address, "oneinch", tradeFrom);
                    push("Approved trade", "success");
                    setStatus("Trading...");
                    const tx = await tradeApi(pool.address, {
                      from: tradeFrom,
                      to: tradeTo,
                      share: Number(share),
                      slippage: 0.5,
                    });
                    const m = `Tx: ${tx.data?.msg || "sent"}`; push(m, "success"); setStatus(m);
                  } catch (err: any) {
                    const m = err?.message || "Error"; setStatus(m); push(m, "error");
                  }
                }}
              >
                Trade
              </button>
            </div>
            {status && <div className="text-xs text-muted">{status}</div>}
            <div className="text-sm font-semibold pt-2">Withdraw</div>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                className="w-36 bg-white/5 rounded-lg px-3 py-2 text-sm"
                placeholder="Shares to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button
                className="btn-ghost"
                disabled={!address || !shareBalance}
                onClick={async () => {
                  if (!shareBalance || !shareDecimals) return;
                  const amount = withdrawAmount
                    ? parseUnits(withdrawAmount, shareDecimals as number)
                    : (shareBalance as bigint);
                  try {
                    clear(); setStatus("Withdrawing...");
                    await writeContractAsync({
                      address: pool.address as `0x${string}`,
                      abi: poolLogicAbi,
                      functionName: "withdraw",
                      args: [amount],
                    });
                    setStatus("Withdraw transaction sent"); push("Withdraw sent", "success");
                  } catch (err: any) {
                    const m = err?.message || "Error"; setStatus(m); push(m, "error");
                  }
                }}
              >
                Withdraw
              </button>
              {shareBalance && shareDecimals !== undefined ? (
                <span className="text-xs text-muted">
                  Balance: {formatUnits(shareBalance as bigint, shareDecimals as number)}
                </span>
              ) : null}
              <div className="text-xs text-muted">Cooldown may apply per pool settings.</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-muted text-sm">No data</div>
      )}
    </div>
  );
}

function Wallet() {
  const { address } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Connected</span>
        <span className="px-3 py-1 rounded-full bg-white/10 text-sm">{address.slice(0, 6)}…{address.slice(-4)}</span>
        <button className="btn-ghost" onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          className="btn-primary"
          onClick={() => connect({ connector })}
          disabled={!connector.ready || status === "pending"}
        >
          {connector.name}
        </button>
      ))}
      {error && <span className="text-amber-400 text-sm">{error.message}</span>}
    </div>
  );
}

export default function Page() {
  const [network, setNetwork] = useState("137"); // Polygon chain ID

  const { data: poolAddresses } = useQuery({
    queryKey: ["pools", network],
    queryFn: () => fetchPools(network),
  });
  const pools = (poolAddresses ?? polygonConfig.pools).map((p: any) => ({
    name: p.name || p.address || p,
    address: p.address || p,
    symbol: p.symbol || "POOL",
    network: p.network,
  }));
  const [managerName, setManagerName] = useState("");
  const [poolName, setPoolName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [fee, setFee] = useState("0");
  const [mgmtFee, setMgmtFee] = useState("0");
  const [supportedAssets, setSupportedAssets] = useState<string[]>([]);
  const [entryFee, setEntryFee] = useState("0");
  const [exitFee, setExitFee] = useState("0");
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const { writeContractAsync: writeFactory } = useWriteContract();
  const { address } = useAccount();

  return (
    <div className="space-y-8">
      <Nav />
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm text-muted">Network</div>
            <h1 className="text-3xl font-bold">dHEDGE Vaults</h1>
            <p className="text-muted mt-1">Create, deposit, withdraw, and trade inside permissioned vaults.</p>
          </div>
          <NetworkSelector value={network} onChange={setNetwork} disabledIds={[1,10,42161]} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Pools" value={(poolAddresses?.length || pools.length).toString()} />
        <StatCard label="Network" value={chainName(137)} hint="Factory live" />
        <StatCard label="Status" value="Alpha" hint="On-chain TVL live, PnL WIP" />
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">Create vault</div>
            <div className="text-xl font-semibold">New pool on Polygon</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <input
            className="bg-white/5 rounded-lg px-3 py-2"
            placeholder="Manager name"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
          />
          <input
            className="bg-white/5 rounded-lg px-3 py-2"
            placeholder="Fund name"
            value={poolName}
            onChange={(e) => setPoolName(e.target.value)}
          />
          <input
            className="bg-white/5 rounded-lg px-3 py-2"
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <input
            className="bg-white/5 rounded-lg px-3 py-2"
            placeholder={`Performance fee numerator (<= ${polygonConfig.performanceFee.maxNumerator})`}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
          <input
            className="bg-white/5 rounded-lg px-3 py-2"
            placeholder="Management fee numerator (<= 300)"
            value={mgmtFee}
            onChange={(e) => setMgmtFee(e.target.value)}
          />
          <input
            className="bg-white/5 rounded-lg px-3 py-2"
            placeholder="Entry fee numerator (<= 100)"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
          />
          <input
            className="bg-white/5 rounded-lg px-3 py-2"
            placeholder="Exit fee numerator (<= 100)"
            value={exitFee}
            onChange={(e) => setExitFee(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted">Supported deposit assets (comma separated addresses, max 12)</div>
          <input
            className="bg-white/5 rounded-lg px-3 py-2 text-sm w-full"
            placeholder="0x...,0x...,0x..."
            onChange={(e) => setSupportedAssets(e.target.value.split(/[,\\s]+/).filter(Boolean))}
          />
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="btn-primary"
            onClick={async () => {
              const feeNum = Number(fee);
              if (feeNum > polygonConfig.performanceFee.maxNumerator) {
                setCreateStatus("Fee exceeds cap");
                return;
              }
              const mgmtNum = Number(mgmtFee || "0");
              if (mgmtNum > 300) {
                setCreateStatus("Management fee exceeds cap (3%)");
                return;
              }
              if (!managerName || !poolName || !symbol || supportedAssets.length === 0) {
                setCreateStatus("Fill all fields");
                return;
              }
              if (!address) {
                setCreateStatus("Connect wallet first");
                return;
              }
              try {
                if (supportedAssets.length > 12) {
                  setCreateStatus("Max 12 assets");
                  return;
                }
                setCreateStatus("Signing createFund...");
                const assets = supportedAssets.map((a) => ({
                  asset: a as `0x${string}`,
                  isDeposit: true,
                }));
                const txHash = await writeFactory({
                  address: polygonConfig.factoryAddress as `0x${string}`,
                  abi: poolFactoryAbi,
                  functionName: "createFund",
                  args: [
                    false, // public pool
                    address,
                    managerName,
                    poolName,
                    symbol,
                    BigInt(feeNum),
                    BigInt(mgmtNum),
                    assets,
                  ],
                  chainId: 137,
                });
                setCreateStatus(`Tx sent: ${txHash}`);
              } catch (err: any) {
                setCreateStatus(err?.message || "Error");
              }
            }}
          >
            Create Pool
          </button>
          {createStatus && <div className="text-xs text-muted">{createStatus}</div>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pools.map((pool) => (
          <Link key={pool.address} href={`/pool/${pool.address}`} className="block">
            <PoolCard pool={pool} defaultNetwork={137} />
          </Link>
        ))}
      </div>
    </div>
  );
}
