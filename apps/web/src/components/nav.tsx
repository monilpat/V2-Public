import { Wallet } from "./wallet";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

export function Nav() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent2" />
          <div>
            <div className="text-sm text-muted">Multi-chain</div>
            <div className="font-semibold">dHEDGE</div>
          </div>
        </Link>
        <nav className="hidden md:flex gap-4 text-sm">
          <Link href="/explore" className="text-muted hover:text-foreground transition-colors">
            Explore
          </Link>
          <Link href="/my-deposits" className="text-muted hover:text-foreground transition-colors">
            My Deposits
          </Link>
          <Link href="/manage" className="text-muted hover:text-foreground transition-colors">
            Manage
          </Link>
          <Link href="/stats" className="text-muted hover:text-foreground transition-colors">
            Stats
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Wallet />
      </div>
    </div>
  );
}
