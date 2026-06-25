'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[var(--color-primary)] transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// 使い方:
// app/layout.tsx の <body> 直下に <ScrollProgress /> を追加するだけ。
// 記事ページ以外（TOPページ等）でも表示されるが、スクロール量がほぼ0なので視覚的に問題なし。
// 記事ページのみに限定したい場合は、app/health/[slug]/layout.tsx 等に移動する。
