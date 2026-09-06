import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Riot's display face, used for the wordmark only. */
const league = localFont({
  src: "./fonts/League.otf",
  variable: "--font-league",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rdraft — tirage au sort de draft League of Legends",
  description:
    "Ajoutez vos alliés, lancez le tirage : chaque joueur reçoit un champion et une lane au hasard.",
  applicationName: "Rdraft",
  openGraph: {
    title: "Rdraft",
    description: "Tirage au sort de champions et de lanes pour votre équipe.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${notoSans.variable} ${league.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
