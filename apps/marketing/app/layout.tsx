import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const figtree = localFont({
  src: "./fonts/figtree-latin-variable.woff2",
  variable: "--font-family",
  weight: "300 900",
  display: "swap",
});

const marketingTitle = "Memvella | A little company. A familiar world.";
const marketingDescription =
  "Familiar stories, gentle routines and a voice to talk to. A companion tablet for older people, made personal by family. Join the Memvella waitlist.";

export const metadata: Metadata = {
  metadataBase: new URL("https://memvella.me"),
  title: {
    default: marketingTitle,
    template: "%s | Memvella",
  },
  description: marketingDescription,
  applicationName: "Memvella",
  openGraph: {
    title: marketingTitle,
    description: marketingDescription,
    siteName: "Memvella",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Memvella — a little company, a familiar world",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: marketingTitle,
    description: marketingDescription,
    images: ["/opengraph-image.png"],
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
      className={`${figtree.variable} antialiased`}
    >
      <body className="font-family">{children}</body>
    </html>
  );
}
