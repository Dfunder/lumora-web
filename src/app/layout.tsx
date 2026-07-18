import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
  title: "Lumora - Decentralized Fundraising Platform",
  description: "Democratizing fundraising through blockchain technology. Create, fund, and manage campaigns with complete transparency and trust.",
  keywords: ["blockchain", "fundraising", "crowdfunding", "ethereum", "web3", "campaigns"],
  authors: [{ name: "Lumora Team" }],
  openGraph: {
    title: "Lumora - Decentralized Fundraising Platform",
    description: "Democratizing fundraising through blockchain technology. Create, fund, and manage campaigns with complete transparency and trust.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumora - Decentralized Fundraising Platform",
    description: "Democratizing fundraising through blockchain technology. Create, fund, and manage campaigns with complete transparency and trust.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <AppProviders>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
