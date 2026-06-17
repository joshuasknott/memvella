import Link from "next/link";
import { BrandLogo } from "@memvella/ui";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <BrandLogo />
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              A digital wellness companion for family and trusted supporter senior care. Not a medical device.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                Product
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <Link href="#how-it-works" className="text-base font-medium text-text-secondary transition-colors hover:text-text-primary">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-base font-medium text-text-secondary transition-colors hover:text-text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#origin-story" className="text-base font-medium text-text-secondary transition-colors hover:text-text-primary">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="#waitlist" className="text-base font-medium text-text-secondary transition-colors hover:text-text-primary">
                    Request early access
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                Legal
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <Link href="/privacy" className="text-base font-medium text-text-secondary transition-colors hover:text-text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-base font-medium text-text-secondary transition-colors hover:text-text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-base font-medium text-text-secondary transition-colors hover:text-text-primary">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-text-tertiary">
            &copy; {new Date().getFullYear()} Memvella. Memvella is a digital wellness companion and is not a medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
