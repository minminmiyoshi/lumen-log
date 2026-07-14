"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cozy Cal の実画面を忠実に再現した体験デモ（本番 cal.lumen-log.com の見た目・構造に準拠）。
 * すべて実ソース（futari-yotei-cloud/public/index.html）の配色・レイアウト・フォーム項目に基づく。嘘の機能は載せない。
 *
 * 忠実化のポイント（2026-07-14 更新）:
 *  - 月次カレンダーの「横」に本物の 24 時間タイムライン（1日のスケジュール）。時刻目盛り・時間帯ブロック・
 *    重なりの列分割・夜勤明けの帯・現在時刻ライン・7:00 デフォルトスクロール（実仕様 HOURPX=44）。
 *  - 「🔁 繰り返し予定・リマインドの設定」を実際の入力フォームまで開ける（種類/曜日/頻度〔第◯週〕/祝日スキップ/
 *    時間/持ち主/色/メモ）。追加した繰り返しはカレンダーとタイムラインに実際に反映される。
 */

const HOURPX = 44;

type Preset = {
  key: string;
  name: string;
  color: string;
  days: number;
  startMin: number | null;
  endMin: number;
  timeIn: string;
  timeOut: string;
  chip: string; // presets カードの右端バッジ
  owner: string;
};

const PRESETS: Preset[] = [
  { key: "night", name: "夜勤", color: "#6366f1", days: 2, startMin: 1020, endMin: 540, timeIn: "17:00", timeOut: "09:00", chip: "17:00→翌09:00", owner: "" },
  { key: "day-h", name: "日勤（夫）", color: "#3b82f6", days: 1, startMin: 525, endMin: 1035, timeIn: "8:45", timeOut: "17:15", chip: "8:45–17:15", owner: "husband" },
  { key: "day-w", name: "日勤（妻）", color: "#ec4899", days: 1, startMin: 540, endMin: 990, timeIn: "9:00", timeOut: "16:30", chip: "9:00–16:30", owner: "wife" },
  { key: "off", name: "休み", color: "#c9c4da", days: 1, startMin: null, endMin: 0, timeIn: "", timeOut: "", chip: "", owner: "common" },
];
const preset = (k: string) => PRESETS.find((p) => p.key === k)!;

type Ev = { start: number; days: number; presetKey: string };
type Rule = {
  id: string;
  name: string;
  kind: "event" | "reminder" | "anniversary";
  weekday: number;
  every: boolean;
  nths: string[];
  skipHoliday: boolean;
  time: string;
  endTime: string;
  owner: string;
  color: string;
  note: string;
};

const DOW = ["日", "月", "火", "水", "木", "金", "土"];
const FIRST_DOW = 3; // 2026年7月：7/1=水
const MONTH_DAYS = 31;
const CELLS = 42;
const TODAY = 14; // 2026-07-14

function inkFor(color: string) {
  const c = color.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16),
    g = parseInt(c.slice(2, 4), 16),
    b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? "#2b2842" : "#fff";
}
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
const weekdayOf = (d: number) => (FIRST_DOW + d - 1) % 7;
const nthOf = (d: number) => Math.floor((d - 1) / 7) + 1;
const isLast = (d: number) => d + 7 > MONTH_DAYS;
function ruleMatchesDay(r: Rule, d: number) {
  if (r.kind !== "event") return false;
  if (weekdayOf(d) !== r.weekday) return false;
  if (r.every) return true;
  if (r.nths.includes(String(nthOf(d)))) return true;
  if (r.nths.includes("last") && isLast(d)) return true;
  return false;
}
function nthLabel(r: Rule) {
  if (r.every || !r.nths.length) return "毎週";
  return r.nths.map((w) => (w === "last" ? "最終" : "第" + w)).join("・");
}

const CORE_COLORS = ["#6366f1", "#3b82f6", "#ec4899", "#c7e6fb", "#fbd3e6", "#dedbe8", "#ffffff"];
function ownerRecommend(o: string) {
  if (o === "husband") return ["#3b82f6", "#c7e6fb", "#6366f1"];
  if (o === "wife") return ["#ec4899", "#fbd3e6", "#6366f1"];
  return ["#dedbe8", "#ffffff"];
}

