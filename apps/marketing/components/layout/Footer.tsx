import Link from "next/link";
import { Flower } from "lucide-react";

export function Footer() {
  return (
    <footer className="marketing-footer">
      <div>
        <Link href="/" className="marketing-wordmark">
          <Flower size={30} strokeWidth={1.8} aria-hidden="true" />
          memvella
        </Link>
        <p>A digital wellness companion. Not a medical device.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <p>© {new Date().getFullYear()} Memvella</p>
    </footer>
  );
}
