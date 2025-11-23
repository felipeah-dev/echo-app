import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { PatternDetectionRoot } from "@/components/custom/PatternDetectionRoot";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Echo - Predictive Sync",
  description: "Echo: watsonx Orchestrate + predictive automations",
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
        <PatternDetectionRoot>{children}</PatternDetectionRoot>
      </body>
    </html>
  );
}
