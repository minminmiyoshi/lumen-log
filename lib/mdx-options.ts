// lib/mdx-options.ts
// next-mdx-remote に渡すプラグイン設定を一箇所に集約

import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import type { MDXRemoteProps } from 'next-mdx-remote/rsc'

type SerializeOptions = NonNullable<MDXRemoteProps['options']>

export const MDX_OPTIONS: SerializeOptions = {
  // 自分自身が書いているMDXコンテンツのため、JS式属性（labels={...}等）を許可する
  blockJS: false,
  mdxOptions: {
    remarkPlugins: [
      remarkGfm,  // テーブル・チェックボックス・取り消し線 etc.
    ],
    rehypePlugins: [
      rehypeSlug,                    // 見出しにid付与
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',          // 見出し全体をリンクにする
          properties: {
            className: ['anchor-link'],
          },
        },
      ],
      rehypeHighlight,               // コードブロックのシンタックスハイライト
    ],
  },
}
