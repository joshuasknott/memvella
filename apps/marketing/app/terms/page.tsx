import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The ground rules for using the Memvella website and waitlist — simple, fair, and human.",
};

export default function TermsOfServicePage() {
  return (
    <StaticPageLayout title="Terms of Service">
      <p className="text-text-tertiary not-prose text-sm">Last updated: April 2026</p>

      <p>
        These are the simple ground rules for using the Memvella website and
        joining our waitlist. We&apos;ve kept them short and honest.
      </p>

      <h2>What you&apos;re agreeing to</h2>
      <p>
        By using this website or signing up for our waitlist, you agree to these
        terms. If something doesn&apos;t sit right with you, please reach out — we&apos;re
        happy to chat.
      </p>

      <h2>The waitlist</h2>
      <p>
        Joining the Memvella waitlist means you&apos;d like to be notified when we&apos;re
        ready to invite early users. A few things to know:
      </p>
      <ul>
        <li>
          <strong>No guarantee of access.</strong> Being on the waitlist doesn&apos;t
          mean you&apos;ll automatically get in. We&apos;ll be rolling out access gradually
          to make sure the experience is right.
        </li>
        <li>
          <strong>No cost.</strong> The waitlist is free. We will never charge
          you without your explicit permission.
        </li>
        <li>
          <strong>You can leave any time.</strong> Just click unsubscribe in any
          email, or contact us and we&apos;ll remove you immediately.
        </li>
      </ul>

      <h2>What Memvella is (and isn&apos;t)</h2>
      <p>
        We&apos;ll say it as many times as it takes: Memvella is a{" "}
        <strong>digital wellness companion</strong>. It is{" "}
        <strong>not a medical device</strong>, not a diagnostic tool, and not a
        replacement for professional medical care. Nothing on this website
        should be interpreted as medical advice.
      </p>

      <h2>Your content</h2>
      <p>
        Right now, the only content you provide is your email address. It
        belongs to you. We don&apos;t claim any rights over it beyond using it to
        contact you about Memvella updates, as described in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Our content</h2>
      <p>
        Everything on this website — the text, design, illustrations, and brand
        — belongs to Memvella. Please don&apos;t copy or redistribute it without
        asking.
      </p>

      <h2>Availability</h2>
      <p>
        We do our best to keep this website running, but we can&apos;t guarantee
        100% uptime. Occasionally things break. We won&apos;t be liable for
        temporary outages.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If we make meaningful changes, we&apos;ll update this page and, where
        appropriate, let you know by email. We won&apos;t sneak anything past you.
      </p>

      <h2>Got questions?</h2>
      <p>
        If any of this is confusing, or you just want to talk, email us at{" "}
        <a href="mailto:hello@memvella.com">hello@memvella.com</a>.
      </p>
    </StaticPageLayout>
  );
}
