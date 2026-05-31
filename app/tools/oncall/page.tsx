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
  fatigue: number | null
  memo: string
  garmin: GarminData | null
  updatedAt: string
}

const FATIGUE_LABELS: Record<number, string> = {
  1: '余裕',
  2: 'やや軽い',
  3: '普通',
  4: 'きつい',
  5: '限界',
}

function fatigueColor(v: number | null): string {
  if (v === null) return '#9ca3af'
  if (v <= 2) return '#34d399'
  if (v === 3) return '#facc15'
  return '#f87171'
}

function fmt(val: number | null, unit: string = '', digits: number = 1): string {
  if (val === null || isNaN(val)) return '-'
  return val.toFixed(digits) + unit
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
    patients: '',
    emergencies: '',
    fatigue: 3,
    memo: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/oncall')
    const data = await res.json()
    setEntries(data)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const existing = entries.find(e => e.date === form.date)
    if (existing) {
      setForm(f => ({
        ...f,
        patients: existing.patients?.toString() ?? '',
        emergencies: existing.emergencies?.toString() ?? '',
        fatigue: existing.fatigue ?? 3,
        memo: existing.memo ?? '',
      }))
    } else {
      setForm(f => ({
        ...f,
        patients: '',
        emergencies: '',
        fatigue: 3,
        memo: '',
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
          patients: form.patients !== '' ? parseInt(form.patients) : null,
          emergencies: form.emergencies !== '' ? parseInt(form.emergencies) : null,
          fatigue: form.fatigue,
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

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">日付</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">患者数</label>
            <input
              type="number"
              min={0}
              placeholder="例：12"
              value={form.patients}
              onChange={e => setForm(f => ({ ...f, patients: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">病棟急変数</label>
            <input
              type="number"
              min={0}
              placeholder="例：2"
              value={form.emergencies}
              onChange={e => setForm(f => ({ ...f, emergencies: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-2 block">
            主観的疲労度：
            <span style={{ color: fatigueColor(form.fatigue) }} className="font-semibold ml-1">
              {form.fatigue} — {FATIGUE_LABELS[form.fatigue]}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={form.fatigue}
            onChange={e => setForm(f => ({ ...f, fatigue: parseInt(e.target.value) }))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 余裕</span><span>3 普通</span><span>5 限界</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs text-gray-400 mb-1 block">メモ</label>
          <textarea
            rows={3}
            placeholder="特記事項・所感など"
            value={form.memo}
            onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          {message && (
            <span style={{ color: message === '保存しました' ? '#34d399' : '#f87171' }} className="text-sm">
              {message}
            </span>
          )}
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">履歴</h2>
      {entries.length === 0 && (
        <p className="text-gray-500 text-sm">記録がありません</p>
      )}
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.date} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold text-white">{entry.date}</span>
              <button
                onClick={() => handleDelete(entry.date)}
                className="text-xs text-gray-600 hover:text-red-400 transition"
              >
                削除
              </button>
            </div>
            <div className="flex gap-6 text-sm mb-3">
              {entry.patients !== null && (
                <div className="text-gray-400">患者 <span className="text-white font-medium">{entry.patients}人</span></div>
              )}
              {entry.emergencies !== null && (
                <div className="text-gray-400">急変 <span className="text-white font-medium">{entry.emergencies}件</span></div>
              )}
              {entry.fatigue !== null && (
                <div className="text-gray-400">
                  疲労度 <span style={{ color: fatigueColor(entry.fatigue) }} className="font-semibold">{entry.fatigue}/5</span>
                </div>
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