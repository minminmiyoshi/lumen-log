'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  level: number; // 2 or 3
  text: string;
  id: string;
}

interface TableOfContentsProps {
  toc: TocItem[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0% -80% 0%' }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length < 2) return null;

  return (
    <nav
      aria-label="目次"
      className="my-8 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <p className="text-sm font-semibold text-[var(--color-muted)] mb-3 uppercase tracking-wider">
        目次
      </p>
      <ol className="space-y-1">
        {toc.map(({ id, text, level }) => (
          <li
            key={id}
            style={{ paddingLeft: level === 3 ? '1rem' : '0' }}
          >
            <a
              href={`#${id}`}
              className={[
                'block text-sm py-0.5 transition-colors',
                activeId === id
                  ? 'text-[var(--color-primary)] font-medium'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
              ].join(' ')}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
