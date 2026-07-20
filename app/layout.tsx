import type { Metadata, Viewport } from "next";
import { Manrope, Michroma } from "next/font/google";
import "./globals.css";
import { envSiteUrl } from "@/lib/utils";

const display = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = envSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Toyota GR Supra Mk5 - Interactive Automotive Portfolio Concept",
  description:
    "An unofficial cinematic Toyota GR Supra Mk5 portfolio experience featuring scroll-controlled storytelling, performance highlights and interactive web animation.",
  alternates: {
    canonical: "/",
  },
  applicationName: "GR Supra Concept",
  openGraph: {
    title: "Toyota GR Supra Mk5 - Interactive Automotive Portfolio Concept",
    description:
      "An unofficial cinematic Toyota GR Supra Mk5 portfolio experience featuring scroll-controlled storytelling, performance highlights and interactive web animation.",
    url: "/",
    siteName: "GR Supra Concept",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1792,
        height: 1024,
        alt: "GR Supra interactive automotive portfolio concept social preview.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toyota GR Supra Mk5 - Interactive Automotive Portfolio Concept",
    description:
      "An unofficial cinematic Toyota GR Supra Mk5 portfolio experience featuring scroll-controlled storytelling, performance highlights and interactive web animation.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/icons/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
