import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono, Shippori_Mincho_B1 } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
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
  title: "Lumen Log",
  description: "An ER doctor's system for surviving night shifts",
  verification: {
    google: "ofLWHA1G4WgByzKoplxxt9k8xyAzXYO9ESRpI3IrnEA",
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
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
        </NextIntlClientProvider>
        <GoogleAnalytics gaId="G-BFT2N6W3M3" />
      </body>
    </html>
  );
}