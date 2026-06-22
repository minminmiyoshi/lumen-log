'use client'

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

type ChartType = 'bar' | 'line' | 'horizontalBar'

interface DataSet {
  label: string
  data: number[]
  color?: string
}

interface NightShiftChartProps {
  type?: ChartType
  labels?: string[] | string
  datasets?: DataSet[] | string
  yLabel?: string
  ySuffix?: string
  caption?: string
  height?: number
}

export function NightShiftChart(props: NightShiftChartProps) {
  const {
    type = 'bar',
    labels: labelsProp,
    datasets: datasetsProp,
    yLabel,
    ySuffix = '',
    caption,
    height = 320,
  } = props

  let labels: string[] = []
  let datasets: DataSet[] = []
  try {
    labels = typeof labelsProp === 'string' ? JSON.parse(labelsProp) : labelsProp ?? []
    datasets = typeof datasetsProp === 'string' ? JSON.parse(datasetsProp) : datasetsProp ?? []
  } catch {
    return null
  }

  if (!labels.length || !datasets.length) return null

  // Rechartsが求める [{label: "A", series1: 1, series2: 2}, ...] 形式に変換
  const data = labels.map((label, i) => {
    const row: Record<string, string | number> = { label }
    datasets.forEach((ds) => { row[ds.label] = ds.data[i] ?? 0 })
    return row
  })

  const isHorizontal = type === 'horizontalBar'
  const isLine = type === 'line'

  const tickStyle = { fontSize: 11, fontFamily: 'sans-serif', fill: '#94a3b8' }
  const fmtTick = (val: number | string) => `${val}${ySuffix}`

  const commonMargin = isHorizontal
    ? { top: 8, right: 24, left: 8, bottom: 8 }
    : { top: 8, right: 8, left: 8, bottom: 8 }

  const tooltipFormatter = (value: unknown, name: string) =>
    [`${value}${ySuffix}`, name]

  const legendProps = datasets.length > 1
    ? { iconType: 'circle' as const, iconSize: 8, wrapperStyle: { fontSize: '0.75rem' } }
    : undefined

  const chart = isLine ? (
    <LineChart data={data} margin={commonMargin}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
      <XAxis dataKey="label" tick={tickStyle} />
      <YAxis
        tick={tickStyle}
        tickFormatter={fmtTick}
        label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
      />
      <Tooltip formatter={tooltipFormatter} />
      {legendProps && <Legend {...legendProps} />}
      {datasets.map((ds, i) => (
        <Line
          key={ds.label}
          type="monotone"
          dataKey={ds.label}
          stroke={ds.color || COLORS[i % COLORS.length]}
          strokeWidth={2}
          dot={{ r: 4, fill: ds.color || COLORS[i % COLORS.length] }}
        />
      ))}
    </LineChart>
  ) : isHorizontal ? (
    <BarChart data={data} layout="vertical" margin={commonMargin}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
      <XAxis
        type="number"
        tick={tickStyle}
        tickFormatter={fmtTick}
        label={yLabel ? { value: yLabel, position: 'insideBottom', offset: -4, style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
      />
      <YAxis
        type="category"
        dataKey="label"
        tick={tickStyle}
        width={180}
      />
      <Tooltip formatter={tooltipFormatter} />
      {legendProps && <Legend {...legendProps} />}
      {datasets.map((ds, i) => (
        <Bar
          key={ds.label}
          dataKey={ds.label}
          fill={ds.color || COLORS[i % COLORS.length]}
          radius={[0, 3, 3, 0]}
        />
      ))}
    </BarChart>
  ) : (
    <BarChart data={data} margin={commonMargin}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
      <XAxis dataKey="label" tick={tickStyle} />
      <YAxis
        tick={tickStyle}
        tickFormatter={fmtTick}
        label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
      />
      <Tooltip formatter={tooltipFormatter} />
      {legendProps && <Legend {...legendProps} />}
      {datasets.map((ds, i) => (
        <Bar
          key={ds.label}
          dataKey={ds.label}
          fill={ds.color || COLORS[i % COLORS.length]}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </BarChart>
  )

  return (
    <figure style={{ margin: '32px 0' }}>
      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
      {caption && (
        <figcaption style={{
          fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px',
          lineHeight: 1.5, fontFamily: 'sans-serif',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
