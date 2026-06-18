import { NextRequest, NextResponse } from 'next/server'

const KV_KEY = 'oncall_data'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKV(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (globalThis as any)[Symbol.for('__cloudflare-context__')]
  if (!ctx?.env?.ONCALL_KV) throw new Error('ONCALL_KV not available in context')
  return ctx.env.ONCALL_KV
}

export async function GET() {
  try {
    const kv = getKV()
    const raw = await kv.get(KV_KEY)
    const data = raw ? JSON.parse(raw) : []
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const kv = getKV()
    const body = await request.json()
    const {
      date, type,
      patients, emergencies,
      ambulance, walkin,
      fatigueIn, fatigueOut,
      moodIn, moodOut,
      sleepiness,
      napMinutes,
      workload,
      memo,
    } = body

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
      ambulance: ambulance ?? null,
      walkin: walkin ?? null,
      fatigueIn: fatigueIn ?? null,
      fatigueOut: fatigueOut ?? null,
      moodIn: moodIn ?? null,
      moodOut: moodOut ?? null,
      sleepiness: sleepiness ?? null,
      napMinutes: napMinutes ?? null,
      workload: workload ?? null,
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
    const kv = getKV()
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
