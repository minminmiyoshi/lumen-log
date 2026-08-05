"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const links = [
  { href: "/sangyoi", key: "sangyoi" },
  { href: "/health", key: "health" },
  { href: "/about", key: "about" },
];

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("common.nav");

  return (
    <header className="sticky top-0 z-50 bg-washi border-b border-hairline">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif font-medium text-[1.1rem] text-sumi">
          Lumen-log <span className="text-bengara">©</span>
        </Link>

        <nav className="hidden md:flex gap-7 font-mono text-[11px] items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sumi hover:text-bengara transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}
          <Link
            href="/search"
            aria-label="検索"
            className="text-sumi hover:text-bengara transition-colors flex items-center"
          >
            <SearchIcon />
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-[5px] p-1 bg-transparent border-0 cursor-pointer"
          aria-label="menu"
        >
          <span className="block w-[22px] h-[2px] bg-sumi transition-transform" style={{ transform: open ? "translateY(7px) rotate(45deg)" : "none" }} />
          <span className="block w-[22px] h-[2px] bg-sumi transition-opacity" style={{ opacity: open ? 0 : 1 }} />
          <span className="block w-[22px] h-[2px] bg-sumi transition-transform" style={{ transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-hairline px-6 py-4 flex flex-col gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-mono text-sm text-sumi hover:text-bengara transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="font-mono text-sm text-sumi hover:text-bengara transition-colors flex items-center gap-2"
          >
            <SearchIcon />
            Search
          </Link>
        </div>
      )}
    </header>
  );
}
