import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function FamilyAuthLayout({
  children,
  backHref = "/organiser/signin",
  backLabel = "Back to sign in",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="auth-page">
      <header>
        <Link href={backHref} className="quiet-link">
          <ArrowLeft size={20} aria-hidden="true" />
          {backLabel}
        </Link>
        <Link href="/" className="circle-wordmark">
          Memvella
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
