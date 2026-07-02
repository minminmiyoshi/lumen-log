'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { NightShiftChart } from './NightShiftChart'
import NightShiftScatter from './NightShiftScatter'
import { Callout, StockChart } from './MdxComponents'
import { ArticleDiagram } from './ArticleDiagram'
import { StoryToArticle } from './StoryToArticle'
import { StoryEntry } from './StoryEntry'
import { StoryTips } from './StoryTips'

export interface MdxComponentData {
  id: string
  name: string
  props: Record<string, unknown>
  children: string | null
}

export interface TocItem {
  level: number
  text: string
  id: string
}

interface Props {
  html: string
  components: MdxComponentData[]
  toc?: TocItem[]
}

function renderComponent(c: MdxComponentData): ReactNode {
  switch (c.name) {
    case 'NightShiftChart':
      return <NightShiftChart {...(c.props as React.ComponentProps<typeof NightShiftChart>)} />
    case 'NightShiftScatter':
      return <NightShiftScatter {...(c.props as unknown as React.ComponentProps<typeof NightShiftScatter>)} />
    case 'Callout':
      return <Callout {...(c.props as React.ComponentProps<typeof Callout>)}>{c.children}</Callout>
    case 'ArticleDiagram':
      return <ArticleDiagram {...(c.props as React.ComponentProps<typeof ArticleDiagram>)} />
    case 'StockChart':
      return <StockChart {...(c.props as React.ComponentProps<typeof StockChart>)} />
    case 'StoryToArticle':
      return <StoryToArticle {...(c.props as unknown as React.ComponentProps<typeof StoryToArticle>)} />
    case 'StoryEntry':
      return <StoryEntry {...(c.props as unknown as React.ComponentProps<typeof StoryEntry>)} />
    case 'StoryTips':
      return <StoryTips {...(c.props as unknown as React.ComponentProps<typeof StoryTips>)} />
    default:
      return null
  }
}

function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <details
      open
      style={{
        margin: '0 0 48px 0',
        padding: '20px 24px',
        background: 'rgba(216, 210, 197, 0.18)',
        borderLeft: '2px solid var(--accent, #8B3A2C)',
        borderRadius: '0 4px 4px 0',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <summary
        style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          color: 'var(--ink, #1B1B19)',
          letterSpacing: '0.04em',
          listStyle: 'none',
          userSelect: 'none',
        }}
      >
        目次
      </summary>
      <nav style={{ marginTop: '16px' }}>
        <ol
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.8,
          }}
        >
          {items.map((item, i) => (
            <li
              key={i}
              style={{
                paddingLeft: item.level === 3 ? '20px' : '0',
              }}
            >
              <a
                href={`#${item.id}`}
                style={{
                  color: item.level === 2
                    ? 'var(--ink, #1B1B19)'
                    : 'var(--muted, #6E665B)',
                  textDecoration: 'none',
                  fontSize: item.level === 3 ? '0.8rem' : '0.875rem',
                  fontWeight: item.level === 2 ? 500 : 400,
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}

export function MdxRenderer({ html, components, toc }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mount React components into placeholders.
  // StrictMode 対策: 同じ DOM ノードに createRoot を二度呼ばないよう
  // WeakMap で既存 root を保持し、あれば render() を再実行する。
  const rootMapRef = useRef<WeakMap<Element, ReturnType<typeof createRoot>>>(
    new WeakMap()
  )

  useEffect(() => {
    if (!containerRef.current) return
    const rootMap = rootMapRef.current
    const usedNodes: Element[] = []

    for (const c of components) {
      const placeholder = containerRef.current.querySelector(
        `[data-mdx-placeholder="${c.id}"]`
      )
      if (placeholder) {
        let root = rootMap.get(placeholder)
        if (!root) {
          root = createRoot(placeholder)
          rootMap.set(placeholder, root)
        }
        root.render(renderComponent(c))
        usedNodes.push(placeholder)
      }
    }

    return () => {
      // ノードが DOM から外れたタイミングで unmount。
      // setTimeout 経由でないと StrictMode の二重実行で警告が出るため遅延。
      setTimeout(() => {
        for (const node of usedNodes) {
          if (!node.isConnected) {
            const root = rootMap.get(node)
            if (root) {
              root.unmount()
              rootMap.delete(node)
            }
          }
        }
      }, 0)
    }
  }, [components])

  // Scroll-triggered fade-in for figures and chart containers
  useEffect(() => {
    if (!containerRef.current) return
    if (typeof IntersectionObserver === 'undefined') return

    const targets = containerRef.current.querySelectorAll<HTMLElement>(
      '.mdx-content figure, .mdx-content .chart-container, [data-mdx-placeholder]'
    )

    // Initialize hidden state
    targets.forEach((el) => {
      el.classList.add('mdx-fade-in')
    })

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('mdx-fade-in-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [html, components])

  return (
    <>
      <style>{`
        .mdx-fade-in {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .mdx-fade-in-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .mdx-fade-in {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
        .mdx-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 64px 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border, #D8D2C5);
          color: var(--ink, #1B1B19);
          letter-spacing: 0.01em;
        }
        .mdx-content h2:first-child {
          margin-top: 0;
        }
        .mdx-content h3 {
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.5;
          margin: 40px 0 16px 0;
          color: var(--ink, #1B1B19);
          position: relative;
          padding-left: 14px;
        }
        .mdx-content h3::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.4em;
          bottom: 0.4em;
          width: 3px;
          background: var(--accent, #8B3A2C);
          border-radius: 2px;
        }
        .mdx-content p {
          margin: 0 0 20px 0;
        }
        .mdx-content strong {
          font-weight: 600;
          color: var(--ink, #1B1B19);
        }
        .mdx-content hr {
          margin: 48px 0;
          border: none;
          border-top: 1px solid var(--border, #D8D2C5);
        }
        .mdx-content details.references-block {
          margin-top: 48px;
          padding: 16px 20px;
          background: rgba(216, 210, 197, 0.12);
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
        }
        .mdx-content details.references-block > summary {
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--muted, #6E665B);
          letter-spacing: 0.04em;
          list-style: none;
          user-select: none;
        }
        .mdx-content details.references-block > summary::-webkit-details-marker {
          display: none;
        }
        .mdx-content details.references-block > summary::before {
          content: '▸ ';
          display: inline-block;
          transition: transform 0.2s ease;
        }
        .mdx-content details.references-block[open] > summary::before {
          transform: rotate(90deg);
        }
        .mdx-content .references-body {
          margin-top: 16px;
          font-size: 0.8rem;
          line-height: 1.7;
          color: var(--muted, #6E665B);
        }
        .mdx-content .references-body ol {
          padding-left: 24px;
        }
        .mdx-content .references-body li {
          margin-bottom: 6px;
        }
        .mdx-content .references-body em {
          color: var(--ink, #1B1B19);
        }
      `}</style>
      {toc && toc.length > 0 && <TableOfContents items={toc} />}
      <div
        ref={containerRef}
        className="mdx-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
