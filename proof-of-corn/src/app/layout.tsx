import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proof of Corn",
  description: "Can AI grow corn? @fredwilson challenged @seth. This is our response. Real corn in Iowa, every decision made by Claude Code.",
  metadataBase: new URL("https://proofofcorn.com"),
  openGraph: {
    title: "Can AI grow corn?",
    description: "@fredwilson challenged @seth: AI can write code, but it can't affect the physical world. This is our response.",
    url: "https://proofofcorn.com",
    siteName: "Proof of Corn",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Can AI grow corn?",
    description: "@fredwilson challenged @seth: AI can write code, but it can't affect the physical world. This is our response.",
    creator: "@seth",
  },
  authors: [{ name: "Seth Goldstein", url: "https://x.com/seth" }],
  keywords: ["AI", "agriculture", "Claude Code", "autonomous", "corn", "farming", "vibe coding"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
