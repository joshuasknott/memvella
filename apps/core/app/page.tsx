import Link from "next/link";
import { BrandLogo, Button } from "@memvella/ui";
import { LogIn, ShieldCheck } from "lucide-react";

export default function UniversalSplash() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 py-12 text-center font-body selection:bg-family-primary selection:text-white">
      {/* Wordmark + tagline */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <BrandLogo className="w-auto h-10 md:h-12" />
        <p className="text-base md:text-lg text-text-secondary font-medium tracking-wide">
          Digital wellness support for someone you care about.
        </p>
      </div>

      {/* Action area */}
      <div className="w-full max-w-sm md:max-w-md mx-auto">
        <div
          className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          key="circle-options"
        >
          <Button variant="family" size="senior" asChild id="btn-start-circle">
            <Link href="/onboarding/organiser">
              <ShieldCheck className="w-5 h-5" />
              Sign up
            </Link>
          </Button>

          <Button variant="secondary" size="senior" asChild id="btn-join-circle">
            <Link href="/organiser/signin">
              <LogIn className="w-5 h-5" />
              Log in
            </Link>
          </Button>
        </div>

        {/* Tertiary: tablet pairing — quiet, never a primary CTA */}
        <div className="mt-10">
          <Link
            href="/assisted/login"
            id="link-connect-tablet"
            className="text-sm text-text-secondary hover:text-family-primary underline underline-offset-4 transition-colors"
          >
            Connect a companion tablet
          </Link>
        </div>
      </div>
    </main>
  );
}
