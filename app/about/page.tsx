export default function About() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20">
      
      {/* キャッチコピー */}
      <h1 className="text-3xl font-bold leading-snug mb-8">
        悶々とする救急医の、<br />投資と資産と身体の記録
      </h1>

      {/* プロフィール */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Profile</h2>
        <ul className="space-y-3 text-gray-700">
          <li>🏥 救急医（ゆるゆる移行中）</li>
          <li>📈 投資家（マクロ・個別株・ショートも）</li>
          <li>🔥 サイドFIRE志向（数年以内が目標）</li>
          <li>👨‍👩‍👧‍👦 既婚・子2人</li>
          <li>⌚ Garminで自己計測中</li>
          <li>🏚️ ど田舎の実家の相続について悶々と考え中</li>
          <li>🌙 夜勤中は米国マーケットを見て悶々</li>
        </ul>
      </section>

      {/* サイトについて */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">About this site</h2>
        <p className="text-gray-700 leading-relaxed">
          一次情報の記録場所として作った。役に立てば嬉しいし、立たなくても構わない。
        </p>
      </section>

      {/* 導線 */}
      <section className="flex gap-4">
        <a href="/blog" className="px-6 py-3 bg-black text-white rounded-full text-sm hover:opacity-80 transition">
          ブログを読む
        </a>
        <a href="/tools" className="px-6 py-3 border border-black rounded-full text-sm hover:bg-gray-50 transition">
          ツールを使う
        </a>
      </section>

    </main>
  )
}