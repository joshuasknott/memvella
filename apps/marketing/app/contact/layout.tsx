import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: 'Contact Us',
  description: "Get in touch with the Memvella team - we'd love to hear from you.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
