'use client'

import { useState, useEffect, useCallback } from 'react'

type GarminData = {
  sleep_duration_h: number | null
  deep_sleep_h: number | null
  rem_sleep_h: number | null
  hrv_last_night: number | null
  hrv_weekly_avg: number | null
  resting_hr: number | null
  body_battery_max: number | null
  body_battery_min: number | null
  stress_avg: number | null
}

type OncallEntry = {
  date: string
  type: string
  patients: number | null
  emergencies: number | null
  ambulance: number | null
  walkin: number | null
  fatigueIn: number | null
  fatigueOut: number | null
  moodIn: number | null
  moodOut: number | null
  sleepiness: number | null
  napMinutes: number | null
  workload: number | null
  memo: string
  garmin: GarminData | null
  updatedAt: string
}

const FATIGUE_LABELS: Record<number, string> = {
  1: '余裕', 2: 'やや軽い', 3: '普通', 4: 'きつい', 5: '限界',
}
const MOOD_LABELS: Record<number, string> = {
  1: '最悪', 2: '悪い', 3: '普通', 4: '良い', 5: '最高',
}
const SLEEPINESS_LABELS: Record<number, string> = {
  1: '全くなし', 2: '少し', 3: '普通', 4: '強い', 5: '限界',
}
const WORKLOAD_LABELS: Record<number, string> = {
  1: '暇', 2: 'やや軽い', 3: '普通', 4: '忙しい', 5: '超多忙',
}

function scaleColor(v: number | null, invert = false): string {
  if (v === null) return '#9ca3af'
  const high = invert ? v <= 2 : v >= 4
  const low = invert ? v >= 4 : v <= 2
  if (high) return '#34d399'
  if (low) return '#f87171'
  return '#facc15'
}

function fmt(val: number | null, unit = '', digits = 1): string {
  if (val === null || isNaN(val)) return '-'
  return val.toFixed(digits) + unit
}

function SliderField({
  label, value, onChange, labels, invert = false,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  labels: Record<number, string>
  invert?: boolean
}) {
  return (
    <div className="mb-4">
      <label className="text-xs text-gray-400 mb-1 block">
        {label}：
        <span style={{ color: scaleColor(value, invert) }} className="font-semibold ml-1">
          {value} — {labels[value]}
        </span>
      </label>
      <input
        type="range" min={1} max={5} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1 {labels[1]}</span><span>3 {labels[3]}</span><span>5 {labels[5]}</span>
      </div>
    </div>
  )
}

function GarminBadge({ garmin }: { garmin: GarminData | null }) {
  if (!garmin) return <span className="text-xs text-gray-500">Garminデータなし</span>
  return (
    <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-400">
      <div>睡眠 <span className="text-white font-medium">{fmt(garmin.sleep_duration_h, 'h')}</span></div>
      <div>HRV <span className="text-white font-medium">{fmt(garmin.hrv_last_night, '', 0)}</span></div>
      <div>安静HR <span className="text-white font-medium">{fmt(garmin.resting_hr, 'bpm', 0)}</span></div>
      <div>深睡眠 <span className="text-white font-medium">{fmt(garmin.deep_sleep_h, 'h')}</span></div>
      <div>REM <span className="text-white font-medium">{fmt(garmin.rem_sleep_h, 'h')}</span></div>
      <div>ストレス <span className="text-white font-medium">{fmt(garmin.stress_avg, '', 0)}</span></div>
      <div>BB最大 <span className="text-white font-medium">{fmt(garmin.body_battery_max, '', 0)}</span></div>
      <div>BB最小 <span className="text-white font-medium">{fmt(garmin.body_battery_min, '', 0)}</span></div>
    </div>
  )
}

