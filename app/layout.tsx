import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono, Shippori_Mincho_B1 } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
});
const shippori = Shippori_Mincho_B1({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-shippori",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumen-log.com"),
  title: {
    default: "lumen-log | 夜勤を科学する — 交代勤務者の健康と産業保健",
    template: "%s | lumen-log",
  },
  description:
    "交代勤務者の健康を、夜勤当事者である医師が科学と実測で支えるサイト。夜勤と睡眠・概日リズム・栄養の一次情報と、産業保健の視点から書いた記事を公開しています。",
  verification: {
    google: "ofLWHA1G4WgByzKoplxxt9k8xyAzXYO9ESRpI3IrnEA",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://lumen-log.com",
    siteName: "lumen-log",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "lumen-log",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yuruyuru_ER",     // ← Xのハンドルを確認して変更
    creator: "@yuruyuru_ER",  // ← 同上
  },
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "lumen-log RSS Feed" },
      ],
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="ja"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable} ${shippori.variable}`}
    >
      <body>
        <ScrollProgress />
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
        </NextIntlClientProvider>
        <GoogleAnalytics gaId="G-BFT2N6W3M3" />
      </body>
    </html>
  );
}
