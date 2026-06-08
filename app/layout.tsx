import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

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
    <html lang="ja">
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
