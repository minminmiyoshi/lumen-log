import type { Metadata } from "next";
import SimulatorClient from "./SimulatorClient";

export const metadata: Metadata = {
  title: "FIREシミュレーター | Lumen Log",
  description: "個人資産・法人資産・副業収入を統合したFIREシミュレーター。医師の収入構造に合わせたプリセット付き。",
  openGraph: {
    title: "FIREシミュレーター | Lumen Log",
    description: "個人資産・法人資産・副業収入を統合したFIREシミュレーター。",
    url: "https://lumen-log.com/tools/simulator",
  },
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}