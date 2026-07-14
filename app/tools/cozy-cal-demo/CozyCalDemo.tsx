"use client";

import { useEffect, useState } from "react";

/**
 * Cozy Cal の実画面を忠実に再現した体験デモ（本番 cal.lumen-log.com の見た目に準拠）。
 * - 実テーマ（ラベンダー/紫グラデ）、ヘッダー、モバイルのタブバー、デスクトップの2カラム。
 * - 入力の核：プリセットを選ぶ → 日をタップ → まとめて登録。夜勤は入り→翌朝の明けの2日帯。
 * すべて実ソース（futari-yotei-cloud/public/index.html）の配色・構造に基づく。嘘の機能は載せない。
 */

type Preset = { key: string; name: string; color: string; days: number; time: string; owner: string };

const PRESETS: Preset[] = [
  { key: "night", name: "夜勤", color: "#6366f1", days: 2, time: "17:00→翌09:00", owner: "" },
  { key: "day-h", name: "日勤（夫）", color: "#3b82f6", days: 1, time: "8:45–17:15", owner: "husband" },
  { key: "day-w", name: "日勤（妻）", color: "#ec4899", days: 1, time: "9:00–16:30", owner: "wife" },
  { key: "off", name: "休み", color: "#c9c4da", days: 1, time: "", owner: "common" },
];

type Ev = { start: number; days: number; presetKey: string };

const DOW = ["日", "月", "火", "水", "木", "金", "土"];
// 2026年7月（7/1=水）。前後の空きも含め 6週=42セル。null=別月。
const FIRST_DOW = 3; // 水曜始まり
const MONTH_DAYS = 31;
const CELLS = 42;

function inkFor(color: string) {
  // 明るい色（休み等）は濃い文字。
  return color === "#c9c4da" ? "#514b5e" : "#ffffff";
}

