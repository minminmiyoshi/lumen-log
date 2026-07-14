"use client";

import { useState } from "react";

type Shift = "off" | "day" | "night";

const CYCLE: Record<Shift, Shift> = { off: "day", day: "night", night: "off" };

const LABEL: Record<Shift, string> = { off: "休み", day: "日勤", night: "夜勤" };

const DOW = ["月", "火", "水", "木", "金", "土", "日"];

// 夜勤を選ぶと自動で立ち上がる「段取り」。Cozy Cal が夜勤をネイティブに
// 理解する、の実演（AIなし・ルールだけ）。
const NIGHT_CASCADE = [
  "仮眠時間の通知はミュート",
  "夕飯は作り置き／簡単に（Cozy Kitchen 連携）",
  "翌日は回復日として確保",
];

const INITIAL: Shift[] = ["day", "off", "night", "off", "day", "off", "off"];

export default function CozyCalDemo() {
  const [week, setWeek] = useState<Shift[]>(INITIAL);

  const tap = (i: number) =>
    setWeek((w) => w.map((s, j) => (j === i ? CYCLE[s] : s)));

  const nightCount = week.filter((s) => s === "night").length;

  return (
    <div className="min-h-screen bg-washi text-sumi">
      <div className="max-w-[640px] mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="inline-block w-12 h-[1.5px] bg-bengara" />
          <span className="font-mono text-[11px] text-bengara tracking-wide">
            demo — no sign-up
          </span>
        </div>
        <h1 className="font-serif text-[30px] md:text-[38px] leading-[1.15] font-normal m-0">
          夜勤を“塗るだけ”のカレンダー
        </h1>
        <p className="font-mincho text-[14px] md:text-[15px] text-sumi-soft mt-3 leading-[1.9]">
          日付をタップして勤務を切り替えると、
          <span className="text-bengara">夜勤の日は家の段取りが自動で立ち上がる</span>
          。これが Cozy Cal の核 ——「夜勤をネイティブに理解するカレンダー」の体験版です。
        </p>

        {/* week strip */}
        <div className="mt-9 grid grid-cols-7 gap-1.5 md:gap-2">
          {week.map((s, i) => {
            const isNight = s === "night";
            const isDay = s === "day";
            return (
              <button
                key={i}
                onClick={() => tap(i)}
                className={`flex flex-col items-center rounded-md border py-3 transition-colors ${
                  isNight
                    ? "bg-bengara text-washi border-bengara"
                    : isDay
                      ? "bg-washi-deep border-hairline text-sumi"
                      : "bg-transparent border-hairline text-mist"
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">{DOW[i]}</span>
                <span className="font-mincho text-[13px] mt-1.5 leading-none">
                  {LABEL[s]}
                </span>
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[10.5px] text-mist mt-2">
          tap: 休み → 日勤 → 夜勤 → 休み
        </p>

        {/* summary */}
        <div className="mt-8 p-5 border border-hairline rounded-md bg-washi-deep/40">
          <div className="font-mono text-[11px] text-mist mb-3">この週のあなた</div>
          {nightCount === 0 ? (
            <p className="font-mincho text-[14px] text-sumi-soft m-0">
              夜勤なし。日付をタップして
              <span className="text-bengara">夜勤</span>
              を入れてみてください。
            </p>
          ) : (
            <>
              <p className="font-mincho text-[15px] m-0">
                夜勤 <span className="text-bengara font-medium">{nightCount}</span> 回。
                その日は次の段取りが自動でセットされます：
              </p>
              <ul className="mt-3 space-y-2 list-none p-0 m-0">
                {NIGHT_CASCADE.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-2.5 font-mincho text-[14px] text-sumi-soft"
                  >
                    <span className="mt-[6px] inline-block w-1.5 h-1.5 rounded-full bg-bengara shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
              <p className="font-mincho text-[12.5px] text-mist mt-4 leading-[1.8] m-0">
                本物の Cozy Cal では、これが家族と共有され、夜勤の日だけ相手に
                「お願い」がそっと届きます（催促はしない設計）。
              </p>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:items-center">
          <a
            href="https://cal.lumen-log.com"
            className="inline-flex justify-center px-6 py-3 rounded-full bg-sumi text-washi font-mono text-[12px] tracking-wide hover:bg-bengara transition-colors"
          >
            本物の Cozy Cal を開く →
          </a>
          <span className="font-mincho text-[12px] text-mist">
            lumen-log のアカウントでそのまま使えます
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
