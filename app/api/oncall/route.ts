import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const ONCALL_PATH = path.join(process.cwd(), 'data/oncall.json')
const GARMIN_PATH = '/Users/mytk/garmin_sync/output/garmin_master.csv'

function readOncall() {
  if (!fs.existsSync(ONCALL_PATH)) return []
  return JSON.parse(fs.readFileSync(ONCALL_PATH, 'utf-8'))
}

function getGarminByDate(date: string) {
  try {
    console.log('GARMIN_PATH:', GARMIN_PATH)
    console.log('exists:', fs.existsSync(GARMIN_PATH))
    console.log('looking for date:', date)
    const content = fs.readFileSync(GARMIN_PATH, 'utf-8')
    const rows = parse(content, { columns: true, skip_empty_lines: true, bom: true })
    const row = rows.find((r: Record<string, string>) => r.date === date)
    if (!row) return null
    return {
      sleep_duration_h: parseFloat(row.sleep_duration_h) || null,
      deep_sleep_h: parseFloat(row.deep_sleep_h) || null,
      rem_sleep_h: parseFloat(row.rem_sleep_h) || null,
      hrv_last_night: parseFloat(row.hrv_last_night) || null,
      hrv_weekly_avg: parseFloat(row.hrv_weekly_avg) || null,
      resting_hr: parseFloat(row.resting_hr) || null,
      body_battery_max: parseFloat(row.body_battery_max) || null,
      body_battery_min: parseFloat(row.body_battery_min) || null,
      stress_avg: parseFloat(row.stress_avg) || null,
    }
  } catch (e) {
    console.error('Garmin read error:', e)
    return null
  }
}

export async function GET() {
  const data = readOncall()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date, type, patients, emergencies, fatigue, memo } = body

  if (!date || !type) {
    return NextResponse.json({ error: 'date と type は必須です' }, { status: 400 })
  }

  const garmin = getGarminByDate(date)
  const data = readOncall()

  const existing = data.findIndex((r: Record<string, unknown>) => r.date === date)
  const entry = {
    date,
    type,
    patients: patients ?? null,
    emergencies: emergencies ?? null,
    fatigue: fatigue ?? null,
    memo: memo ?? '',
    garmin,
    updatedAt: new Date().toISOString(),
  }

  if (existing >= 0) {
    data[existing] = entry
  } else {
    data.push(entry)
  }

  data.sort((a: Record<string, string>, b: Record<string, string>) => b.date.localeCompare(a.date))
  fs.writeFileSync(ONCALL_PATH, JSON.stringify(data, null, 2))

  return NextResponse.json({ ok: true, entry })
}

export async function DELETE(req: NextRequest) {
  const { date } = await req.json()
  const data = readOncall()
  const filtered = data.filter((r: Record<string, unknown>) => r.date !== date)
  fs.writeFileSync(ONCALL_PATH, JSON.stringify(filtered, null, 2))
  return NextResponse.json({ ok: true })
}
