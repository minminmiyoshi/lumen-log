"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/tools", label: "Tools" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        borderBottom: "1px solid #E8E4DF",
        backgroundColor: "var(--background)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* サイト名 */}
        <Link
          href="/"
          style={{
            fontFamily: "Palatino, serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--foreground)",
          }}
        >
          Lumen Log
        </Link>

        {/* デスクトップ：リンク一覧 */}
        <nav
          style={{
            display: "flex",
            gap: "28px",
          }}
          className="hidden-mobile"
        >
          {links.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: "0.875rem",
                color: "var(--indigo)",
                fontFamily: "sans-serif",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* モバイル：ハンバーガー */}
        <button
          onClick={() => setOpen(!open)}
          className="show-mobile"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "none",
            flexDirection: "column",
            gap: "5px",
          }}
          aria-label="メニュー"
        >
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              backgroundColor: "var(--foreground)",
              transition: "transform 0.2s",
              transform: open ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              backgroundColor: "var(--foreground)",
              transition: "opacity 0.2s",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "2px",
              backgroundColor: "var(--foreground)",
              transition: "transform 0.2s",
              transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* モバイル：ドロップダウン */}
      {open && (
        <div
          className="show-mobile"
          style={{
            borderTop: "1px solid #E8E4DF",
            padding: "16px 24px 24px",
            display: "none",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {links.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: "1rem",
                color: "var(--indigo)",
                fontFamily: "sans-serif",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}