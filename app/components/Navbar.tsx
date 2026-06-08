"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const links = [
  { href: "/", key: "home" },
  { href: "/blog", key: "blog" },
  { href: "/tools", key: "tools" },
  { href: "/about", key: "about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("common.nav");

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

        <nav
          style={{ display: "flex", gap: "28px" }}
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
              {t(link.key)}
            </Link>
          ))}
        </nav>

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
          aria-label={t("home")}
        >
          <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "var(--foreground)", transition: "transform 0.2s", transform: open ? "translateY(7px) rotate(45deg)" : "none" }} />
          <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "var(--foreground)", transition: "opacity 0.2s", opacity: open ? 0 : 1 }} />
          <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "var(--foreground)", transition: "transform 0.2s", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

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
              {t(link.key)}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