export default function OncallPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [entries, setEntries] = useState<OncallEntry[]>([])
  const [form, setForm] = useState({
    date: today,
    ambulance: '', walkin: '',
    fatigueIn: 3, fatigueOut: 3,
    moodIn: 3, moodOut: 3,
    sleepiness: 3,
    napMinutes: '',
    workload: 3,
    memo: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/oncall')
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch {
      setEntries([])
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const existing = entries.find(e => e.date === form.date)
    if (existing) {
      setForm(f => ({
        ...f,
        ambulance: existing.ambulance?.toString() ?? '',
        walkin: existing.walkin?.toString() ?? '',
        fatigueIn: existing.fatigueIn ?? 3,
        fatigueOut: existing.fatigueOut ?? 3,
        moodIn: existing.moodIn ?? 3,
        moodOut: existing.moodOut ?? 3,
        sleepiness: existing.sleepiness ?? 3,
        napMinutes: existing.napMinutes?.toString() ?? '',
        workload: existing.workload ?? 3,
        memo: existing.memo ?? '',
      }))
    } else {
      setForm(f => ({
        ...f,
        ambulance: '', walkin: '',
        fatigueIn: 3, fatigueOut: 3,
        moodIn: 3, moodOut: 3,
        sleepiness: 3, napMinutes: '', workload: 3, memo: '',
      }))
    }
  }, [form.date, entries])

  async function handleSubmit() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/oncall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          type: '夜勤',
          ambulance: form.ambulance !== '' ? parseInt(form.ambulance) : null,
          walkin: form.walkin !== '' ? parseInt(form.walkin) : null,
          fatigueIn: form.fatigueIn,
          fatigueOut: form.fatigueOut,
          moodIn: form.moodIn,
          moodOut: form.moodOut,
          sleepiness: form.sleepiness,
          napMinutes: form.napMinutes !== '' ? parseInt(form.napMinutes) : null,
          workload: form.workload,
          memo: form.memo,
        }),
      })
      if (res.ok) {
        setMessage('保存しました')
        load()
      } else {
        setMessage('エラーが発生しました')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(date: string) {
    if (!confirm(`${date} の記録を削除しますか？`)) return
    await fetch('/api/oncall', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    load()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">当直パフォーマンス記録</h1>
      <p className="text-gray-400 text-sm mb-8">Garminデータは日付で自動紐付け</p>

      <div className="bg-gray-900 rounded-2xl p-6 mb-10 border border-gray-800">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">新規入力 / 編集</h2>

        {/* 日付 */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">日付</label>
          <input type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 応需数 */}
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 mt-2">応需数</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">救急車</label>
            <input type="number" min={0} placeholder="例：5"
              value={form.ambulance}
              onChange={e => setForm(f => ({ ...f, ambulance: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Walk-in</label>
            <input type="number" min={0} placeholder="例：8"
              value={form.walkin}
              onChange={e => setForm(f => ({ ...f, walkin: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 仮眠 */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">仮眠時間（分）</label>
          <input type="number" min={0} placeholder="例：60"
            value={form.napMinutes}
            onChange={e => setForm(f => ({ ...f, napMinutes: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 入り前スライダー */}
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 mt-4">入り前</p>
        <SliderField label="疲労度" value={form.fatigueIn}
          onChange={v => setForm(f => ({ ...f, fatigueIn: v }))}
          labels={FATIGUE_LABELS} invert={true} />
        <SliderField label="気分・メンタル" value={form.moodIn}
          onChange={v => setForm(f => ({ ...f, moodIn: v }))}
          labels={MOOD_LABELS} />

        {/* 夜間スライダー */}
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 mt-4">深夜2〜3時</p>
        <SliderField label="眠気" value={form.sleepiness}
          onChange={v => setForm(f => ({ ...f, sleepiness: v }))}
          labels={SLEEPINESS_LABELS} invert={true} />

        {/* 明け後スライダー */}
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 mt-4">明け後</p>
        <SliderField label="疲労度" value={form.fatigueOut}
          onChange={v => setForm(f => ({ ...f, fatigueOut: v }))}
          labels={FATIGUE_LABELS} invert={true} />
        <SliderField label="気分・メンタル" value={form.moodOut}
          onChange={v => setForm(f => ({ ...f, moodOut: v }))}
          labels={MOOD_LABELS} />
        <SliderField label="業務負荷感" value={form.workload}
          onChange={v => setForm(f => ({ ...f, workload: v }))}
          labels={WORKLOAD_LABELS} invert={true} />

        {/* メモ */}
        <div className="mb-5 mt-4">
          <label className="text-xs text-gray-400 mb-1 block">メモ（特記事項・任意）</label>
          <textarea rows={3} placeholder="特記事項・所感など"
            value={form.memo}
            onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSubmit} disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition">
            {saving ? '保存中...' : '保存'}
          </button>
          {message && (
            <span style={{ color: message === '保存しました' ? '#34d399' : '#f87171' }} className="text-sm">
              {message}
            </span>
          )}
        </div>
      </div>

      {/* 履歴 */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">履歴</h2>
      {entries.length === 0 && <p className="text-gray-500 text-sm">記録がありません</p>}
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.date} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="font-semibold text-white">{entry.date}</span>
              <button onClick={() => handleDelete(entry.date)}
                className="text-xs text-gray-600 hover:text-red-400 transition">削除</button>
            </div>

            {/* 応需数 */}
            <div className="flex gap-6 text-sm mb-3">
              {entry.ambulance !== null && (
                <div className="text-gray-400">救急車 <span className="text-white font-medium">{entry.ambulance}件</span></div>
              )}
              {entry.walkin !== null && (
                <div className="text-gray-400">Walk-in <span className="text-white font-medium">{entry.walkin}件</span></div>
              )}
              {entry.napMinutes !== null && (
                <div className="text-gray-400">仮眠 <span className="text-white font-medium">{entry.napMinutes}分</span></div>
              )}
            </div>

            {/* スコア */}
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              {entry.fatigueIn !== null && (
                <div className="text-gray-400">疲労(入) <span style={{ color: scaleColor(entry.fatigueIn, true) }} className="font-semibold">{entry.fatigueIn}/5</span></div>
              )}
              {entry.fatigueOut !== null && (
                <div className="text-gray-400">疲労(明) <span style={{ color: scaleColor(entry.fatigueOut, true) }} className="font-semibold">{entry.fatigueOut}/5</span></div>
              )}
              {entry.workload !== null && (
                <div className="text-gray-400">負荷 <span style={{ color: scaleColor(entry.workload, true) }} className="font-semibold">{entry.workload}/5</span></div>
              )}
              {entry.moodIn !== null && (
                <div className="text-gray-400">気分(入) <span style={{ color: scaleColor(entry.moodIn) }} className="font-semibold">{entry.moodIn}/5</span></div>
              )}
              {entry.moodOut !== null && (
                <div className="text-gray-400">気分(明) <span style={{ color: scaleColor(entry.moodOut) }} className="font-semibold">{entry.moodOut}/5</span></div>
              )}
              {entry.sleepiness !== null && (
                <div className="text-gray-400">眠気 <span style={{ color: scaleColor(entry.sleepiness, true) }} className="font-semibold">{entry.sleepiness}/5</span></div>
              )}
            </div>

            {entry.memo && (
              <p className="text-gray-400 text-sm mb-3 border-l-2 border-gray-700 pl-3">{entry.memo}</p>
            )}
            <GarminBadge garmin={entry.garmin} />
          </div>
        ))}
      </div>
    </div>
  )
}
