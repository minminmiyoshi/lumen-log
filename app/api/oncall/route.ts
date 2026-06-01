import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const KV_KEY = 'oncall_data'

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = (globalThis as any).ONCALL_KV
    if (!kv) throw new Error('ONCALL_KV not found')
    const raw = await kv.get(KV_KEY)
    const data = raw ? JSON.parse(raw) : []
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = (globalThis as any).ONCALL_KV
    if (!kv) throw new Error('ONCALL_KV not found')

    const body = await request.json()
    const { date, type, patients, emergencies, fatigue, memo } = body

    if (!date || !type) {
      return NextResponse.json({ error: 'date と type は必須です' }, { status: 400 })
    }

    const raw = await kv.get(KV_KEY)
    const data: Record<string, unknown>[] = raw ? JSON.parse(raw) : []

    const entry = {
      date,
      type,
      patients: patients ?? null,
      emergencies: emergencies ?? null,
      fatigue: fatigue ?? null,
      memo: memo ?? '',
      garmin: null,
      updatedAt: new Date().toISOString(),
    }

    const existing = data.findIndex((r) => r.date === date)
    if (existing >= 0) {
      data[existing] = entry
    } else {
      data.push(entry)
    }

    data.sort((a, b) => (b.date as string).localeCompare(a.date as string))
    await kv.put(KV_KEY, JSON.stringify(data))

    return NextResponse.json({ ok: true, entry })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = (globalThis as any).ONCALL_KV
    if (!kv) throw new Error('ONCALL_KV not found')

    const { date } = await request.json()
    const raw = await kv.get(KV_KEY)
    const data: Record<string, unknown>[] = raw ? JSON.parse(raw) : []
    const filtered = data.filter((r) => r.date !== date)
    await kv.put(KV_KEY, JSON.stringify(filtered))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}