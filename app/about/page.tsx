import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Lumen Log",
  description: "夜勤救急医・投資家・セルフ最適化マニアの自己紹介とサイトについて",
};

export default function About() {
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px 120px" }}>

      <h1 style={{
        fontFamily: "Palatino, serif",
        fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
        fontWeight: 700,
        lineHeight: 1.4,
        marginBottom: "3rem",
        color: "var(--foreground)",
      }}>
        悶々とする救急医の、<br />
        投資と資産と身体の記録。
      </h1>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>Who I am</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--foreground)", lineHeight: 1.9 }}>
          <p>
            救急医をしている。当直が多く、夜中に走り回りながら夜明けに米国市場が開くのを待つ、という生活をもう何年も続けている。
            医師という職業は安定しているようで、時間だけは自由にならない。
            その不自由さへの反発が、投資への関心とFIREへの志向につながった。
          </p>
          <p>
            子が2人いる。妻もいる。家族との時間をもっと持ちたいと思い続けて、それが資産形成を急がせる。
            完全リタイアには興味がない。ただ、「働かないと死ぬ」状態から抜け出したい——それだけだ。
          </p>
          <p>
            Garminを着けて自分の身体データを記録し、ポートフォリオを眺め、当直の合間に古民家をどうするか悶々と考えている。
            この生活自体が、このサイトのコンテンツになっている。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>Investment philosophy</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--foreground)", lineHeight: 1.9 }}>
          <p>
            マクロから入る。金利・地政学・エネルギー構造の変化を起点に、セクターと銘柄を選ぶ。
            「ストーリーがある」「需給が変わる」「マクロ追い風がある」——この3つが重なったときだけ動く。
          </p>
          <p>
            ロングだけでなくショートも使う。市場が間違えているときに逆を張るのは怖いが、
            その怖さを乗り越えるための論拠を積み上げることが、投資思考の鍛錬だと思っている。
          </p>
          <p>
            断定はしない。確率で考える。downside を常に見積もる。
            医療の世界で「見逃してはいけない疾患から除外する」訓練を積んできたせいか、
            投資でも「最悪シナリオから逆算する」癖がついている。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>Why this site</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--foreground)", lineHeight: 1.9 }}>
          <p>
            noteとXで発信してきたが、プラットフォームに依存することへの漠然とした不安があった。
            自分の思考と記録を、自分でコントロールできる場所に置きたかった。
          </p>
          <p>
            同時に、ツールを作りたかった。資産シミュレーター、健康ダッシュボード、当直記録——
            既存のアプリでは「自分の文脈」が反映できない。医師の収入構造、夜勤と睡眠の関係、
            FIRE目標から逆算した積立額。これらを一箇所で扱えるものが欲しかった。
          </p>
          <p>
            プログラミングはほぼできない。AIと対話しながら作っている。
            その過程も含めて、このサイト自体がコンテンツだと思っている。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>Topics</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            { label: "投資・資産形成", desc: "マクロ・個別株・ショート。思考の記録。" },
            { label: "FIRE戦略", desc: "サイドFIREへの設計と実況中継。" },
            { label: "健康管理", desc: "Garminデータ×当直パフォーマンスの記録。" },
            { label: "救急医療", desc: "現場の判断思考。医師目線の一次情報。" },
            { label: "古民家・不動産", desc: "実家相続とAirbnb転換の悶々記録。" },
            { label: "ツール自作", desc: "AIで作る自分専用の最適化ツール群。" },
          ].map(({ label, desc }) => (
            <div key={label} style={{
              padding: "1rem 1.2rem",
              border: "1px solid #E0DDD8",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.5)",
            }}>
              <div style={{ fontFamily: "Palatino, serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.3rem" }}>
                {label}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <a href="/blog" style={{
          padding: "0.75rem 1.75rem",
          background: "var(--foreground)",
          color: "var(--background)",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          fontFamily: "sans-serif",
        }}>
          ブログを読む
        </a>
        <a href="/tools" style={{
          padding: "0.75rem 1.75rem",
          border: "1px solid var(--foreground)",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          fontFamily: "sans-serif",
        }}>
          ツールを使う
        </a>
      </section>

    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "0.7rem",
      fontFamily: "sans-serif",
      fontWeight: 700,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: "1.2rem",
    }}>
      {children}
    </div>
  );
}