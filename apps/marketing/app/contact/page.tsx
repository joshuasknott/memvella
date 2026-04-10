import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Memvella team — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <StaticPageLayout title="Contact Us">

      <p>
        We're a small team building something we care deeply about. Whether
        you're a family member exploring options for a parent, someone with
        questions about how Memvella works, or just curious — we'd love to hear
        from you. No automated replies. A real person will get back to you.
      </p>

      <h2>General Inquiries</h2>
      <p>
        Questions about Memvella, the waitlist, partnerships, or anything else:
      </p>
      <p>
        <a href="mailto:hello@memvella.com">hello@memvella.com</a>
      </p>

      <h2>Privacy Concerns</h2>
      <p>
        Questions about your data, deletion requests, or anything related to
        how we handle your information:
      </p>
      <p>
        <a href="mailto:privacy@memvella.com">privacy@memvella.com</a>
      </p>
    </StaticPageLayout>
  );
}
