import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xbase AI",
  description: "No-code AI agent platform for Cameroon businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}