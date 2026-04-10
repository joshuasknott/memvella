import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <BrandLogo />
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              A digital wellness companion for families caring for seniors. Not a medical device.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Product
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <Link href="#how-it-works" className="text-base font-medium text-slate-700 transition-colors hover:text-slate-900">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#trust" className="text-base font-medium text-slate-700 transition-colors hover:text-slate-900">
                    Trust & Dignity
                  </Link>
                </li>
                <li>
                  <Link href="#waitlist" className="text-base font-medium text-slate-700 transition-colors hover:text-slate-900">
                    Get Early Access
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Legal
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <Link href="#" className="text-base font-medium text-slate-700 transition-colors hover:text-slate-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base font-medium text-slate-700 transition-colors hover:text-slate-900">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base font-medium text-slate-700 transition-colors hover:text-slate-900">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-100 pt-8">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Memvella. Memvella is a digital wellness companion and is not a medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
