import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Figtree } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-senior",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const figtree = Figtree({
  variable: "--font-family",
  subsets: ["latin"],
});

const marketingTitle = "Memvella | Digital Wellness Companion";
const marketingDescription =
  "Memvella is a voice-first digital wellness companion for family and trusted supporter routines, memories, and a calm companion tablet experience.";

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
    <html
      lang="en"
      className={`${atkinson.variable} ${figtree.variable} antialiased`}
    >
      <body className="font-family">{children}</body>
    </html>
  );
}
