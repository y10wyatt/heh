import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sibling Showdown",
  description: "A playful two-person weight-loss competition app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
