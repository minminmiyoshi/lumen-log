// lib/redirects.ts
// 旧URL → 新URLへの301リダイレクト

export const legacyRedirects = [
  // 旧ブログ → ゾーン別
  { source: '/blog/truth-about-night-shift-health-risks', destination: '/health/blog/truth-about-night-shift-health-risks', permanent: true },
  { source: '/blog/first-post', destination: '/health/blog/first-post', permanent: true },
  // money 退避記事（2026-07-14 リニューアルで軸外に）→ トップへ直行
  { source: '/blog/llm-habit-formation', destination: '/', permanent: true },
  { source: '/blog/fire-strategy-for-er-doctor', destination: '/', permanent: true },
  { source: '/blog/passion-conditions-fire-purpose', destination: '/', permanent: true },
  // 旧一覧
  { source: '/blog', destination: '/health', permanent: true },
  // 旧ツール
  { source: '/tools', destination: '/health', permanent: true },
  { source: '/tools/health', destination: '/health/dashboard', permanent: true },
  { source: '/tools/oncall', destination: '/health/oncall', permanent: true },
  { source: '/tools/portfolio', destination: '/money/portfolio', permanent: true },
  { source: '/tools/simulator', destination: '/money/simulator', permanent: true },
  // money ゾーンを畳む（2026-07-14 リニューアル）。ツール(simulator/portfolio)は温存。
  { source: '/money', destination: '/', permanent: true },
  { source: '/money/blog', destination: '/', permanent: true },
  { source: '/money/blog/fire-strategy-for-er-doctor', destination: '/', permanent: true },
  { source: '/money/blog/passion-conditions-fire-purpose', destination: '/', permanent: true },
  { source: '/money/blog/llm-habit-formation', destination: '/', permanent: true },
]
