import type { Metadata, Viewport } from "next";
import { Archivo, Great_Vibes, Playfair_Display } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { RevealObserver } from "@/components/reveal-observer";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Script zoals de lettering op het uithangbord
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Frituur Bredene — Bie Nonkel Steve",
    template: "%s | Bie Nonkel Steve",
  },
  description:
    "Bie Nonkel Steve: frituur in Bredene. Friet gebakken in ossenvet, snacks, burgers en stoofvlees. Afhalen of laten leveren.",
  applicationName: "Bie Nonkel Steve",
  openGraph: {
    type: "website",
    locale: "nl_BE",
    siteName: "Bie Nonkel Steve",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1c2024",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="nl-BE"
      className={`${archivo.variable} ${playfair.variable} ${greatVibes.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Activeert de invoeg-animaties enkel als JS draait; zonder JS blijft alles zichtbaar. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.reveal=''" }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden">
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
