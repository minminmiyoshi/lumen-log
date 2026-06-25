import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Lumen Log",
  description: "夜勤救急医が自分の身体データを記録し、シフトワークと健康・資産・時間の関係を一次情報として残すサイトについて。",
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
        夜勤医師が、自分の身体を<br />
        データとして観測する記録。
      </h1>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>Who I am</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--foreground)", lineHeight: 1.9 }}>
          <p>
            救急医をしている。当直が多く、不規則な夜勤を何年も続けてきた。
            夜働き、昼に眠る生活は、身体に確実に負荷をかける。
            その負荷が自分の身体に何を起こしているのか——それを「なんとなく」ではなく、データで知りたいと思ったのが、このサイトの出発点だ。
          </p>
          <p>
            Garminを着けて睡眠・心拍・身体活動を記録し、体組成を測り、当直のたびにコンディションの変化を追っている。
            夜勤明けに心拍はどう乱れるのか、睡眠の質はどこまで落ちるのか、回復には何日かかるのか。
            医師としての知識と、自分自身の長期データ。この2つが重なる場所に、たぶん価値がある。
          </p>
          <p>
            子が2人いて、妻がいる。家族との時間は有限で、だからこそ自分の身体と時間をどう守るかを真剣に考えるようになった。
            この生活そのものが、このサイトのコンテンツになっている。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>What this site is about</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--foreground)", lineHeight: 1.9 }}>
          <p>
            このサイトの中心は、<strong>夜勤（シフトワーク）と健康データ</strong>だ。
            夜勤が身体に与える影響を、医師の視点とウェアラブルの実データの両面から整理していく。
          </p>
          <p>
            既存の健康アプリは「平均的な人」を前提に作られている。
            だが夜勤者の身体は、概日リズムが常に揺さぶられる特殊な環境にある。
            一般論ではなく、夜勤当事者の文脈に合った記録と分析が必要だと感じている。
          </p>
          <p>
            扱うのは、自分の身体で実際に起きたこと。
            睡眠、心拍、体組成、当直パフォーマンス——それらを継続的に観測し、
            再現性のある形に落とし込むことを目指している。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>How I think</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--foreground)", lineHeight: 1.9 }}>
          <p>
            救急の現場では、不完全な情報の中で「何を優先するか」を瞬時に決める必要がある。
            単なる暗記では対応できない。構造で考え、因果で整理し、優先順位をつける——
            その思考の癖が、健康データの読み方にもそのまま出ている。
          </p>
          <p>
            数値を眺めるだけでは意味がない。
            「なぜこの変化が起きたのか」「次にどう動けば改善するのか」まで踏み込んで初めて、データは判断の材料になる。
            断定はしない。確率で考え、最悪のシナリオから逆算する。これも現場で身についた習慣だ。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>Beyond health</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--foreground)", lineHeight: 1.9 }}>
          <p>
            身体の最適化を突き詰めていくと、自然と「時間」と「お金」の話につながる。
            夜勤の拘束から少しずつ自由になるための資産形成も、このサイトのもう一つのテーマとして扱っている。
            ただし主役はあくまで身体データで、資産の話はその延長線上にある。
          </p>
          <p>
            投資ではマクロ・需給・ストーリーを起点に判断する。
            医療で培った「リスクから逆算する」思考を、そのまま資産運用にも持ち込んでいる。
            このあたりの記録は <a href="/money" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>Money</a> にまとめている。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <SectionLabel>Topics</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            { label: "夜勤と健康", desc: "シフトワークが身体に与える影響を医師目線で整理。" },
            { label: "身体データ解析", desc: "Garmin×当直パフォーマンスの継続記録。" },
            { label: "セルフ最適化", desc: "睡眠・心拍・体組成を観測し、改善につなげる。" },
            { label: "救急医療", desc: "現場の判断思考。医師目線の一次情報。" },
            { label: "資産形成", desc: "夜勤からの自由度を上げるための運用記録。" },
            { label: "ツール自作", desc: "AIで作る自分専用の可視化・分析ツール群。" },
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
        <a href="/health" style={{
          padding: "0.75rem 1.75rem",
          background: "var(--foreground)",
          color: "var(--background)",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          fontFamily: "sans-serif",
        }}>
          Health を見る
        </a>
        <a href="/money" style={{
          padding: "0.75rem 1.75rem",
          border: "1px solid var(--foreground)",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          fontFamily: "sans-serif",
        }}>
          Money を見る
        </a>
      </section>

      <section style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #E0DDD8" }}>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href="/about/privacy" style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
            プライバシーポリシー
          </a>
          <a href="/about/contact" style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
            お問い合わせ
          </a>
        </div>
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
