/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://lumen-log.com',
    generateRobotsTxt: true,
    outDir: './public',
    // 非コンテンツURL（APIルート・検索インデックス）はサイトマップから除外する
    // /search と /health/oncall は noindex 指定のため、サイトマップに載せると
    // Search Console で「サイトマップ内のページが登録されない」警告の原因になる
    exclude: ['/api/*', '/search-index.json', '/feed.xml', '/search', '/health/oncall'],
  }