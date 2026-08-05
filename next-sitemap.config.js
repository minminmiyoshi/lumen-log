/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://lumen-log.com',
    generateRobotsTxt: true,
    outDir: './public',
    // 非コンテンツURL（APIルート・検索インデックス）はサイトマップから除外する
    exclude: ['/api/*', '/search-index.json', '/feed.xml'],
  }