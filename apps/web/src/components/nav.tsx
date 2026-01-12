import { Wallet } from "./wallet";

export function Nav() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent2" />
        <div>
          <div className="text-sm text-muted">Polygon Mainnet</div>
          <div className="font-semibold">dHEDGE</div>
        </div>
      </div>
      <Wallet />
    </div>
  );
}
