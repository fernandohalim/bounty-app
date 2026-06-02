import type { Metadata, Viewport } from "next";
import { Unbounded, Plus_Jakarta_Sans, Martian_Mono } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-unbounded",
});
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const mono = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-martian",
});

export const metadata: Metadata = {
  title: "Bounty - Expense Tracker!",
  description:
    "Spend together. An expense tracker that turns budgeting into a game.",
};

export const viewport: Viewport = {
  themeColor: "#0a0913",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
