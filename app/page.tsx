import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-washi text-sumi">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-8 md:py-12">

        {/* Meta row */}
        <div className="flex justify-between font-mono text-[11px] text-mist tracking-wide">
          <span>GMT+9</span>
          <span>est. 2025</span>
        </div>

        {/* Hero */}
        <section className="mt-14 md:mt-24 grid grid-cols-[1fr_40px] md:grid-cols-[1fr_50px] gap-3 items-start">
          <h1 className="font-serif text-[44px] md:text-[64px] lg:text-[80px] leading-[1.05] font-normal tracking-tight m-0">
            Night-shift<br />
            <span className="italic">physician,</span><br />
            investor &amp;<br />
            optimiser.
          </h1>
          <div
            className="font-mincho text-[13px] md:text-base text-mist pt-2 h-fit"
            style={{ writingMode: 'vertical-rl', letterSpacing: '0.5em' }}
          >
            夜勤医師
          </div>
        </section>

        {/* Subhead + role */}
        <div className="mt-9 md:mt-12 grid md:grid-cols-[1.5fr_1fr] gap-7 items-start">
          <p className="font-mincho text-[15px] md:text-base leading-[1.9] text-sumi-soft m-0">
            身体、資本、そして時間を、<br />
            不確実性のなかで最適化していく — 一医師の実験的記録。
          </p>
          <div className="font-mono text-[11px] text-mist leading-[1.95]">
            <div className="mb-1 text-sumi">role —</div>
            <div>physician</div>
            <div>investor</div>
            <div>operator</div>
          </div>
        </div>

        {/* Bengara accent */}
        <div className="mt-11 flex items-center gap-4">
          <span className="inline-block w-16 h-[1.5px] bg-bengara"></span>
          <span className="font-mono text-[11px] text-mist">CW(W-01) · selected</span>
        </div>

        {/* Selected Works */}
        <section className="mt-7">
          <div className="flex justify-between items-baseline pb-3 border-b border-sumi">
            <h2 className="font-serif text-2xl font-normal m-0">Selected works</h2>
            <span className="font-mono text-[11px] text-mist">2025 —</span>
          </div>

          {selectedWorks.map((work, i) => (
            <Link
              key={work.num}
              href={work.href}
              className={`block py-5 px-2 -mx-2 hover:bg-washi-deep transition-colors ${
                i < selectedWorks.length - 1 ? 'border-b border-hairline' : ''
              }`}
            >
              <div className="flex items-baseline gap-3 md:gap-4">
                <span className="font-mono text-[11px] text-mist w-6 shrink-0">{work.num}</span>
                <span className="font-mincho text-[16px] md:text-[17px] flex-1 leading-snug">{work.title}</span>
                <span className="font-mono text-[11px] text-mist hidden sm:inline">{work.category}</span>
                <span className="font-mono text-[11px] text-mist hidden sm:inline ml-3">{work.year}</span>
              </div>
              <div className="font-mono text-[10.5px] text-mist mt-1.5 ml-9 sm:hidden">
                {work.category} · {work.year}
              </div>
            </Link>
          ))}
        </section>

        {/* Instruments */}
        <section className="mt-10">
          <div className="flex justify-between items-baseline pb-3 border-b border-sumi">
            <h2 className="font-serif text-2xl font-normal m-0">
              Instruments <span className="font-mincho text-sm text-mist ml-2">— 道具</span>
            </h2>
            <span className="font-mono text-[11px] text-mist">soon</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-5">
            {instruments.map((inst) =>
              inst.href ? (
                <Link
                  key={inst.id}
                  href={inst.href}
                  className="p-5 border border-hairline rounded bg-washi-deep/40 hover:border-bengara transition-colors block"
                >
                  <div className="font-mono text-[10.5px] text-bengara mb-3">{inst.id}</div>
                  <div className="font-serif text-[17px] leading-[1.25] mb-2">{inst.title}</div>
                  <div className="font-mincho text-xs text-mist leading-relaxed">{inst.subtitle}</div>
                </Link>
              ) : (
                <div
                  key={inst.id}
                  className="p-5 border border-hairline rounded bg-washi-deep/40 opacity-70"
                >
                  <div className="font-mono text-[10.5px] text-mist mb-3">{inst.id} · soon</div>
                  <div className="font-serif text-[17px] leading-[1.25] mb-2">{inst.title}</div>
                  <div className="font-mincho text-xs text-mist leading-relaxed">{inst.subtitle}</div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex justify-between items-baseline">
          <span className="font-mincho text-xs text-mist">
            © 2025 — ゆるく、しずかに、続ける記録
          </span>
          <span className="font-mono text-[11px] text-mist">scroll —</span>
        </footer>

      </div>
    </main>
  )
}

// 連載小説枠。note 未公開のあいだは本番ビルドから除外する（dev でのみ表示）。
const storyWork = {
  num: '02',
  title: '連載小説「Lumen」— 夜勤を支える人たちの物語',
  category: 'fiction',
  year: '2026',
  href: '/health/stories',
}

const baseWorks = [
  {
    num: '01',
    title: '夜勤者に向けた、健康と最適化の発信',
    category: 'series',
    year: '2025',
    href: '/health',
  },
  {
    num: '02',
    title: '夜勤の身体データ、定点観測',
    category: 'data',
    year: '2025',
    href: '/health/dashboard',
  },
  {
    num: '03',
    title: '投資判断の構造化、思考ログ',
    category: 'journal',
    year: '2025',
    href: '/money',
  },
]

// 小説枠を 2番目に差し込み、番号を振り直す。
const selectedWorks = [baseWorks[0], storyWork, baseWorks[1], baseWorks[2]]
  .map((w, i) => ({ ...w, num: String(i + 1).padStart(2, '0') }))

const instruments = [
  { id: 'inst · 01', title: 'Shift damage scorer', subtitle: '夜勤ダメージ累積', href: '/health/tools/shift-damage-score' },
  { id: 'inst · 02', title: 'Shift cost calculator', subtitle: '機会費用試算', href: null },
  { id: 'inst · 03', title: 'Routine diagnostic', subtitle: '退勤後リカバリー', href: null },
]