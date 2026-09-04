import Link from "next/link";
import { Flower } from "lucide-react";

export function Header() {
  return (
    <header className="marketing-header">
      <Link href="/" className="marketing-wordmark" aria-label="Memvella home">
        <Flower size={36} strokeWidth={1.8} aria-hidden="true" />
        memvella
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#companion">The companion</Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#questions">Questions</Link>
        <Link href="/#waitlist" className="marketing-button">
          Join the waitlist
        </Link>
      </nav>
    </header>
  );
}
