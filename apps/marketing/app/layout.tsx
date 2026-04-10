import type { Metadata } from "next";
import "./globals.css";

const marketingTitle = "Memvella | Voice-First Memory Companion";
const marketingDescription =
  "Memvella is a voice-first memory companion that helps seniors maintain independence while giving families peace of mind.";

export const metadata: Metadata = {
  title: {
    default: marketingTitle,
    template: "%s | Memvella",
  },
  description: marketingDescription,
  applicationName: "Memvella",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: marketingTitle,
    description: marketingDescription,
    siteName: "Memvella",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: marketingTitle,
    description: marketingDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
