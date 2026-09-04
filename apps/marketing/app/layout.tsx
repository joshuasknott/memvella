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

const marketingTitle = "Memvella | Their stories. Your connection.";
const marketingDescription =
  "A friendly voice, familiar memories and gentle reminders for older people, with family close by. Join the Memvella early-access waitlist.";

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
