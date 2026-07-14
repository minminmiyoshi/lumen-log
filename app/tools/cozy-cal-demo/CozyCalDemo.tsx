"use client";

import { useState } from "react";

// Cozy Cal の「入力の核」だけを忠実に再現した簡易版。
// 本物の挙動：プリセットを選ぶ → カレンダーで日をタップ → まとめて登録。
// 夜勤は入り→翌朝の明けで2日にまたがる帯として表示される。
type Preset = {
  key: string;
  name: string;
  color: string;
  ink: string; // 文字色
  days: number;
  time: string; // 表示用
};

const PRESETS: Preset[] = [
  { key: "night", name: "夜勤", color: "#6366f1", ink: "#fff", days: 2, time: "17:00→翌09:00" },
  { key: "day-h", name: "日勤（夫）", color: "#3b82f6", ink: "#fff", days: 1, time: "8:45–17:15" },
  { key: "day-w", name: "日勤（妻）", color: "#ec4899", ink: "#fff", days: 1, time: "9:00–16:30" },
  { key: "off", name: "休み", color: "#e3dfea", ink: "#514b5e", days: 1, time: "" },
];

type Ev = { start: number; days: number; presetKey: string };

const DOW = ["月", "火", "水", "木", "金", "土", "日"];
const DAYS = 14; // 2週間ぶんのミニカレンダー

export default function CozyCalDemo() {
  const [presetKey, setPresetKey] = useState<string>("night");
  const [selected, setSelected] = useState<number[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);

  const preset = PRESETS.find((p) => p.key === presetKey)!;

  const pickPreset = (k: string) => {
    setPresetKey(k);
    setSelected([]);
  };

  const tapDay = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  const register = () => {
    const add: Ev[] = selected.map((start) => ({ start, days: preset.days, presetKey }));
    setEvents((e) => [...e, ...add]);
    setSelected([]);
  };

  // 各セルに載る「予定セグメント」を組み立てる。
  // 夜勤(days=2)は start=入り、start+1=明け の2セグメントに割る。
  const segFor = (dayIdx: number) => {
    const out: { p: Preset; part: "single" | "in" | "out" }[] = [];
    for (const ev of events) {
      const p = PRESETS.find((x) => x.key === ev.presetKey)!;
      if (ev.days === 2) {
        if (ev.start === dayIdx) out.push({ p, part: "in" });
        else if (ev.start + 1 === dayIdx) out.push({ p, part: "out" });
      } else if (ev.start === dayIdx) {
        out.push({ p, part: "single" });
      }
    }
    return out;
  };

  return (
    <div className="min-h-screen bg-washi text-sumi">
      <div className="max-w-[560px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="flex items-center gap-4 mb-6">
          <span className="inline-block w-12 h-[1.5px] bg-bengara" />
          <span className="font-mono text-[11px] text-bengara tracking-wide">
            demo — no sign-up
          </span>
        </div>
        <h1 className="font-serif text-[28px] md:text-[36px] leading-[1.15] font-normal m-0">
          Cozy Cal の入力を試す
        </h1>
        <p className="font-mincho text-[14px] text-sumi-soft mt-3 leading-[1.9]">
          <span className="text-bengara">プリセットを選ぶ → カレンダーで日をタップ → まとめて登録</span>。
          夜勤は入り→翌朝の明けで、2日にまたがる帯として入ります。これが Cozy Cal の入力の核です。
        </p>

        {/* preset picker */}
        <div className="mt-8">
          <div className="font-mono text-[10.5px] text-mist mb-2">よく使う予定をえらぶ</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const on = p.key === presetKey;
              return (
                <button
                  key={p.key}
                  onClick={() => pickPreset(p.key)}
                  className="px-3.5 py-2 rounded-full font-mincho text-[13px] border transition-all"
                  style={{
                    background: on ? p.color : "transparent",
                    color: on ? p.ink : "#514b5e",
                    borderColor: on ? p.color : "#D8D2C5",
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* mini calendar */}
        <div className="mt-6 grid grid-cols-7 gap-px bg-hairline border border-hairline rounded-md overflow-hidden">
          {DOW.map((d) => (
            <div key={d} className="bg-washi py-1.5 text-center font-mono text-[10px] text-mist">
              {d}
            </div>
          ))}
          {Array.from({ length: DAYS }).map((_, i) => {
            const segs = segFor(i);
            const isSel = selected.includes(i);
            return (
              <button
                key={i}
                onClick={() => tapDay(i)}
                className="bg-washi min-h-[54px] p-1 flex flex-col items-stretch text-left transition-colors"
                style={{ outline: isSel ? "2px solid #8B3A2C" : "none", outlineOffset: "-2px" }}
              >
                <span className="font-mono text-[9.5px] text-mist leading-none">{i + 1}</span>
                <span className="flex flex-col gap-0.5 mt-0.5">
                  {segs.map((s, j) => (
                    <span
                      key={j}
                      className="text-[9.5px] leading-tight px-1 py-[1px] truncate"
                      style={{
                        background: s.p.color,
                        color: s.p.ink,
                        borderRadius:
                          s.part === "in"
                            ? "4px 0 0 4px"
                            : s.part === "out"
                              ? "0 4px 4px 0"
                              : "4px",
                      }}
                    >
                      {s.part === "in" ? "夜勤 入" : s.part === "out" ? "明け" : s.p.name}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* bulk bar（本物と同じ文言） */}
        <div className="mt-4 min-h-[48px]">
          {selected.length > 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-hairline bg-washi-deep/50">
              <div className="flex-1 font-mincho text-[13px]">
                <b>{preset.name}</b> を{" "}
                <span className="text-bengara font-medium">{selected.length}日</span> 選択中
              </div>
              <button
                onClick={() => setSelected([])}
                className="px-3 py-2 rounded-lg font-mono text-[11px] text-mist bg-washi-deep"
              >
                やめる
              </button>
              <button
                onClick={register}
                className="px-4 py-2 rounded-lg font-mono text-[11px] text-washi bg-sumi hover:bg-bengara transition-colors"
              >
                登録
              </button>
            </div>
          ) : (
            <p className="font-mono text-[10.5px] text-mist">
              {preset.name}
              {preset.time && ` · ${preset.time}`} — 日をタップして選択
            </p>
          )}
        </div>

        <p className="font-mincho text-[12px] text-mist mt-6 leading-[1.85]">
          これは入力の核だけの簡易版です。本物の Cozy Cal は、これに加えて
          Googleカレンダー双方向連携・繰り返し登録・持ち主色での夫婦分担・やること/買い物/メモ・
          合言葉での夫婦共有を備えています。
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <a
            href="https://cal.lumen-log.com"
            className="inline-flex justify-center px-6 py-3 rounded-full bg-sumi text-washi font-mono text-[12px] tracking-wide hover:bg-bengara transition-colors"
          >
            本物の Cozy Cal を開く →
          </a>
          <span className="font-mincho text-[12px] text-mist">
            lumen-log のアカウントで使えます
          </span>
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex items-center justify-between">
          <a
            href="/tools"
            className="font-mono text-[11px] text-sumi hover:text-bengara transition-colors"
          >
            ← 道具の一覧へ
          </a>
          <span className="font-mono text-[11px] text-mist">Lumen-log ©</span>
        </div>
      </div>
    </div>
  );
}
