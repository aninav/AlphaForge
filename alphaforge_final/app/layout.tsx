import type { Metadata } from "next";
import { DM_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlphaForge — Systematic Strategy Research Terminal",
  description:
    "Research market regimes, test strategies, and analyse event-driven volatility.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmMono.variable} ${playfair.variable}`}>
      <body className="bg-forge-bg text-forge-text antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
