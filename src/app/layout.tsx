import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pulse — Social Portfolio Intelligence for Bags",
  description:
    "The social finance layer that transforms creator token trading into a multiplayer community experience. Live heatmap, social leaderboard, squad portfolios, and AI briefings.",
  keywords: ["bags", "solana", "creator tokens", "social finance", "heatmap", "portfolio"],
  openGraph: {
    title: "Pulse — Social Portfolio Intelligence for Bags",
    description: "Make creator finance social. Live heatmap, squads, and AI briefings for Bags tokens.",
    type: "website",
    siteName: "Pulse",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
