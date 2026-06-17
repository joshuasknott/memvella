import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Figtree } from "next/font/google";
import { ConvexClientProvider } from "./providers";
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

export const metadata: Metadata = {
  title: "Memvella",
  description: "Digital wellness companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="font-family min-h-full flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
