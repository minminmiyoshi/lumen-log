'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { NightShiftChart } from './NightShiftChart'
import { Callout, StockChart } from './MdxComponents'

export interface MdxComponentData {
  id: string
  name: string
  props: Record<string, unknown>
  children: string | null
}

interface Props {
  html: string
  components: MdxComponentData[]
}

function renderComponent(c: MdxComponentData): ReactNode {
  switch (c.name) {
    case 'NightShiftChart':
      return <NightShiftChart {...(c.props as React.ComponentProps<typeof NightShiftChart>)} />
    case 'Callout':
      return <Callout {...(c.props as React.ComponentProps<typeof Callout>)}>{c.children}</Callout>
    case 'StockChart':
      return <StockChart {...(c.props as React.ComponentProps<typeof StockChart>)} />
    default:
      return null
  }
}

export function MdxRenderer({ html, components }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const roots: ReturnType<typeof createRoot>[] = []

    for (const c of components) {
      const placeholder = containerRef.current.querySelector(
        `[data-mdx-placeholder="${c.id}"]`
      )
      if (placeholder) {
        const root = createRoot(placeholder)
        root.render(renderComponent(c))
        roots.push(root)
      }
    }

    return () => {
      // Defer unmount to avoid React race during re-render
      setTimeout(() => roots.forEach((r) => r.unmount()), 0)
    }
  }, [components])

  return (
    <div
      ref={containerRef}
      className="mdx-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
