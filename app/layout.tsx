import type { Metadata, Viewport } from "next";
import {
  Pixelify_Sans,
  Plus_Jakarta_Sans,
  Martian_Mono,
} from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const display = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixel",
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
  metadataBase: new URL("https://YOUR-DOMAIN.vercel.app"),
  title: "Bounty",
  description:
    "Spend together. An expense tracker that turns budgeting into a game.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bounty",
  },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "Bounty",
    description: "Spend together. Make budgeting a game.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bounty",
    description: "Spend together. Make budgeting a game.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0913",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>{" "}
    </html>
  );
}