export default function CozyCalDemo() {
  const [mode, setMode] = useState<"mobile" | "desktop">("mobile");
  const [presetKey, setPresetKey] = useState("night");
  const [selected, setSelected] = useState<number[]>([]); // day number (1..31)
  const [events, setEvents] = useState<Ev[]>([
    { start: 6, days: 2, presetKey: "night" }, // サンプル：7/6 夜勤
    { start: 9, days: 1, presetKey: "day-w" }, // 7/9 日勤(妻)
    { start: 13, days: 2, presetKey: "night" },
    { start: 17, days: 1, presetKey: "day-h" },
  ]);
  const [tab, setTab] = useState("cal");
  const [selDay, setSelDay] = useState<number | null>(6);

  useEffect(() => {
    const apply = () => setMode(window.innerWidth >= 900 ? "desktop" : "mobile");
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const preset = PRESETS.find((p) => p.key === presetKey)!;

  const pickPreset = (k: string) => {
    setPresetKey(k);
    setSelected([]);
  };
  const tapDay = (d: number) => {
    setSelDay(d);
    setSelected((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  };
  const register = () => {
    setEvents((e) => [...e, ...selected.map((start) => ({ start, days: preset.days, presetKey }))]);
    setSelected([]);
  };

  // 週ごとに帯セグメントと単日ピルを組み立てる
  const weeks: { dayNum: number | null; idx: number }[][] = [];
  for (let w = 0; w < CELLS / 7; w++) {
    const row: { dayNum: number | null; idx: number }[] = [];
    for (let c = 0; c < 7; c++) {
      const idx = w * 7 + c;
      const dn = idx - FIRST_DOW + 1;
      row.push({ dayNum: dn >= 1 && dn <= MONTH_DAYS ? dn : null, idx });
    }
    weeks.push(row);
  }

  // 夜勤(days2)の帯を週内セグメントに割る
  const barsForWeek = (weekIdx: number) => {
    const segs: { col: number; span: number; p: Preset; label: string; contL: boolean; contR: boolean }[] = [];
    for (const ev of events) {
      const p = PRESETS.find((x) => x.key === ev.presetKey)!;
      if (ev.days !== 2) continue;
      // 入りの日の (week,col)
      const inIdx = ev.start - 1 + FIRST_DOW;
      const outIdx = inIdx + 1;
      const inW = Math.floor(inIdx / 7), inC = inIdx % 7;
      const outW = Math.floor(outIdx / 7), outC = outIdx % 7;
      if (inW === weekIdx && outW === weekIdx) {
        segs.push({ col: inC, span: 2, p, label: "夜勤", contL: false, contR: false });
      } else if (inW === weekIdx) {
        segs.push({ col: inC, span: 1, p, label: "夜勤 入", contL: false, contR: true });
      } else if (outW === weekIdx) {
        segs.push({ col: outC, span: 1, p, label: "明け", contL: true, contR: false });
      }
    }
    return segs;
  };
  const pillsForDay = (dayNum: number | null) => {
    if (dayNum == null) return [];
    return events
      .filter((ev) => ev.days === 1 && ev.start === dayNum)
      .map((ev) => PRESETS.find((x) => x.key === ev.presetKey)!);
  };

  const dayEvents = (d: number | null) => {
    if (d == null) return [];
    const out: { p: Preset; kind: string }[] = [];
    for (const ev of events) {
      const p = PRESETS.find((x) => x.key === ev.presetKey)!;
      if (ev.days === 2 && ev.start === d) out.push({ p, kind: "入り→明け" });
      else if (ev.days === 2 && ev.start + 1 === d) out.push({ p, kind: "明け" });
      else if (ev.days === 1 && ev.start === d) out.push({ p, kind: "終日" });
    }
    return out;
  };

  const Calendar = (
    <div className="cc-card">
      <div className="cc-cal-head">
        <div className="cc-mlabel">
          <span className="cc-yr">2026年</span>7月
        </div>
        <div className="cc-nav">
          <button>‹</button>
          <button className="cc-today">今日</button>
          <button>›</button>
        </div>
      </div>
      <div className="cc-dow">
        {DOW.map((d, i) => (
          <span key={d} className={i === 0 ? "cc-sun" : i === 6 ? "cc-sat" : ""}>
            {d}
          </span>
        ))}
      </div>
      <div className="cc-grid">
        {weeks.map((row, w) => (
          <div className="cc-week" key={w}>
            <div className="cc-dates">
              {row.map((cell) => {
                const isSel = cell.dayNum != null && selected.includes(cell.dayNum);
                const isDsel = cell.dayNum != null && selDay === cell.dayNum;
                return (
                  <div
                    key={cell.idx}
                    className={`cc-date${cell.dayNum == null ? " cc-out" : ""}${isSel ? " cc-selected" : ""}`}
                    onClick={() => cell.dayNum != null && tapDay(cell.dayNum)}
                  >
                    <span className={`cc-dnum${isDsel ? " cc-dsel" : ""}`}>{cell.dayNum ?? ""}</span>
                  </div>
                );
              })}
            </div>
            <div className="cc-bars">
              {barsForWeek(w).map((s, j) => (
                <div
                  key={j}
                  className={`cc-bar${s.contL ? " cc-contl" : ""}${s.contR ? " cc-contr" : ""}`}
                  style={{
                    gridColumn: `${s.col + 1} / span ${s.span}`,
                    background: s.p.color,
                    color: inkFor(s.p.color),
                  }}
                >
                  {s.label}
                </div>
              ))}
            </div>
            <div className="cc-cells">
              {row.map((cell) => (
                <div className="cc-cell" key={cell.idx}>
                  {pillsForDay(cell.dayNum).map((p, j) => (
                    <div
                      key={j}
                      className="cc-pill"
                      style={{ background: p.color, color: inkFor(p.color) }}
                    >
                      {p.name.replace("（夫）", "").replace("（妻）", "")}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Presets = (
    <div className="cc-card">
      <div className="cc-sec">よく使う予定をえらぶ → カレンダーで日をタップ</div>
      <div className="cc-presets">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className={`cc-preset${p.key === presetKey ? " cc-active" : ""}`}
            onClick={() => pickPreset(p.key)}
          >
            <span className="cc-dot" style={{ background: p.color }} />
            {p.name}
            {p.time && <span className="cc-sp">{p.time}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const DayRail = (
    <div className="cc-card cc-rail">
      <div className="cc-rail-head">
        7月{selDay ?? "—"}日<span>のスケジュール</span>
      </div>
      {selDay && dayEvents(selDay).length > 0 ? (
        <div className="cc-band">
          {dayEvents(selDay).map((e, i) => (
            <div className="cc-chip" key={i}>
              <span className="cc-chip-dot" style={{ background: e.p.color }} />
              <span className="cc-chip-nm">{e.p.name}</span>
              <span className="cc-chip-bg" style={{ background: e.p.color, color: inkFor(e.p.color) }}>
                {e.kind}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="cc-band-empty">予定なし。プリセットを選んで日をタップ。</div>
      )}
    </div>
  );

  return (
    <div className="cc-outer">
      <style>{CSS}</style>

      {/* lumen-log 側の見出し＋モード切替 */}
      <div className="cc-intro">
        <div className="cc-intro-tag">demo — no sign-up</div>
        <h1>Cozy Cal を触ってみる</h1>
        <p>
          本物の <b>cal.lumen-log.com</b> と同じ見た目です。プリセットを選んで日をタップ→まとめて登録。
          夜勤は入り→翌朝の明けで2日にまたがる帯として入ります。
        </p>
        <div className="cc-modeseg">
          <button className={mode === "mobile" ? "on" : ""} onClick={() => setMode("mobile")}>
            スマホ表示
          </button>
          <button className={mode === "desktop" ? "on" : ""} onClick={() => setMode("desktop")}>
            PC表示
          </button>
        </div>
      </div>

      {/* 実アプリ再現 */}
      <div className={`cc-app cc-${mode}`}>
        <div className="cc-bar">
          <div className="cc-logo" />
          <div className="cc-brand">Cozy Cal</div>
          <div className="cc-sync">
            <span className="cc-sync-dot" />
            同期中
          </div>
        </div>

        {mode === "desktop" ? (
          <div className="cc-cols">
            <div className="cc-col-left">
              {Calendar}
              {Presets}
            </div>
            <div className="cc-col-right">{DayRail}</div>
          </div>
        ) : (
          <>
            {tab === "cal" ? (
              <>
                {Calendar}
                {Presets}
              </>
            ) : (
              <div className="cc-card cc-otab">
                この機能は本物の Cozy Cal で使えます（デモはカレンダーのみ）。
              </div>
            )}
            <div className="cc-tabbar">
              {[
                ["cal", "カレンダー"],
                ["todo", "やること"],
                ["shop", "買い物"],
                ["memo", "メモ"],
              ].map(([k, label]) => (
                <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* bulk bar（本物と同文言） */}
        {selected.length > 0 && (
          <div className="cc-bulk">
            <div className="cc-bulk-info">
              <b>{preset.name}</b> を <span className="cc-cnt">{selected.length}</span>日 選択中
            </div>
            <button className="cc-cancel" onClick={() => setSelected([])}>
              やめる
            </button>
            <button className="cc-reg" onClick={register}>
              登録
            </button>
          </div>
        )}
      </div>

      <div className="cc-cta">
        <a href="https://cal.lumen-log.com">本物の Cozy Cal を開く →</a>
        <span>
          Googleカレンダー双方向連携・繰り返し・持ち主色での夫婦分担・やること/買い物/メモ・合言葉共有は本体で。
        </span>
      </div>
      <div className="cc-foot">
        <a href="/tools">← 道具の一覧へ</a>
        <span>Lumen-log ©</span>
      </div>
    </div>
  );
}

const CSS = `
.cc-outer{max-width:1060px;margin:0 auto;padding:40px 20px 64px;font-family:"Zen Kaku Gothic New","Plus Jakarta Sans",system-ui,sans-serif;}
.cc-intro{max-width:620px;}
.cc-intro-tag{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.05em;color:#8B3A2C;margin-bottom:10px;}
.cc-intro h1{font-family:'Shippori Mincho B1',serif;font-weight:400;font-size:30px;margin:0 0 10px;color:#1a1a1a;}
.cc-intro p{font-size:14px;line-height:1.9;color:#57534e;margin:0;}
.cc-intro p b{color:#6366f1;}
.cc-modeseg{display:inline-flex;gap:0;margin-top:18px;border:1px solid #D8D2C5;border-radius:999px;overflow:hidden;}
.cc-modeseg button{padding:8px 18px;font-size:12px;font-family:inherit;background:transparent;border:none;color:#6E665B;cursor:pointer;}
.cc-modeseg button.on{background:#2b2842;color:#fff;}

/* ==== app shell (real Cozy Cal theme) ==== */
.cc-app{margin-top:22px;background:#f6f5fb;border:1px solid #e9e6f3;border-radius:22px;box-shadow:0 18px 50px rgba(80,63,160,.14);position:relative;overflow:hidden;color:#2b2842;}
.cc-mobile{max-width:400px;margin-left:auto;margin-right:auto;padding:0 0 66px;}
.cc-desktop{padding:0 0 8px;background:linear-gradient(160deg,#f1f0fb 0%,#f6f5fb 55%,#faf1fd 100%);}
.cc-bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:9px;padding:14px 16px 12px;background:#f6f5fb;}
.cc-desktop .cc-bar{background:transparent;padding:20px 24px 12px;}
.cc-logo{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#a855f7);flex:none;}
.cc-desktop .cc-logo{width:44px;height:44px;border-radius:13px;}
.cc-brand{font-weight:700;font-size:16px;flex:1;color:#2b2842;}
.cc-desktop .cc-brand{font-size:19px;}
.cc-sync{display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;color:#6b6786;background:#fff;border:1.4px solid #e9e6f3;border-radius:11px;padding:0 10px;height:34px;}
.cc-sync-dot{width:8px;height:8px;border-radius:50%;background:#10b981;}

.cc-cols{display:flex;gap:22px;padding:0 24px;align-items:flex-start;}
.cc-col-left{flex:1 1 0;min-width:0;display:flex;flex-direction:column;}
.cc-col-right{flex:0 0 320px;}

.cc-card{background:#fff;border-radius:18px;box-shadow:0 10px 30px rgba(80,63,160,.10);padding:16px;margin:0 14px 14px;}
.cc-desktop .cc-card{margin:0 0 18px;padding:18px;}

.cc-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.cc-mlabel{font-size:18px;font-weight:700;}
.cc-desktop .cc-mlabel{font-size:22px;}
.cc-yr{font-size:12px;color:#6b6786;margin-right:6px;}
.cc-nav{display:flex;gap:6px;}
.cc-nav button{width:34px;height:34px;border:1.4px solid #e9e6f3;background:#fff;border-radius:10px;font-size:15px;color:#2b2842;cursor:pointer;}
.cc-nav .cc-today{width:auto;padding:0 12px;font-size:12.5px;font-weight:600;}

.cc-dow{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));margin-bottom:4px;}
.cc-dow span{font-size:11px;font-weight:600;color:#6b6786;text-align:center;padding:4px 0;}
.cc-dow .cc-sun{color:#e0556b;}.cc-dow .cc-sat{color:#5b87e0;}

.cc-week{border-top:1px solid #e9e6f3;}
.cc-dates{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));}
.cc-date{min-height:24px;padding-top:3px;text-align:center;cursor:pointer;}
.cc-desktop .cc-date{min-height:74px;}
.cc-out{opacity:.32;cursor:default;}
.cc-dnum{font-size:12.5px;font-weight:600;width:22px;height:22px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.cc-dsel{box-shadow:0 0 0 2px #8b5cf6;}
.cc-selected{background:linear-gradient(135deg,rgba(99,102,241,.13),rgba(168,85,247,.13));border-radius:8px;}
.cc-bars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-auto-rows:16px;row-gap:2px;padding:2px 0 1px;}
.cc-bar{font-size:9.5px;line-height:14px;height:14px;border-radius:5px;font-weight:700;padding:0 5px;margin:0 1.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cc-contr{border-top-right-radius:0;border-bottom-right-radius:0;margin-right:0;}
.cc-contl{border-top-left-radius:0;border-bottom-left-radius:0;margin-left:0;opacity:.92;}
.cc-cells{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));padding:1px 0 6px;}
.cc-cell{display:flex;flex-direction:column;gap:2px;min-width:0;padding:0 1.5px;min-height:6px;}
.cc-pill{font-size:9px;line-height:14px;height:14px;border-radius:5px;font-weight:700;padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cc-desktop .cc-pill{font-size:11px;height:auto;line-height:1.4;padding:2px 8px;border-radius:7px;}

.cc-sec{font-size:12px;font-weight:600;color:#6b6786;margin-bottom:10px;}
.cc-presets{display:flex;flex-wrap:wrap;gap:8px;}
.cc-preset{border:1.6px solid #e9e6f3;background:#fff;border-radius:12px;padding:8px 13px;cursor:pointer;font-size:13px;font-weight:600;color:#2b2842;display:flex;align-items:center;gap:7px;font-family:inherit;}
.cc-preset.cc-active{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.13);background:#faf8ff;}
.cc-dot{width:11px;height:11px;border-radius:50%;flex:none;}
.cc-sp{font-size:9px;color:#6b6786;background:#f0eefb;border-radius:5px;padding:1px 5px;font-weight:700;}

.cc-rail-head{font-size:16px;font-weight:700;margin-bottom:10px;}
.cc-rail-head span{font-size:13px;color:#6b6786;font-weight:600;margin-left:4px;}
.cc-band{display:flex;flex-direction:column;gap:6px;}
.cc-chip{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:10px;background:#faf9fe;border:1px solid #e9e6f3;}
.cc-chip-dot{width:10px;height:10px;border-radius:50%;flex:none;}
.cc-chip-nm{flex:1;font-size:13px;font-weight:600;}
.cc-chip-bg{font-size:9.5px;font-weight:700;border-radius:5px;padding:2px 6px;}
.cc-band-empty{font-size:11.5px;color:#6b6786;padding:4px 2px;}

.cc-otab{color:#6b6786;font-size:13px;text-align:center;padding:34px 16px;}

.cc-tabbar{position:absolute;left:0;right:0;bottom:0;display:flex;background:rgba(255,255,255,.97);border-top:1px solid #e9e6f3;}
.cc-tabbar button{flex:1;padding:11px 0 10px;font-size:10.5px;font-weight:600;color:#6b6786;background:transparent;border:none;font-family:inherit;cursor:pointer;}
.cc-tabbar button.on{color:#8b5cf6;}

.cc-bulk{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.97);border-top:1px solid #e9e6f3;padding:12px 16px;box-shadow:0 -8px 24px rgba(80,63,160,.10);z-index:8;}
.cc-desktop .cc-bulk{border-radius:0 0 22px 22px;}
.cc-bulk-info{flex:1;font-size:12.5px;color:#6b6786;}
.cc-bulk-info b{color:#2b2842;font-size:14px;}
.cc-cnt{color:#8b5cf6;font-weight:700;}
.cc-bulk button{padding:11px 16px;border-radius:12px;border:none;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;}
.cc-reg{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;box-shadow:0 6px 14px rgba(124,92,246,.35);}
.cc-cancel{background:#f0eef7;color:#6b6786;}

.cc-cta{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:26px;}
.cc-cta a{display:inline-flex;padding:12px 22px;border-radius:999px;background:#2b2842;color:#fff;font-family:ui-monospace,monospace;font-size:12px;text-decoration:none;}
.cc-cta a:hover{background:#8B3A2C;}
.cc-cta span{font-size:12px;color:#6E665B;max-width:420px;line-height:1.7;}
.cc-foot{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:20px;border-top:1px solid #D8D2C5;}
.cc-foot a{font-family:ui-monospace,monospace;font-size:11px;color:#2b2842;text-decoration:none;}
.cc-foot a:hover{color:#8B3A2C;}
.cc-foot span{font-family:ui-monospace,monospace;font-size:11px;color:#6E665B;}
`;
