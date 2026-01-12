import { Router, Request, Response } from "express";
import { getFactory, getProvider } from "../utils/factory";
import erc20 from "../../abi/ERC20.json";
import { dhedge } from "../dhedge";
import { resolveNetwork } from "../utils/network";
import { ethers } from "ethers";
import { fetchPriceUSD } from "../utils/prices";
import { getManagerAndTrader, getPoolFees } from "../utils/poolManager";
import { formatUnits } from "ethers/lib/utils";
import { getHistory, recordPoint } from "../utils/historyCache";

const poolsRouter = Router();

// Helper to compute TVL from composition using real prices
const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;
  for (const item of composition) {
    try {
      const balance = BigInt(item.balance.hex || item.balance._hex || item.balance);
      const decimals = item.decimals || 18;
      const balanceFormatted = Number(formatUnits(balance, decimals));
      const price = await fetchPriceUSD(item.asset);
      total += balanceFormatted * price;
    } catch (e) {
      // Skip failed assets
      continue;
    }
  }
  return total;
};

// Helper to get share price
const getSharePrice = async (poolAddress: string, composition: any[], provider: ethers.providers.JsonRpcProvider): Promise<number> => {
  try {
    const contract = new ethers.Contract(poolAddress, erc20, provider);
    const totalSupply = await contract.totalSupply();
    const tvl = await computeTvl(composition);
    if (totalSupply.gt(0)) {
      return tvl / Number(ethers.utils.formatEther(totalSupply));
    }
    return 1;
  } catch {
    return 1;
  }
};

poolsRouter.get("/pools", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const provider = getProvider(network);
    const search = req.query.search as string | undefined;
    const factory = getFactory(network);
    const pools: string[] = await factory.getDeployedFunds();
    
    const results = await Promise.all(
      pools.map(async (addr) => {
        try {
          const contract = new ethers.Contract(addr, erc20, provider);
          const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
          
          const pool = await dhedge(network).loadPool(addr);
          const composition = await pool.getComposition();
          const tvl = await computeTvl(composition);
          const sharePrice = await getSharePrice(addr, composition, provider);
          const history = getHistory(addr);
          const now = Date.now();
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
          const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
          const price24h = history.find((h) => h.timestamp >= oneDayAgo)?.sharePrice || sharePrice;
          const price1w = history.find((h) => h.timestamp >= oneWeekAgo)?.sharePrice || sharePrice;
          const price1m = history.find((h) => h.timestamp >= oneMonthAgo)?.sharePrice || sharePrice;
          const returns24h = price24h > 0 ? ((sharePrice - price24h) / price24h) * 100 : 0;
          const returns1w = price1w > 0 ? ((sharePrice - price1w) / price1w) * 100 : 0;
          const returns1m = price1m > 0 ? ((sharePrice - price1m) / price1m) * 100 : 0;
          recordPoint(addr, { timestamp: now, sharePrice, tvl });

          // Risk/volatility estimate from history
          let riskScore = 0;
          if (history.length > 1) {
            const prices = history.map((h) => h.sharePrice);
            const returnsArr: number[] = [];
            for (let i = 1; i < prices.length; i++) {
              if (prices[i - 1] > 0) {
                returnsArr.push((prices[i] - prices[i - 1]) / prices[i - 1]);
              }
            }
            if (returnsArr.length) {
              const avg = returnsArr.reduce((a, b) => a + b, 0) / returnsArr.length;
              const variance = returnsArr.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returnsArr.length;
              const vol = Math.sqrt(variance) * Math.sqrt(365);
              riskScore = Math.min(100, Math.max(0, vol * 1000));
            }
          }

          const score =
            returns1m !== 0 && tvl > 0
              ? ((returns1m / 100) / (1 + riskScore / 100)) * Math.sqrt(Math.max(tvl, 1))
              : 0;

          return {
            address: addr,
            name,
            symbol,
            tvl,
            returns24h,
            returns1w,
            returns1m,
            riskScore: Math.round(riskScore),
            score,
            network,
          };
        } catch (_) {
          return {
            address: addr,
            name: addr,
            symbol: "POOL",
            tvl: 0,
            returns24h: 0,
            returns1w: 0,
            returns1m: 0,
            riskScore: 50,
            score: 0,
            network,
          };
        }
      })
    );

    // Filter by search if provided
    let filtered = results;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.symbol.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).send({ status: "success", pools: filtered });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

