import type { Metadata } from "next";
import "./globals.css";

const marketingTitle = "Memvella | Voice-First Digital Wellness Companion";
const marketingDescription =
  "Memvella is a voice-first digital wellness companion for Organisers, Members, Tablet Users, and Independent Users.";

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
