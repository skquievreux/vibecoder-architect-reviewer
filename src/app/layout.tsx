import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "VibeCoder Architect | Automated Governance & Portfolio Intelligence",
    template: "%s | VibeCoder Architect",
  },
  description: "Automate your software governance. Analyze tech stacks, track costs, and generate architectural decision records (ADRs) for your entire portfolio in seconds.",
  keywords: ["Software Governance", "Portfolio Intelligence", "Tech Stack Analysis", "ADR Generator", "Developer Tools", "VibeCoder", "Architecture Review"],
  authors: [{ name: "Steffen Quievreux", url: "https://quievreux.de" }],
  creator: "Quievreux Consulting",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vibecoder.quievreux.de",
    siteName: "VibeCoder Architect",
    title: "VibeCoder Architect | Automated Governance & Portfolio Intelligence",
    description: "Analysiere dein gesamtes Software-Portfolio in Sekunden. Automatische Architektur-Reviews und Kosten-Tracking.",
    images: [
      {
        url: "/og-image.png", // We should create this or use a placeholder
        width: 1200,
        height: 630,
        alt: "VibeCoder Architect Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeCoder Architect | Automated Governance",
    description: "Automate your software governance. Analyze tech stacks, track costs, and generate ADRs.",
    creator: "@skquievreux",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import VersionDisplay from "./components/VersionDisplay";
import SessionProvider from "./components/SessionProvider";
import ThemeProvider from "./components/ThemeProvider";
import GlobalSearch from "./components/GlobalSearch";

// ... (imports)

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <GlobalSearch />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <VersionDisplay />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
