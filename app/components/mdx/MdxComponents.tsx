// MDX内のHTML要素をカスタムコンポーネントで上書きする
import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'

type CalloutType = 'info' | 'warn' | 'danger' | 'tip'

const CALLOUT_STYLES: Record<CalloutType, { border: string; bg: string; icon: string }> = {
  info:   { border: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  icon: 'ℹ' },
  tip:    { border: '#4ade80', bg: 'rgba(74,222,128,0.08)',  icon: '💡' },
  warn:   { border: '#facc15', bg: 'rgba(250,204,21,0.08)',  icon: '⚠' },
  danger: { border: '#f87171', bg: 'rgba(248,113,113,0.08)', icon: '🚨' },
}

export function Callout({ type = 'info', children }: { type?: CalloutType; children: React.ReactNode }) {
  const style = CALLOUT_STYLES[type]
  return (
    <div style={{ borderLeft: `3px solid ${style.border}`, background: style.bg, padding: '0.75rem 1rem', borderRadius: '0 6px 6px 0', margin: '1.5rem 0', fontSize: '0.9rem' }}>
      <span style={{ marginRight: '0.5rem' }}>{style.icon}</span>
      {children}
    </div>
  )
}

export function StockChart({ symbol, note }: { symbol: string; note?: string }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', margin: '1.5rem 0', background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem', color: '#94a3b8' }}>
      📈 チャート: <strong style={{ color: '#e2e8f0' }}>{symbol}</strong>
      {note && <span style={{ marginLeft: '0.5rem' }}>— {note}</span>}
    </div>
  )
}

export const MDX_COMPONENTS: MDXComponents = {
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http')
    if (isExternal) return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    return <Link href={href ?? '#'}>{children}</Link>
  },
  pre: ({ children, ...props }) => <div className="code-block-wrapper"><pre {...props}>{children}</pre></div>,
  table: ({ children, ...props }) => <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}><table {...props}>{children}</table></div>,
  Callout,
  StockChart,
}
