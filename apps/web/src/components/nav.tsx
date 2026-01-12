import { Wallet } from "./wallet";
import Link from "next/link";

export function Nav() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent2" />
          <div>
            <div className="text-sm text-muted">Polygon Mainnet</div>
            <div className="font-semibold">dHEDGE</div>
          </div>
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/explore" className="text-muted hover:text-white">
            Explore
          </Link>
          <Link href="/stats" className="text-muted hover:text-white">
            Stats
          </Link>
          <Link href="/my-deposits" className="text-muted hover:text-white">
            My Deposits
          </Link>
        </nav>
      </div>
      <Wallet />
    </div>
  );
}
