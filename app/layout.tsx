import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import Header from "@/components/Header";
import { SITE_INDEXABLE } from "@/shared/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "SwimCoach — Improve Your Lap Times & Fitness";
const description =
  "SwimCoach helps swimmers of all levels log their training, track goals, and learn stroke technique.";

export const metadata: Metadata = {
  metadataBase: new URL("https://swim-coach-ai.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "SwimCoach",
    type: "website",
  },
  // Belt-and-suspenders with app/robots.ts: robots.txt is honor-system and
  // some crawlers index pages before checking it, so this meta tag backs it
  // up. Both are driven by SITE_INDEXABLE (see lib/constants.ts).
  robots: SITE_INDEXABLE ? undefined : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <DisclaimerBanner />
        <Header />
        {children}
      </body>
    </html>
  );
}
