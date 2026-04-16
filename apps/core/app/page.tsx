"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo, Button } from "@memvella/ui";
import { ChevronLeft, ShieldCheck, Users, UserRound } from "lucide-react";

export default function UniversalSplash() {
  const [showCircleOptions, setShowCircleOptions] = useState(false);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 py-12 text-center font-body selection:bg-family-primary selection:text-white">
      {/* Wordmark + tagline */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <BrandLogo className="w-auto h-10 md:h-12" />
        <p className="text-base md:text-lg text-text-secondary font-medium tracking-wide">
          Your family&rsquo;s digital wellness companion.
        </p>
      </div>

      {/* Action area */}
      <div className="w-full max-w-sm md:max-w-md mx-auto">
        {!showCircleOptions ? (
          /* ── Level 1: Two doors ── */
          <div
            className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            key="level1"
          >
            {/* Door A — family / Circle */}
            <Button
              variant="family"
              size="senior"
              onClick={() => setShowCircleOptions(true)}
              id="btn-for-loved-one"
            >
              <Users className="w-5 h-5" />
              I&rsquo;m here for a loved one
            </Button>

            {/* Door B — independent senior */}
            <Button variant="senior" size="senior" asChild id="btn-for-myself">
              <Link href="/onboarding/independent">
                <UserRound className="w-5 h-5" />
                I&rsquo;m setting this up for myself
              </Link>
            </Button>
          </div>
        ) : (
          /* ── Level 2: Circle sub-options (inline reveal) ── */
          <div
            className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            key="level2"
          >
            {/* Back */}
            <button
              onClick={() => setShowCircleOptions(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-family-primary mb-2 self-start hover:opacity-70 transition-opacity"
              id="btn-back"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <p className="text-sm text-text-secondary font-medium mb-1">
              Are you starting fresh, or joining an existing Circle?
            </p>

            <Button variant="family" size="senior" asChild id="btn-start-circle">
              <Link href="/onboarding/organiser">
                <ShieldCheck className="w-5 h-5" />
                Start a New Circle
              </Link>
            </Button>

            <Button variant="secondary" size="senior" asChild id="btn-join-circle">
              <Link href="/onboarding/member">
                <Users className="w-5 h-5" />
                Join a Circle
              </Link>
            </Button>
          </div>
        )}

        {/* Tertiary: tablet pairing — quiet, never a primary CTA */}
        <div className="mt-10">
          <Link
            href="/assisted/login"
            id="link-connect-tablet"
            className="text-sm text-text-secondary hover:text-family-primary underline underline-offset-4 transition-colors"
          >
            Connecting a tablet? Enter your pairing code
          </Link>
        </div>
      </div>
    </main>
  );
}
