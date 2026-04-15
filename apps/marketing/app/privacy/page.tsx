import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Memvella handles your data — written in plain language, not legalese.",
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p className="text-text-tertiary not-prose text-sm">Last updated: April 2026</p>

      <p>
        We know privacy policies are usually dense and hard to read. Ours is
        different. We want you to actually understand what happens with your
        information — especially because Memvella is designed for families caring
        for someone they love.
      </p>

      <h2>What Memvella is (and isn&apos;t)</h2>
      <p>
        Memvella is a <strong>digital wellness companion</strong>. It is not a
        medical device, not a diagnostic tool, and not a substitute for
        professional healthcare. We don&apos;t collect medical data, and we never
        will.
      </p>

      <h2>What we collect right now</h2>
      <p>
        Today, Memvella is in a <strong>waitlist-only</strong> phase. The only
        piece of personal information we collect is your{" "}
        <strong>email address</strong> — so we can let you know when Memvella is
        ready for you. That&apos;s it.
      </p>
      <ul>
        <li>We don&apos;t use tracking pixels or third-party analytics.</li>
        <li>We don&apos;t sell, share, or rent your email to anyone.</li>
        <li>We don&apos;t send spam. You&apos;ll only hear from us with meaningful updates.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Our website uses only the essential cookies needed to make the site work.
        No advertising cookies, no cross-site trackers.
      </p>

      <h2>Where your data lives</h2>
      <p>
        Your email address is stored securely using industry-standard encryption.
        We use trusted infrastructure providers with strong security practices.
      </p>

      <h2>Your rights</h2>
      <p>You can ask us to:</p>
      <ul>
        <li>
          <strong>Delete your data</strong> — email us and we&apos;ll remove your
          information completely.
        </li>
        <li>
          <strong>See what we have</strong> — we&apos;re happy to share. It&apos;s just
          your email.
        </li>
        <li>
          <strong>Unsubscribe</strong> — every email we send has an unsubscribe
          link. One click, no guilt.
        </li>
      </ul>

      <h2>When Memvella becomes a full product</h2>
      <p>
        When we move beyond the waitlist, this policy will be updated to reflect
        exactly what data the product collects, how it&apos;s used, and what controls
        you have. We will always notify you before any changes take effect, and
        we will always err on the side of collecting less.
      </p>

      <h2>Questions?</h2>
      <p>
        If anything here is unclear, or if you have a concern, reach out to us
        at{" "}
        <a href="mailto:privacy@memvella.com">privacy@memvella.com</a>. A real
        person will reply.
      </p>
    </StaticPageLayout>
  );
}
