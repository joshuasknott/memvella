import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memvella Internal",
  description: "Internal operations, support, and QA tools for Memvella.",
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
