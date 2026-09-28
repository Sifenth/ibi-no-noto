import type { Metadata } from "next";
import { DM_Sans, Fraunces, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});

const notoSerifJp = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-japanese",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ibi no Noto — Tarik's Notes",
  description:
    "Notes on life in the UK, university life, and learning Japanese.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${fraunces.variable} ${notoSerifJp.variable}`}>{children}</body>
    </html>
  );
}