// layoutSpans：重なりを列に振り分ける（実ソースの greedy left-fit を移植）
type Span = { name: string; color: string; s: number; en: number; label: string; virtual?: boolean };
function layoutSpans(spans: Span[]) {
  const evs = spans.map((e) => ({ ...e, col: 0 })).sort((a, b) => a.s - b.s || a.en - b.en);
  const out: (Span & { top: number; height: number; left: number; width: number })[] = [];
  let cluster: (Span & { col: number })[] = [];
  let cEnd = -1;
  const flush = () => {
    if (!cluster.length) return;
    const cols: number[] = [];
    cluster.forEach((ev) => {
      let placed = false;
      for (let i = 0; i < cols.length; i++) {
        if (ev.s >= cols[i]) {
          ev.col = i;
          cols[i] = ev.en;
          placed = true;
          break;
        }
      }
      if (!placed) {
        ev.col = cols.length;
        cols.push(ev.en);
      }
    });
    const nc = cols.length;
    cluster.forEach((ev) =>
      out.push({
        ...ev,
        top: (ev.s / 60) * HOURPX,
        height: Math.max(((ev.en - ev.s) / 60) * HOURPX, 18),
        left: ev.col * (100 / nc),
        width: 100 / nc,
      })
    );
    cluster = [];
    cEnd = -1;
  };
  evs.forEach((ev) => {
    if (cluster.length && ev.s >= cEnd) flush();
    cluster.push(ev);
    cEnd = Math.max(cEnd, ev.en);
  });
  flush();
  return out;
}

