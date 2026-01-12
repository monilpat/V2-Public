import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "services/api/.history-cache.json");
const MAX_POINTS = 90; // up to ~3 months daily

type Point = { timestamp: number; sharePrice: number; tvl: number };

let store: Record<string, Point[]> = {};

const load = () => {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      store = JSON.parse(raw);
    }
  } catch (e) {
    store = {};
  }
};

const persist = () => {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store));
  } catch (e) {
    // ignore
  }
};

load();

export const getHistory = (pool: string): Point[] => {
  return store[pool.toLowerCase()] || [];
};

export const recordPoint = (pool: string, point: Point) => {
  const key = pool.toLowerCase();
  const existing = store[key] || [];
  const next = [...existing.filter((p) => p.timestamp > point.timestamp - 120 * 24 * 60 * 60 * 1000), point].slice(-MAX_POINTS);
  store[key] = next;
  persist();
  return next;
};
