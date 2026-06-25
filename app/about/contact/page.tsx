import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | lumen-log",
  description: "lumen-log へのお問い合わせ先について。",
  alternates: {
    canonical: "https://lumen-log.com/about/contact",
  },
};

export default function Contact() {
  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px 120px" }}>

      <h1 style={{
        fontFamily: "Palatino, serif",
        fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
        fontWeight: 700,
        lineHeight: 1.4,
        marginBottom: "2.5rem",
        color: "var(--foreground)",
      }}>
        お問い合わせ
      </h1>

      <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem", color: "var(--foreground)", lineHeight: 1.9 }}>
        <p>
          当サイトに関するご質問・ご連絡・取材や寄稿のご依頼などは、
          下記のメールアドレスまでお願いいたします。
        </p>

        <div style={{
          padding: "1.5rem 1.75rem",
          border: "1px solid #E0DDD8",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.5)",
        }}>
          <div style={{
            fontSize: "0.7rem",
            fontFamily: "sans-serif",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "0.6rem",
          }}>
            Email
          </div>
          <a
            href="mailto:contact@lumen-log.com"
            style={{
              fontSize: "1.05rem",
              fontFamily: "sans-serif",
              color: "var(--foreground)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            contact@lumen-log.com
          </a>
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          内容によってはご返信に数日いただく場合や、ご返信を差し控える場合がございます。
          あらかじめご了承ください。
        </p>
      </section>

      <section style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: "1px solid #E0DDD8" }}>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href="/about" style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
            About
          </a>
          <a href="/about/privacy" style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
            プライバシーポリシー
          </a>
        </div>
      </section>

    </main>
  );
}