export default function CozyCalDemo() {
  const [mode, setMode] = useState<"mobile" | "desktop">("mobile");
  const [presetKey, setPresetKey] = useState("night");
  const [selected, setSelected] = useState<number[]>([]);
  const [events, setEvents] = useState<Ev[]>([
    { start: 6, days: 2, presetKey: "night" },
    { start: 9, days: 1, presetKey: "day-w" },
    { start: 13, days: 2, presetKey: "night" },
    { start: 17, days: 1, presetKey: "day-h" },
    { start: 20, days: 1, presetKey: "day-h" },
  ]);
  const [rules, setRules] = useState<Rule[]>([
    { id: "r0", name: "医局カンファ", kind: "event", weekday: 5, every: true, nths: [], skipHoliday: false, time: "12:00", endTime: "13:00", owner: "common", color: "#8b5cf6", note: "毎週金曜のカンファレンス" },
  ]);
  const [tab, setTab] = useState("cal");
  const [selDay, setSelDay] = useState<number | null>(13);
  const [dayModal, setDayModal] = useState(false); // モバイルの1日シート
  const [rulesOpen, setRulesOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [nowMin, setNowMin] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apply = () => setMode(window.innerWidth >= 900 ? "desktop" : "mobile");
    apply();
    window.addEventListener("resize", apply);
    const n = new Date();
    setNowMin(n.getHours() * 60 + n.getMinutes());
    return () => window.removeEventListener("resize", apply);
  }, []);

  // タイムラインは 7:00 を先頭に（実仕様 scrollDayView）
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOURPX;
  }, [selDay, mode]);
  useEffect(() => {
    if (dayModal && mobileScrollRef.current) mobileScrollRef.current.scrollTop = 7 * HOURPX;
  }, [dayModal, selDay]);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast((t) => (t === m ? null : t)), 1800);
  };

  const p = preset(presetKey);
  const pickPreset = (k: string) => {
    setPresetKey(k);
    setSelected([]);
  };
  const tapDay = (d: number) => {
    setSelDay(d);
    setSelected((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  };
  const register = () => {
    setEvents((e) => [...e, ...selected.map((start) => ({ start, days: p.days, presetKey }))]);
    showToast(`${p.name} を ${selected.length}日 登録しました`);
    setSelected([]);
  };

  // ===== 週グリッド =====
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
  const barsForWeek = (weekIdx: number) => {
    const segs: { col: number; span: number; color: string; label: string; contL: boolean; contR: boolean }[] = [];
    for (const ev of events) {
      const pr = preset(ev.presetKey);
      if (ev.days !== 2) continue;
      const inIdx = ev.start - 1 + FIRST_DOW;
      const outIdx = inIdx + 1;
      const inW = Math.floor(inIdx / 7),
        inC = inIdx % 7;
      const outW = Math.floor(outIdx / 7),
        outC = outIdx % 7;
      if (inW === weekIdx && outW === weekIdx) segs.push({ col: inC, span: 2, color: pr.color, label: "夜勤", contL: false, contR: false });
      else if (inW === weekIdx) segs.push({ col: inC, span: 1, color: pr.color, label: "夜勤 入", contL: false, contR: true });
      else if (outW === weekIdx) segs.push({ col: outC, span: 1, color: pr.color, label: "明け", contL: true, contR: false });
    }
    return segs;
  };
  const pillsForDay = (dayNum: number | null) => {
    if (dayNum == null) return [];
    const out: { name: string; color: string; virtual?: boolean }[] = [];
    events
      .filter((ev) => ev.days === 1 && ev.start === dayNum)
      .forEach((ev) => {
        const pr = preset(ev.presetKey);
        out.push({ name: pr.name.replace("（夫）", "").replace("（妻）", ""), color: pr.color });
      });
    rules.forEach((r) => {
      if (ruleMatchesDay(r, dayNum)) out.push({ name: r.name, color: r.color, virtual: true });
    });
    return out;
  };

  // ===== 1日のタイムライン用データ =====
  const dayData = (d: number | null) => {
    const spans: Span[] = [];
    const band: { name: string; color: string; tag: string }[] = [];
    if (d == null) return { spans, band };
    for (const ev of events) {
      const pr = preset(ev.presetKey);
      if (pr.startMin == null) {
        if (ev.start === d) band.push({ name: pr.name, color: pr.color, tag: "終日" });
        continue;
      }
      if (ev.days === 2) {
        if (ev.start === d) spans.push({ name: pr.name, color: pr.color, s: pr.startMin, en: 1440, label: pr.timeIn + "〜" });
        else if (ev.start + 1 === d) spans.push({ name: pr.name, color: pr.color, s: 0, en: pr.endMin, label: "〜" + pr.timeOut });
      } else if (ev.start === d) {
        spans.push({ name: pr.name, color: pr.color, s: pr.startMin, en: pr.endMin, label: pr.timeIn + "–" + pr.timeOut });
      }
    }
    for (const r of rules) {
      if (ruleMatchesDay(r, d)) {
        const s = toMin(r.time),
          en = r.endTime ? toMin(r.endTime) : s + 60;
        spans.push({ name: r.name, color: r.color, s, en, label: r.time + (r.endTime ? "–" + r.endTime : ""), virtual: true });
      }
    }
    return { spans, band };
  };

  const Timeline = ({ d, scrollRefEl }: { d: number | null; scrollRefEl: React.RefObject<HTMLDivElement | null> }) => {
    const { spans, band } = dayData(d);
    const laid = layoutSpans(spans);
    return (
      <>
        <div className="cc-allday">
          {band.length === 0 && spans.every((s) => s.s > 0 || s.en < 1440) === false && null}
          {band.length ? (
            band.map((b, i) => (
              <div className="cc-band-chip" key={i}>
                <span className="cc-bc-dot" style={{ background: b.color }} />
                <span className="cc-bc-nm">{b.name}</span>
                <span className="cc-bc-bg" style={{ background: "#94a3b8" }}>
                  {b.tag}
                </span>
              </div>
            ))
          ) : (
            <div className="cc-band-empty">終日の予定はありません</div>
          )}
        </div>
        <div className="cc-dayscroll" ref={scrollRefEl}>
          <div className="cc-timeline" style={{ height: 24 * HOURPX }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div className="cc-hour" key={h} style={{ top: h * HOURPX }}>
                <span className="cc-hl">{h}:00</span>
              </div>
            ))}
            {d === TODAY && nowMin != null && (
              <div className="cc-nowline" style={{ top: (nowMin / 60) * HOURPX }} />
            )}
            <div className="cc-evarea">
              {laid.map((e, i) => (
                <div
                  key={i}
                  className="cc-evblock"
                  style={{
                    top: e.top,
                    height: e.height,
                    left: e.left + "%",
                    width: `calc(${e.width}% - 3px)`,
                    background: e.color,
                    color: inkFor(e.color),
                  }}
                >
                  <div className="cc-bt">
                    {e.label}
                    {e.virtual ? " 🔁" : ""}
                  </div>
                  <div className="cc-bn">{e.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
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
                    onClick={() => {
                      if (cell.dayNum == null) return;
                      tapDay(cell.dayNum);
                      if (mode === "mobile") setDayModal(true);
                    }}
                  >
                    <span className={`cc-dnum${isDsel ? " cc-dsel" : ""}${cell.dayNum === TODAY ? " cc-tday" : ""}`}>
                      {cell.dayNum ?? ""}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="cc-bars">
              {barsForWeek(w).map((s, j) => (
                <div
                  key={j}
                  className={`cc-bar${s.contL ? " cc-contl" : ""}${s.contR ? " cc-contr" : ""}`}
                  style={{ gridColumn: `${s.col + 1} / span ${s.span}`, background: s.color, color: inkFor(s.color) }}
                >
                  {s.label}
                </div>
              ))}
            </div>
            <div className="cc-cells">
              {row.map((cell) => (
                <div className="cc-cell" key={cell.idx}>
                  {pillsForDay(cell.dayNum).map((pill, j) => (
                    <div
                      key={j}
                      className={`cc-pill${pill.virtual ? " cc-vpill" : ""}`}
                      style={{ background: pill.color, color: inkFor(pill.color) }}
                    >
                      {pill.virtual ? "🔁 " : ""}
                      {pill.name}
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
        {PRESETS.map((pr) => (
          <button key={pr.key} className={`cc-preset${pr.key === presetKey ? " cc-active" : ""}`} onClick={() => pickPreset(pr.key)}>
            <span className="cc-dot" style={{ background: pr.color }} />
            {pr.name}
            {pr.chip && <span className="cc-sp">{pr.chip}</span>}
          </button>
        ))}
      </div>
      <button className="cc-rulesbtn" onClick={() => setRulesOpen(true)}>
        🔁 繰り返し予定・リマインドの設定
      </button>
    </div>
  );

  const DayRail = (
    <div className="cc-card cc-rail">
      <div className="cc-rail-head">
        7月{selDay ?? "—"}日<span>のスケジュール</span>
      </div>
      <Timeline d={selDay} scrollRefEl={scrollRef} />
    </div>
  );

  return (
    <div className="cc-outer">
      <style>{CSS}</style>

      <div className="cc-intro">
        <div className="cc-intro-tag">demo — no sign-up</div>
        <h1>Cozy Cal を触ってみる</h1>
        <p>
          本物の <b>cal.lumen-log.com</b> と同じ見た目・構造です。プリセットを選んで日をタップ→まとめて登録。
          PC表示ではカレンダーの横に <b>1日の24時間スケジュール</b>。<b>🔁 繰り返し設定</b> から実際の入力画面まで触れます。
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
              <div className="cc-card cc-otab">この機能は本物の Cozy Cal で使えます（デモはカレンダーのみ）。</div>
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

        {selected.length > 0 && (
          <div className="cc-bulk">
            <div className="cc-bulk-info">
              <b>{p.name}</b> を <span className="cc-cnt">{selected.length}</span>日 選択中
            </div>
            <button className="cc-cancel" onClick={() => setSelected([])}>
              やめる
            </button>
            <button className="cc-reg" onClick={register}>
              登録
            </button>
          </div>
        )}

        {/* モバイル：1日のスケジュール シート */}
        {mode === "mobile" && dayModal && (
          <div className="cc-modal show" onClick={(e) => e.target === e.currentTarget && setDayModal(false)}>
            <div className="cc-sheet">
              <div className="cc-sheet-head">
                <div>
                  <h3>7月{selDay}日</h3>
                  <div className="cc-sub">1日のスケジュール</div>
                </div>
                <button className="cc-close-x" onClick={() => setDayModal(false)}>
                  ×
                </button>
              </div>
              <Timeline d={selDay} scrollRefEl={mobileScrollRef} />
            </div>
          </div>
        )}

        {/* 繰り返し設定モーダル */}
        {rulesOpen && <RulesModal rules={rules} setRules={setRules} close={() => setRulesOpen(false)} onAdd={showToast} />}

        {toast && <div className="cc-toast">{toast}</div>}
      </div>

      <div className="cc-cta">
        <a href="https://cal.lumen-log.com">本物の Cozy Cal を開く →</a>
        <span>Googleカレンダー双方向連携・持ち主色での夫婦分担・やること/買い物/メモ・合言葉共有は本体で。</span>
      </div>
      <div className="cc-foot">
        <a href="/tools">← 道具の一覧へ</a>
        <span>Lumen-log ©</span>
      </div>
    </div>
  );
}

/* ============ 繰り返し設定モーダル（実フォームを忠実に再現） ============ */
function RulesModal({
  rules,
  setRules,
  close,
  onAdd,
}: {
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  close: () => void;
  onAdd: (m: string) => void;
}) {
  const [kind, setKind] = useState<"event" | "reminder" | "anniversary">("event");
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState(5);
  const [every, setEvery] = useState(true);
  const [nths, setNths] = useState<Set<string>>(new Set());
  const [skip, setSkip] = useState(false);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [owner, setOwner] = useState("common");
  const [color, setColor] = useState("#6366f1");
  const [note, setNote] = useState("");
  const [annivDate, setAnnivDate] = useState("");
  const [count, setCount] = useState("none");
  const [remScope, setRemScope] = useState("local");

  const rec = ownerRecommend(owner);
  const ordered = [...rec, ...CORE_COLORS.filter((c) => !rec.includes(c))];

  const toggleNth = (v: string) => {
    setEvery(false);
    setNths((s) => {
      const n = new Set(s);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      if (!n.size) setEvery(true);
      return n;
    });
  };
  const pickOwner = (o: string) => {
    setOwner(o);
    setColor(ownerRecommend(o)[0]);
  };

  const add = () => {
    if (!name.trim()) {
      onAdd("名前を入れてください");
      return;
    }
    const r: Rule = {
      id: "r" + Date.now(),
      name: name.trim(),
      kind,
      weekday,
      every,
      nths: [...nths],
      skipHoliday: skip,
      time: start,
      endTime: end,
      owner,
      color,
      note,
    };
    setRules((rs) => [...rs, r]);
    onAdd(kind === "event" ? "繰り返しを追加しました（カレンダーに反映）" : "繰り返しを追加しました");
    setName("");
    setNote("");
  };

  const NTH = [
    ["1", "第1"],
    ["2", "第2"],
    ["3", "第3"],
    ["4", "第4"],
    ["5", "第5"],
    ["last", "最終"],
  ];

  return (
    <div className="cc-modal show" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="cc-sheet">
        <div className="cc-sheet-head">
          <div>
            <h3>繰り返し設定</h3>
            <div className="cc-sub">毎週・第◯曜日の予定/リマインドを自動表示</div>
          </div>
          <button className="cc-close-x" onClick={close}>
            ×
          </button>
        </div>

        <div className="cc-setsec">
          <h4>新しい繰り返しを追加</h4>

          <div className="cc-frow">
            <label>名前</label>
            <input type="text" value={name} placeholder="例：カンファレンス / 週次健康チェック" onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="cc-frow">
            <label>種類</label>
            <div className="cc-oseg">
              {[
                ["event", "予定"],
                ["reminder", "リマインド"],
                ["anniversary", "記念日"],
              ].map(([v, l]) => (
                <button key={v} className={kind === v ? "on common" : ""} onClick={() => setKind(v as typeof kind)}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {kind !== "anniversary" && (
            <>
              <div className="cc-frow cc-frow-2">
                <div style={{ flex: 1 }}>
                  <label>曜日</label>
                  <select className="cc-select" value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
                    {[
                      [1, "月"],
                      [2, "火"],
                      [3, "水"],
                      [4, "木"],
                      [5, "金"],
                      [6, "土"],
                      [0, "日"],
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1.4 }}>
                  <label>頻度（複数選択可）</label>
                  <div className="cc-nthmulti">
                    <button className={`cc-nchip${every ? " on" : ""}`} onClick={() => { setEvery(true); setNths(new Set()); }}>
                      毎週
                    </button>
                    {NTH.map(([v, l]) => (
                      <button key={v} className={`cc-nchip${!every && nths.has(v) ? " on" : ""}`} onClick={() => toggleNth(v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cc-frow">
                <div className="cc-toggle-row">
                  <div className="cc-lbl">
                    <b>祝日はスキップ</b>
                    <span>その曜日が祝日なら表示しない</span>
                  </div>
                  <label className="cc-switch">
                    <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} />
                    <span className="cc-track" />
                    <span className="cc-knob" />
                  </label>
                </div>
              </div>
            </>
          )}

          {kind === "anniversary" && (
            <>
              <div className="cc-frow">
                <label>元の日付（誕生日・入籍日など）</label>
                <input type="date" value={annivDate} onChange={(e) => setAnnivDate(e.target.value)} />
              </div>
              <div className="cc-frow">
                <label>毎年のカウント表示</label>
                <select className="cc-select" value={count} onChange={(e) => setCount(e.target.value)}>
                  <option value="none">なし</option>
                  <option value="age">◯歳（誕生日）</option>
                  <option value="year">◯周年（記念日）</option>
                </select>
              </div>
            </>
          )}

          {kind === "reminder" && (
            <div className="cc-frow">
              <label>共有範囲</label>
              <div className="cc-oseg">
                {[
                  ["local", "この端末だけ"],
                  ["shared", "共有"],
                ].map(([v, l]) => (
                  <button key={v} className={remScope === v ? "on common" : ""} onClick={() => setRemScope(v)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {kind === "event" && (
            <div className="cc-frow">
              <label>時間</label>
              <div className="cc-timerange">
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                <span>〜</span>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
          )}

          {(kind === "event" || kind === "anniversary") && (
            <>
              <div className="cc-frow">
                <label>だれの予定？</label>
                <div className="cc-oseg">
                  {[
                    ["common", "共通"],
                    ["husband", "夫"],
                    ["wife", "妻"],
                  ].map(([v, l]) => (
                    <button key={v} className={owner === v ? "on " + v : ""} onClick={() => pickOwner(v)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cc-frow">
                <label>色</label>
                <div className="cc-colorpick">
                  {ordered.map((col) => (
                    <div
                      key={col}
                      className={`cc-c${col === color ? " sel" : ""}${rec.includes(col) ? " rec" : ""}`}
                      style={{ background: col, border: col === "#ffffff" ? "1.5px solid #e9e6f3" : undefined }}
                      onClick={() => setColor(col)}
                    />
                  ))}
                </div>
              </div>
              <div className="cc-frow">
                <label>メモ</label>
                <textarea value={note} placeholder="議題・持ち物・入籍日など" onChange={(e) => setNote(e.target.value)} />
              </div>
            </>
          )}

          <button className="cc-btn" onClick={add}>
            この繰り返しを追加
          </button>
        </div>

        <div className="cc-setsec cc-setsec-top">
          <h4>登録済みの繰り返し</h4>
          {rules.length === 0 ? (
            <div className="cc-rules-empty">まだ繰り返し設定はありません</div>
          ) : (
            rules.map((r) => (
              <div className="cc-rule-item" key={r.id}>
                <span className="cc-ri-dot" style={{ background: r.color }} />
                <div className="cc-ri-meta">
                  <b>{r.name}</b>
                  <span>
                    {r.kind === "reminder" ? "🔔 " : r.kind === "anniversary" ? "🎂 " : ""}
                    {nthLabel(r)} {DOW[r.weekday]}曜
                    {r.skipHoliday ? "・祝日除く" : ""}
                    {r.kind === "event" ? ` ${r.time}${r.endTime ? "–" + r.endTime : ""}` : ""}
                  </span>
                </div>
                <button className="cc-ri-del" onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const CSS = `
.cc-outer{max-width:1080px;margin:0 auto;padding:40px 20px 64px;font-family:"Zen Kaku Gothic New","Plus Jakarta Sans",system-ui,sans-serif;}
.cc-intro{max-width:640px;}
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
.cc-col-right{flex:0 0 344px;}

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
.cc-desktop .cc-date{min-height:76px;}
.cc-out{opacity:.32;cursor:default;}
.cc-dnum{font-size:12.5px;font-weight:600;width:22px;height:22px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.cc-dsel{box-shadow:0 0 0 2px #8b5cf6;}
.cc-tday{background:#6366f1;color:#fff;}
.cc-selected{background:linear-gradient(135deg,rgba(99,102,241,.13),rgba(168,85,247,.13));border-radius:8px;}
.cc-bars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-auto-rows:16px;row-gap:2px;padding:2px 0 1px;}
.cc-bar{font-size:9.5px;line-height:14px;height:14px;border-radius:5px;font-weight:700;padding:0 5px;margin:0 1.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cc-contr{border-top-right-radius:0;border-bottom-right-radius:0;margin-right:0;}
.cc-contl{border-top-left-radius:0;border-bottom-left-radius:0;margin-left:0;opacity:.92;}
.cc-cells{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));padding:1px 0 6px;}
.cc-cell{display:flex;flex-direction:column;gap:2px;min-width:0;padding:0 1.5px;min-height:6px;}
.cc-pill{font-size:9px;line-height:14px;height:14px;border-radius:5px;font-weight:700;padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cc-desktop .cc-pill{font-size:10.5px;height:auto;line-height:1.4;padding:2px 7px;border-radius:7px;}
.cc-vpill{outline:1.5px dashed rgba(139,92,246,.5);outline-offset:-1.5px;}

.cc-sec{font-size:12px;font-weight:600;color:#6b6786;margin-bottom:10px;}
.cc-presets{display:flex;flex-wrap:wrap;gap:8px;}
.cc-preset{border:1.6px solid #e9e6f3;background:#fff;border-radius:12px;padding:8px 13px;cursor:pointer;font-size:13px;font-weight:600;color:#2b2842;display:flex;align-items:center;gap:7px;font-family:inherit;}
.cc-preset.cc-active{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.13);background:#faf8ff;}
.cc-dot{width:11px;height:11px;border-radius:50%;flex:none;}
.cc-sp{font-size:9px;color:#6b6786;background:#f0eefb;border-radius:5px;padding:1px 5px;font-weight:700;}
.cc-rulesbtn{margin-top:12px;width:100%;padding:11px;border-radius:12px;border:1.6px solid #e9e6f3;background:#fff;color:#8b5cf6;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;}
.cc-rulesbtn:hover{background:#faf8ff;}

/* ==== day timeline (24h) ==== */
.cc-rail-head{font-size:16px;font-weight:700;margin-bottom:10px;}
.cc-rail-head span{font-size:13px;color:#6b6786;font-weight:600;margin-left:4px;}
.cc-allday{display:flex;flex-direction:column;gap:5px;padding:0 0 8px;margin-bottom:6px;border-bottom:1px solid #e9e6f3;max-height:22vh;overflow:auto;}
.cc-band-chip{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:10px;background:#faf9fe;border:1px solid #e9e6f3;}
.cc-bc-dot{width:10px;height:10px;border-radius:50%;flex:none;}
.cc-bc-nm{flex:1;font-size:13px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cc-bc-bg{font-size:9.5px;font-weight:700;color:#fff;border-radius:5px;padding:2px 6px;flex:none;}
.cc-band-empty{font-size:11.5px;color:#6b6786;padding:4px 2px;}
.cc-dayscroll{overflow-y:auto;-webkit-overflow-scrolling:touch;height:clamp(360px,52vh,520px);position:relative;}
.cc-timeline{position:relative;}
.cc-hour{position:absolute;left:0;right:0;height:0;border-top:1px solid #e9e6f3;}
.cc-hl{position:absolute;top:-7px;left:0;width:42px;text-align:right;padding-right:6px;font-size:10px;color:#6b6786;font-family:"Plus Jakarta Sans",inherit;background:#fff;}
.cc-evarea{position:absolute;left:48px;right:6px;top:0;bottom:0;}
.cc-evblock{position:absolute;border-radius:7px;padding:3px 6px;overflow:hidden;box-shadow:0 2px 6px rgba(80,63,160,.18);font-size:11px;line-height:1.25;}
.cc-bt{font-weight:700;font-size:9.5px;opacity:.95;}
.cc-bn{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cc-nowline{position:absolute;left:42px;right:0;height:2px;background:#e0556b;z-index:5;}
.cc-nowline:before{content:"";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:#e0556b;}

.cc-otab{color:#6b6786;font-size:13px;text-align:center;padding:34px 16px;}

.cc-tabbar{position:absolute;left:0;right:0;bottom:0;display:flex;background:rgba(255,255,255,.97);border-top:1px solid #e9e6f3;}
.cc-tabbar button{flex:1;padding:11px 0 10px;font-size:10.5px;font-weight:600;color:#6b6786;background:transparent;border:none;font-family:inherit;cursor:pointer;}
.cc-tabbar button.on{color:#8b5cf6;}

.cc-bulk{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.97);border-top:1px solid #e9e6f3;padding:12px 16px;box-shadow:0 -8px 24px rgba(80,63,160,.10);z-index:9;}
.cc-desktop .cc-bulk{border-radius:0 0 22px 22px;}
.cc-bulk-info{flex:1;font-size:12.5px;color:#6b6786;}
.cc-bulk-info b{color:#2b2842;font-size:14px;}
.cc-cnt{color:#8b5cf6;font-weight:700;}
.cc-bulk button{padding:11px 16px;border-radius:12px;border:none;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;}
.cc-reg{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;box-shadow:0 6px 14px rgba(124,92,246,.35);}
.cc-cancel{background:#f0eef7;color:#6b6786;}

/* ==== modal / sheet ==== */
.cc-modal{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-end;justify-content:center;background:rgba(43,40,66,.4);}
.cc-desktop .cc-modal{border-radius:22px;}
.cc-sheet{background:#fff;width:100%;max-width:520px;border-radius:24px 24px 0 0;padding:20px 18px 24px;max-height:90%;overflow:auto;animation:ccup .22s ease;}
@keyframes ccup{from{transform:translateY(40px);opacity:.5;}to{transform:translateY(0);opacity:1;}}
.cc-sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.cc-sheet-head h3{margin:0;font-size:17px;font-weight:700;}
.cc-sub{font-size:12px;color:#6b6786;margin-top:2px;}
.cc-close-x{width:32px;height:32px;border-radius:10px;border:none;background:#f0eef7;color:#6b6786;font-size:17px;cursor:pointer;}

.cc-setsec{margin-bottom:16px;}
.cc-setsec-top{border-top:1px solid #e9e6f3;padding-top:14px;}
.cc-setsec h4{font-size:13.5px;font-weight:700;margin:0 0 10px;}
.cc-frow{margin-bottom:13px;}
.cc-frow-2{display:flex;gap:10px;}
.cc-frow label{display:block;font-size:12px;font-weight:600;color:#6b6786;margin-bottom:6px;}
.cc-frow input[type=text],.cc-frow input[type=date],.cc-frow input[type=time]{width:100%;padding:12px 13px;border:1.6px solid #e9e6f3;border-radius:12px;font-size:15px;font-family:inherit;outline:none;background:#fafaff;color:#2b2842;}
.cc-frow input:focus{border-color:#8b5cf6;background:#fff;}
.cc-select{width:100%;padding:11px 10px;border:1.6px solid #e9e6f3;border-radius:12px;font-size:15px;font-family:inherit;background:#fafaff;outline:none;color:#2b2842;}
.cc-nthmulti{display:flex;flex-wrap:wrap;gap:6px;}
.cc-nchip{padding:8px 11px;border:1.6px solid #e9e6f3;background:#fafaff;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;color:#6b6786;cursor:pointer;}
.cc-nchip.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,#6366f1,#a855f7);box-shadow:0 4px 10px rgba(80,63,160,.18);}
.cc-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;background:#faf9fe;border:1px solid #e9e6f3;border-radius:12px;}
.cc-lbl b{font-size:13.5px;}
.cc-lbl span{display:block;font-size:11px;color:#6b6786;margin-top:2px;}
.cc-switch{position:relative;width:46px;height:27px;flex:none;}
.cc-switch input{display:none;}
.cc-track{position:absolute;inset:0;background:#dcd8ec;border-radius:20px;transition:.18s;}
.cc-knob{position:absolute;top:3px;left:3px;width:21px;height:21px;background:#fff;border-radius:50%;transition:.18s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
.cc-switch input:checked ~ .cc-track{background:linear-gradient(135deg,#6366f1,#a855f7);}
.cc-switch input:checked ~ .cc-knob{transform:translateX(19px);}
.cc-timerange{display:flex;align-items:center;gap:10px;}
.cc-timerange input{flex:1;min-width:0;text-align:center;}
.cc-timerange span{color:#6b6786;font-weight:700;}
.cc-oseg{display:flex;gap:6px;}
.cc-oseg button{flex:1;padding:9px 0;border:1.6px solid #e9e6f3;background:#fafaff;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;color:#6b6786;cursor:pointer;}
.cc-oseg button.on{color:#fff;border-color:transparent;box-shadow:0 4px 10px rgba(80,63,160,.18);}
.cc-oseg button.on.husband{background:#3b82f6;}
.cc-oseg button.on.wife{background:#ec4899;}
.cc-oseg button.on.common{background:linear-gradient(135deg,#6366f1,#a855f7);}
.cc-colorpick{display:flex;flex-wrap:wrap;gap:9px;}
.cc-c{width:30px;height:30px;border-radius:9px;cursor:pointer;border:2.5px solid transparent;}
.cc-c.sel{border-color:#2b2842;transform:scale(1.08);}
.cc-c.rec{box-shadow:0 0 0 2px #fff,0 0 0 3px #8b5cf6;}
.cc-frow textarea{width:100%;min-height:74px;border:1.6px solid #e9e6f3;border-radius:12px;padding:12px 13px;font-family:inherit;font-size:15px;line-height:1.6;color:#2b2842;background:#fafaff;outline:none;resize:vertical;}
.cc-frow textarea:focus{border-color:#8b5cf6;background:#fff;}
.cc-btn{width:100%;padding:14px;border:none;border-radius:13px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:700;color:#fff;letter-spacing:.03em;background:linear-gradient(135deg,#6366f1,#a855f7);box-shadow:0 8px 18px rgba(124,92,246,.35);margin-top:6px;}
.cc-rule-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid #e9e6f3;border-radius:12px;background:#faf9fe;margin-bottom:8px;}
.cc-ri-dot{width:11px;height:11px;border-radius:50%;flex:none;}
.cc-ri-meta{flex:1;min-width:0;}
.cc-ri-meta b{font-size:13.5px;}
.cc-ri-meta span{display:block;font-size:11px;color:#6b6786;margin-top:1px;}
.cc-ri-del{border:none;background:none;color:#c9b8e8;cursor:pointer;padding:4px;flex:none;font-size:14px;}
.cc-rules-empty{font-size:12.5px;color:#6b6786;text-align:center;padding:14px;}

.cc-toast{position:absolute;left:50%;bottom:78px;transform:translateX(-50%);background:#2b2842;color:#fff;font-size:12.5px;font-weight:600;padding:10px 16px;border-radius:12px;z-index:40;box-shadow:0 8px 24px rgba(0,0,0,.25);white-space:nowrap;}

.cc-cta{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:26px;}
.cc-cta a{display:inline-flex;padding:12px 22px;border-radius:999px;background:#2b2842;color:#fff;font-family:ui-monospace,monospace;font-size:12px;text-decoration:none;}
.cc-cta a:hover{background:#8B3A2C;}
.cc-cta span{font-size:12px;color:#6E665B;max-width:420px;line-height:1.7;}
.cc-foot{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:20px;border-top:1px solid #D8D2C5;}
.cc-foot a{font-family:ui-monospace,monospace;font-size:11px;color:#2b2842;text-decoration:none;}
.cc-foot a:hover{color:#8B3A2C;}
.cc-foot span{font-family:ui-monospace,monospace;font-size:11px;color:#6E665B;}
`;
