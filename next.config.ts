import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 旧ブログ → ゾーン別
      { source: '/blog/truth-about-night-shift-health-risks', destination: '/health/blog/truth-about-night-shift-health-risks', permanent: true },
      { source: '/blog/llm-habit-formation', destination: '/money/blog/llm-habit-formation', permanent: true },
      { source: '/blog/fire-strategy-for-er-doctor', destination: '/money/blog/fire-strategy-for-er-doctor', permanent: true },
      { source: '/blog/passion-conditions-fire-purpose', destination: '/money/blog/passion-conditions-fire-purpose', permanent: true },
      // 旧一覧
      { source: '/blog', destination: '/health', permanent: true },
      // 旧ツール
      { source: '/tools', destination: '/health', permanent: true },
      { source: '/tools/health', destination: '/health/dashboard', permanent: true },
      { source: '/tools/oncall', destination: '/health/oncall', permanent: true },
      { source: '/tools/portfolio', destination: '/money/portfolio', permanent: true },
      { source: '/tools/simulator', destination: '/money/simulator', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
