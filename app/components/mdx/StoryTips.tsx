'use client'

import { getStoryTips } from '@/data/story-tips'

interface Props {
  episode: number
  chapter: number
}

const JP_NUMERALS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const jpNum = (n: number) => JP_NUMERALS[n] ?? String(n)

export function StoryTips({ episode, chapter }: Props) {
  const data = getStoryTips(episode, chapter)
  if (!data) return null

  const { insights = [], tips = [], items = [], is_episode_summary } = data

  if (insights.length === 0 && tips.length === 0 && items.length === 0) return null

  const insightsHeading = is_episode_summary ? '詩織が見つけたこと' : 'この夜、見つけたこと'
  const tipsHeading = is_episode_summary
    ? `Episode ${episode}　詩織が変えた${jpNum(tips.length)}つ`
    : '詩織が試したこと'
  const itemsHeading = '詩織が使ったもの'
  const eyebrow = is_episode_summary ? `EPISODE ${episode}　覚え書き` : 'この話の覚え書き'

  return (
    <aside
      className="story-tips"
      style={{
        margin: '64px 0 32px 0',
        padding: '28px 32px',
        borderLeft: '2px solid var(--accent, #8B3A2C)',
        background: 'rgba(216, 210, 197, 0.10)',
        borderRadius: '0 4px 4px 0',
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent, #8B3A2C)',
          marginBottom: '24px',
        }}
      >
        {eyebrow}
      </div>

      {insights.length > 0 && (
        <section style={{ marginBottom: tips.length || items.length ? '28px' : 0 }}>
          <h4
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--ink, #1B1B19)',
              margin: '0 0 12px 0',
            }}
          >
            {insightsHeading}
          </h4>
          {insights.map((text, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Shippori Mincho B1', serif",
                fontSize: '0.92rem',
                lineHeight: 1.8,
                color: 'var(--ink, #1B1B19)',
                margin: '0 0 8px 0',
              }}
            >
              {text}
            </p>
          ))}
        </section>
      )}

      {tips.length > 0 && (
        <section style={{ marginBottom: items.length ? '28px' : 0 }}>
          <h4
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--ink, #1B1B19)',
              margin: '0 0 12px 0',
            }}
          >
            {tipsHeading}
          </h4>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tips.map((tip, i) => (
              <li
                key={i}
                style={{
                  padding: '12px 0',
                  borderBottom:
                    i < tips.length - 1 ? '1px solid rgba(216, 210, 197, 0.4)' : 'none',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    color: 'var(--muted, #6E665B)',
                    minWidth: '20px',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Shippori Mincho B1', serif",
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      color: 'var(--ink, #1B1B19)',
                    }}
                  >
                    {tip.action}
                  </div>
                  {tip.note && (
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.78rem',
                        color: 'var(--muted, #6E665B)',
                        marginTop: '4px',
                        lineHeight: 1.5,
                      }}
                    >
                      {tip.note}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {items.length > 0 && (
        <section>
          <h4
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--ink, #1B1B19)',
              margin: '0 0 12px 0',
            }}
          >
            {itemsHeading}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Shippori Mincho B1', serif",
                      fontSize: '0.9rem',
                      color: 'var(--ink, #1B1B19)',
                      marginBottom: '2px',
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      color: 'var(--muted, #6E665B)',
                    }}
                  >
                    ¥{item.priceFrom.toLocaleString()}〜
                  </div>
                </div>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      color: 'var(--accent, #8B3A2C)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    見る →
                  </a>
                ) : (
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.7rem',
                      color: 'var(--muted, #6E665B)',
                    }}
                  >
                    準備中
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}
