import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Lumen Log",
  description: "悶々とする救急医の、投資と資産と身体の記録",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Navbar />
        {children}
        <GoogleAnalytics gaId="G-BFT2N6W3M3" />
      </body>
    </html>
  );
}