"use client";

// components/ArticleUtils.tsx
// 記事ページ用の軽量UX2点をまとめたクライアントコンポーネント。
// (1) スクロールトップボタン: 一定量スクロールしたら右下にそっと出る
// (2) リンクコピーボタン: ShareButtonsの並びに置けるが、ここでは独立利用も可能
// 世界観を崩さないよう、普段はグレーで控えめ、必要時のみ存在を主張する。

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="ページ上部へ戻る"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "1px solid #D8D2C5",
        background: "var(--background, #fff)",
        color: "var(--muted)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        lineHeight: 0,
        transition: "color 0.2s ease, border-color 0.2s ease",
        zIndex: 40,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--foreground)";
        e.currentTarget.style.borderColor = "var(--foreground)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--muted)";
        e.currentTarget.style.borderColor = "#D8D2C5";
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードAPI非対応環境では何もしない
    }
  };

  return (
    <button
      onClick={copy}
      aria-label="リンクをコピー"
      style={{
        background: "transparent",
        border: "none",
        color: copied ? "var(--foreground)" : "var(--muted)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.7rem",
        fontFamily: "sans-serif",
        letterSpacing: "0.04em",
        padding: 0,
        transition: "color 0.2s ease",
      }}
    >
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          COPIED
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          COPY
        </>
      )}
    </button>
  );
}
