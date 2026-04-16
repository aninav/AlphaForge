import type { Metadata } from "next";
import { DM_Mono, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

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
  metadataBase: new URL("https://alphaforge.ai"),
  title: {
    default: "AlphaForge | Systematic Strategy Research Terminal",
    template: "%s | AlphaForge",
  },
  description:
    "AlphaForge is a systematic strategy research terminal for testing market regimes, validating trading ideas, and tracking event-driven volatility with clearer workflow context.",
  keywords: [
    "systematic trading terminal",
    "quant research platform",
    "strategy backtesting software",
    "market regime analysis",
    "event-driven volatility",
    "trading research blog",
  ],
  applicationName: "AlphaForge",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AlphaForge | Systematic Strategy Research Terminal",
    description:
      "Research market regimes, test strategies, and explore event-driven volatility in a purpose-built quant workflow.",
    url: "https://alphaforge.ai",
    siteName: "AlphaForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlphaForge | Systematic Strategy Research Terminal",
    description:
      "A quant research terminal for market regime analysis, strategy testing, and decision-grade workflow clarity.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="bg-forge-bg text-forge-text antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
