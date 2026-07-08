import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwimCoach — Improve Your Lap Times & Fitness",
  description:
    "SwimCoach helps swimmers of all levels log their training, track goals, and learn stroke technique.",
  // Soft-launch stage: keep crawlers out via meta tag too (robots.txt alone
  // is honor-system and some crawlers index pages before checking it).
  // Remove both this and app/robots.ts's disallow when publicly launching.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <DisclaimerBanner />
        <Header />
        {children}
      </body>
    </html>
  );
}