poolsRouter.get("/pool/:address/metrics", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.params.address;
    const provider = getProvider(network);
    const pool = await dhedge(network).loadPool(poolAddress);
    const composition = await pool.getComposition();
    const tvl = await computeTvl(composition);
    const sharePrice = await getSharePrice(poolAddress, composition, provider);

    // Get history from cache or generate stub
    const history = getHistory(poolAddress);
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const price24h = history.find((h) => h.timestamp >= oneDayAgo)?.sharePrice || sharePrice;
    const price1w = history.find((h) => h.timestamp >= oneWeekAgo)?.sharePrice || sharePrice;
    const price1m = history.find((h) => h.timestamp >= oneMonthAgo)?.sharePrice || sharePrice;

    const returns24h = price24h > 0 ? ((sharePrice - price24h) / price24h) * 100 : 0;
    const returns1w = price1w > 0 ? ((sharePrice - price1w) / price1w) * 100 : 0;
    const returns1m = price1m > 0 ? ((sharePrice - price1m) / price1m) * 100 : 0;

    // Update cache with current price
    const currentEntry = { timestamp: now, sharePrice, tvl };
    const updatedHistory = recordPoint(poolAddress, currentEntry);

    // Get trader/manager from PoolManagerLogic
    const { manager, trader } = await getManagerAndTrader(poolAddress);
    const { performanceFee, managementFee, entryFee, exitFee, exitCooldown } = await getPoolFees(poolAddress);

    // Calculate risk score based on volatility (simplified)
    let riskScore = 50; // Default medium risk
    if (history.length > 1) {
      const prices = history.map((h) => h.sharePrice);
      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        if (prices[i - 1] > 0) {
          returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
      }
      if (returns.length > 0) {
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(365); // Annualized
        // Risk score: 0-100 based on volatility (higher volatility = higher risk)
        riskScore = Math.min(100, Math.max(0, volatility * 1000));
      }
    }

    res.status(200).send({
      status: "success",
      metrics: {
        tvl,
        returns24h,
        returns1w,
        returns1m,
        riskScore: Math.round(riskScore),
        trader,
        manager,
        performanceFee,
        managementFee,
        entryFee,
        exitFee,
        exitCooldown,
      },
    });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

poolsRouter.get("/pool/:address/history", async (req: Request, res: Response) => {
  try {
    const poolAddress = req.params.address;
    const network = resolveNetwork(req.query.network as string | undefined);
    const pool = await dhedge(network).loadPool(poolAddress);
    const composition = await pool.getComposition();
    const provider = getProvider(network);
    const tvl = await computeTvl(composition);
    const sharePrice = await getSharePrice(poolAddress, composition, provider);

    // Get persisted history and append latest point
    let history = getHistory(poolAddress);
    const currentEntry = { timestamp: Date.now(), sharePrice, tvl };
    history = recordPoint(poolAddress, currentEntry);

    res.status(200).send({
      status: "success",
      history: history.map((h) => ({
        timestamp: h.timestamp,
        sharePrice: h.sharePrice,
        tvl: h.tvl,
      })),
    });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

poolsRouter.get("/pool/:address/trades", async (req: Request, res: Response) => {
  try {
    const poolAddress = req.params.address;
    const network = resolveNetwork(req.query.network as string | undefined);
    const provider = getProvider(network);
    const poolContract = new ethers.Contract(poolAddress, erc20, provider);
    const currentBlock = provider ? await provider.getBlockNumber() : 0;
    const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks
    
    try {
      // Query Transfer events (shares being minted/burned indicates deposits/withdrawals)
      // For actual trades, would need to query events from swapper contracts
      const transferFilter = poolContract.filters.Transfer();
      const transfers = await poolContract.queryFilter(transferFilter, fromBlock, currentBlock);
      
      // Convert to trade-like format (simplified - in production would query actual trade events)
      const trades = transfers.slice(-20).map((event: any) => ({
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Stub timestamp
        fromAsset: "0x0000000000000000000000000000000000000000",
        toAsset: "0x0000000000000000000000000000000000000000",
        amount: ethers.utils.formatEther(event.args.value || 0),
        txHash: event.transactionHash,
      }));

      res.status(200).send({
        status: "success",
        trades: trades.slice(0, 10), // Return last 10
      });
    } catch (e) {
      // If event query fails, return empty array
      res.status(200).send({
        status: "success",
        trades: [],
      });
    }
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

export default poolsRouter;
