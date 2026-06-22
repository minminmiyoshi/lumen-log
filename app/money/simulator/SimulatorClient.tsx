"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── 型定義 ───────────────────────────────────────────
type WithdrawMode = "fixed" | "pct";
type TabMode = "all" | "personal" | "corp" | "three";

interface SidePeriod {
  from: number;
  to: number;
  amount: number;
}

interface Params {
  age: number;
  fireAge: number;
  lifespan: number;
  inflation: number;
  personalAssets: number;
  income: number;
  expense: number;
  personalRate: number;
  retireBonus: number;
  corpFoundAge: number;
  corpInitial: number;
  execPay: number;
  corpExpense: number;
  corpRate: number;
  retireExpense: number;
  retireRate: number;
  withdrawMode: WithdrawMode;
  withdrawFixed: number;
  withdrawPct: number;
  periods: SidePeriod[];
}

// ─── 税計算ユーティリティ ────────────────────────────
function personalTaxRate(incomeMan: number): number {
  const inc = incomeMan * 10000;
  const brackets: [number, number, number][] = [
    [1_950_000, 0.05, 0],
    [3_300_000, 0.10, 97_500],
    [6_950_000, 0.20, 232_500],
    [9_000_000, 0.23, 962_500],
    [18_000_000, 0.33, 1_434_000],
    [Infinity, 0.40, 4_404_000],
  ];
  let tax = 0;
  let prev = 0;
  for (const [lim, rate, base] of brackets) {
    if (inc <= lim) { tax = base + (inc - prev) * rate; break; }
    prev = lim;
  }
  tax += inc * 0.10 + Math.min(inc * 0.14, 1_300_000);
  return Math.min(tax / inc, 0.65);
}

function corpTaxAmount(profitMan: number): number {
  if (profitMan <= 0) return 0;
  const p = profitMan * 10_000;
  return (p <= 8_000_000 ? p * 0.15 : 8_000_000 * 0.15 + (p - 8_000_000) * 0.232) / 10_000;
}

function getSideIncome(yr: number, periods: SidePeriod[]): number {
  return periods.reduce((sum, p) => (yr >= p.from && yr <= p.to ? sum + p.amount : sum), 0);
}

// ─── コアシミュレーション ────────────────────────────
function simulate(p: Params) {
  const {
    age, fireAge, lifespan, inflation,
    personalAssets, income, expense, personalRate, retireBonus,
    corpFoundAge, corpInitial, execPay, corpExpense, corpRate,
    retireExpense, retireRate, withdrawMode, withdrawFixed, withdrawPct,
    periods,
  } = p;

  const fa = Math.max(age + 1, fireAge);
  const inf = inflation / 100;
  const pr = personalRate / 100;
  const cr = corpRate / 100;
  const rr = retireRate / 100;

  const txR = personalTaxRate(income);
  const netInc = income * (1 - txR);

  const labels: string[] = [];
  const pData: number[] = [];
  const cData: number[] = [];
  const tData: number[] = [];

  let pVal = personalAssets;
  let cVal = 0;
  let corpFounded = corpFoundAge <= age;
  if (corpFounded) cVal = corpInitial;
  let depleted: number | null = null;

  // 資産形成フェーズ
  for (let yr = age; yr <= fa; yr++) {
    if (!corpFounded && yr === corpFoundAge) {
      corpFounded = true;
      cVal = corpInitial;
      pVal -= corpInitial;
    }
    labels.push(`${yr}歳`);
    const side = getSideIncome(yr, periods);
    const netSide = side > 0 ? side * (1 - personalTaxRate(income + side)) : 0;
    const save = Math.max(0, netInc + netSide - expense);

    pData.push(Math.round(Math.max(0, pVal)));
    cData.push(Math.round(Math.max(0, cVal)));
    tData.push(Math.round(Math.max(0, pVal) + Math.max(0, cVal)));

    if (yr < fa) {
      pVal = pVal * (1 + pr) + save;
      if (corpFounded) {
        const profit = Math.max(0, income - execPay - corpExpense);
        cVal = cVal * (1 + cr) + (profit - corpTaxAmount(profit));
      }
    }
  }

  pVal += retireBonus;
  const firePersonal = pVal;
  const fireCorp = cVal;

  // 取り崩しフェーズ
  for (let yr = fa + 1; yr <= lifespan; yr++) {
    labels.push(`${yr}歳`);
    const yrs = yr - fa;
    const sideNet = getSideIncome(yr, periods) * 0.80;
    const livingCost = retireExpense * Math.pow(1 + inf, yrs - 1);
    const shortfall = Math.max(0, livingCost - sideNet);
    const surplus = Math.max(0, sideNet - livingCost);

    let draw: number;
    if (withdrawMode === "fixed") {
      draw = shortfall;
    } else {
      draw = Math.max(0, pVal * (withdrawPct / 100) - sideNet);
    }

    pVal = pVal * (1 + rr) - draw + surplus;
    cVal = cVal * (1 + cr);

    if (pVal < 0 && !depleted) depleted = yr;
    pData.push(Math.max(0, Math.round(pVal)));
    cData.push(Math.max(0, Math.round(cVal)));
    tData.push(Math.max(0, Math.round(pVal)) + Math.max(0, Math.round(cVal)));
  }

  return { labels, pData, cData, tData, firePersonal, fireCorp, depleted };
}

// ─── フォーマット ────────────────────────────────────
function fmt(v: number): string {
  if (v >= 10_000) return `${(v / 10_000).toFixed(1)}億円`;
  return `${Math.round(v).toLocaleString()}万円`;
}

function fmtYAxis(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(0)}億`;
  return `${Math.round(v / 100) * 100}万`;
}

// ─── スライダー行コンポーネント ──────────────────────
function SliderRow({
  label, value, min, max, step, display,
  onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  display: string; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-500">{label}</span>
        <span className="font-medium text-zinc-800 dark:text-zinc-200">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
}

// ─── セクションカード ────────────────────────────────
function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">{icon} {title}</p>
      {children}
    </div>
  );
}

// ─── サマリーカード ──────────────────────────────────
function StatCard({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={`text-lg font-medium ${danger ? "text-red-500" : "text-zinc-800 dark:text-zinc-200"}`}>
        {value}
      </div>
    </div>
  );
}

// ─── チャートの色定義 ────────────────────────────────
const CHART_COLORS = {
  合算: { stroke: "#185FA5", fill: "rgba(24,95,165,0.07)" },
  個人: { stroke: "#0F6E56", fill: "rgba(15,110,86,0.07)" },
  法人: { stroke: "#BA7517", fill: "rgba(186,117,23,0.07)" },
} as const;

// ─── メインコンポーネント ────────────────────────────
export default function SimulatorClient() {
  // params
  const [age, setAge] = useState(38);
  const [fireAge, setFireAge] = useState(50);
  const [lifespan, setLifespan] = useState(90);
  const [inflation, setInflation] = useState(2.0);
  const [personalAssets, setPersonalAssets] = useState(3000);
  const [income, setIncome] = useState(2000);
  const [expense, setExpense] = useState(600);
  const [personalRate, setPersonalRate] = useState(5.0);
  const [retireBonus, setRetireBonus] = useState(500);
  const [corpFoundAge, setCorpFoundAge] = useState(40);
  const [corpInitial, setCorpInitial] = useState(500);
  const [execPay, setExecPay] = useState(1200);
  const [corpExpense, setCorpExpense] = useState(200);
  const [corpRate, setCorpRate] = useState(3.0);
  const [retireExpense, setRetireExpense] = useState(500);
  const [retireRate, setRetireRate] = useState(3.0);
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>("fixed");
  const [withdrawFixed, setWithdrawFixed] = useState(500);
  const [withdrawPct, setWithdrawPct] = useState(4.0);
  const [periods, setPeriods] = useState<SidePeriod[]>([{ from: 38, to: 55, amount: 300 }]);
  const [tab, setTab] = useState<TabMode>("all");

  const addPeriod = () => setPeriods([...periods, { from: age, to: fireAge + 10, amount: 200 }]);
  const delPeriod = (i: number) => setPeriods(periods.filter((_, idx) => idx !== i));
  const updatePeriod = (i: number, key: keyof SidePeriod, val: number) => {
    const next = [...periods];
    next[i] = { ...next[i], [key]: val };
    setPeriods(next);
  };

  const applyPreset = (key: "attending" | "senior" | "independent") => {
    const presets = {
      attending:   { income: 2000, personalAssets: 3000, expense: 600, fireAge: 50, execPay: 1200, corpInitial: 500, corpFoundAge: 40 },
      senior:      { income: 3000, personalAssets: 5000, expense: 800, fireAge: 48, execPay: 1800, corpInitial: 1000, corpFoundAge: 38 },
      independent: { income: 5000, personalAssets: 8000, expense: 1200, fireAge: 55, execPay: 2400, corpInitial: 2000, corpFoundAge: 42 },
    };
    const p = presets[key];
    setIncome(p.income); setPersonalAssets(p.personalAssets); setExpense(p.expense);
    setFireAge(p.fireAge); setExecPay(p.execPay); setCorpInitial(p.corpInitial);
    setCorpFoundAge(p.corpFoundAge);
  };

  const params: Params = {
    age, fireAge, lifespan, inflation,
    personalAssets, income, expense, personalRate, retireBonus,
    corpFoundAge, corpInitial, execPay, corpExpense, corpRate,
    retireExpense, retireRate, withdrawMode, withdrawFixed, withdrawPct, periods,
  };

  const result = useMemo(() => simulate(params), [
    age, fireAge, lifespan, inflation, personalAssets, income, expense,
    personalRate, retireBonus, corpFoundAge, corpInitial, execPay, corpExpense,
    corpRate, retireExpense, retireRate, withdrawMode, withdrawFixed, withdrawPct, periods,
  ]);

  const { labels, pData, cData, tData, firePersonal, fireCorp, depleted } = result;

  // Recharts用データ変換
  const chartData = useMemo(() =>
    labels.map((label, i) => ({
      label,
      合算: tData[i],
      個人: pData[i],
      法人: cData[i],
    })),
    [labels, tData, pData, cData]
  );

  const visibleSeries = useMemo(() => {
    if (tab === "all") return ["合算"] as const;
    if (tab === "personal") return ["個人"] as const;
    if (tab === "corp") return ["法人"] as const;
    return ["合算", "個人", "法人"] as const;
  }, [tab]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium text-zinc-800 dark:text-zinc-200 mb-1">FIREシミュレーター</h1>
      <p className="text-sm text-zinc-500 mb-6">個人資産・法人資産・副業収入を統合したFIREシミュレーション</p>

      {/* プリセット */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <span className="text-sm text-zinc-500">プリセット：</span>
        {(["attending", "senior", "independent"] as const).map((k) => (
          <button key={k} onClick={() => applyPreset(k)}
            className="text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            {{ attending: "勤務医（一般）", senior: "勤務医（シニア）", independent: "開業医" }[k]}
          </button>
        ))}
      </div>

      {/* 基本設定・個人資産 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card title="基本設定" icon="⚙️">
          <SliderRow label="現在の年齢" value={age} min={25} max={65} step={1} display={`${age}歳`} onChange={setAge} />
          <SliderRow label="FIRE目標年齢" value={fireAge} min={35} max={75} step={1} display={`${fireAge}歳`} onChange={setFireAge} />
          <SliderRow label="想定寿命" value={lifespan} min={70} max={100} step={1} display={`${lifespan}歳`} onChange={setLifespan} />
          <SliderRow label="インフレ率" value={inflation} min={0} max={5} step={0.1} display={`${inflation.toFixed(1)}%`} onChange={setInflation} />
        </Card>
        <Card title="個人資産" icon="💰">
          <SliderRow label="現在の個人資産" value={personalAssets} min={0} max={30000} step={100} display={fmt(personalAssets)} onChange={setPersonalAssets} />
          <SliderRow label="本業年収（税引前）" value={income} min={500} max={8000} step={50} display={fmt(income)} onChange={setIncome} />
          <SliderRow label="個人年間支出" value={expense} min={100} max={3000} step={50} display={fmt(expense)} onChange={setExpense} />
          <SliderRow label="個人資産の運用利回り" value={personalRate} min={0} max={15} step={0.1} display={`${personalRate.toFixed(1)}%`} onChange={setPersonalRate} />
          <SliderRow label="退職金（一時金）" value={retireBonus} min={0} max={10000} step={100} display={fmt(retireBonus)} onChange={setRetireBonus} />
        </Card>
      </div>

      {/* 法人・取り崩し */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card title="法人設定" icon="🏢">
          <SliderRow label="法人設立年齢" value={corpFoundAge} min={25} max={65} step={1} display={`${corpFoundAge}歳`} onChange={setCorpFoundAge} />
          {corpFoundAge > age && (
            <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 rounded-lg px-3 py-2 mb-3">
              {corpFoundAge}歳で法人設立。それまでは法人への積み立てなし。
            </p>
          )}
          <SliderRow label="設立時の初期資本（個人→法人）" value={corpInitial} min={0} max={5000} step={100} display={fmt(corpInitial)} onChange={setCorpInitial} />
          <SliderRow label="役員報酬（年）" value={execPay} min={0} max={5000} step={100} display={fmt(execPay)} onChange={setExecPay} />
          <SliderRow label="法人の年間経費" value={corpExpense} min={0} max={2000} step={50} display={fmt(corpExpense)} onChange={setCorpExpense} />
          <SliderRow label="法人資産の運用利回り" value={corpRate} min={0} max={15} step={0.1} display={`${corpRate.toFixed(1)}%`} onChange={setCorpRate} />
          <p className="text-xs text-zinc-400 mt-2">法人税：利益800万以下→15%、超過→23.2%（簡易）</p>
        </Card>
        <Card title="取り崩しフェーズ" icon="📉">
          <SliderRow label="FIRE後の年間生活費" value={retireExpense} min={100} max={3000} step={50} display={fmt(retireExpense)} onChange={setRetireExpense} />
          <SliderRow label="取り崩し後の利回り" value={retireRate} min={0} max={10} step={0.1} display={`${retireRate.toFixed(1)}%`} onChange={setRetireRate} />
          <div className="mb-3">
            <p className="text-sm text-zinc-500 mb-2">取り崩し方式</p>
            <div className="flex gap-4">
              {(["fixed", "pct"] as const).map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="wmode" value={m} checked={withdrawMode === m} onChange={() => setWithdrawMode(m)} className="accent-blue-600" />
                  {m === "fixed" ? "定額" : "定率"}
                </label>
              ))}
            </div>
          </div>
          {withdrawMode === "fixed"
            ? <SliderRow label="定額取り崩し（年）" value={withdrawFixed} min={100} max={3000} step={50} display={fmt(withdrawFixed)} onChange={setWithdrawFixed} />
            : <SliderRow label="定率取り崩し" value={withdrawPct} min={1} max={10} step={0.1} display={`${withdrawPct.toFixed(1)}%`} onChange={setWithdrawPct} />
          }
        </Card>
      </div>

      {/* 副業収入 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          💼 副業収入の期間設定
          <span className="ml-2 text-xs font-normal text-zinc-400">FIRE前後どちらも有効</span>
        </p>
        <p className="text-xs text-zinc-400 mb-3">FIRE後は「生活費に充当→余剰を運用」として計算。副業収入が生活費を上回る年は取り崩しゼロ。</p>
        {periods.length === 0 && (
          <p className="text-sm text-zinc-400 mb-3">期間が設定されていません</p>
        )}
        {periods.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 mb-2 flex-wrap">
            <input type="number" min={25} max={100} value={p.from}
              onChange={(e) => updatePeriod(i, "from", Number(e.target.value))}
              className="w-14 text-sm border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200" />
            <span className="text-zinc-400">歳〜</span>
            <input type="number" min={25} max={100} value={p.to}
              onChange={(e) => updatePeriod(i, "to", Number(e.target.value))}
              className="w-14 text-sm border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200" />
            <span className="text-zinc-400">歳　副業</span>
            <input type="number" min={0} max={5000} value={p.amount}
              onChange={(e) => updatePeriod(i, "amount", Number(e.target.value))}
              className="w-20 text-sm border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200" />
            <span className="text-zinc-400">万円/年</span>
            <button onClick={() => delPeriod(i)} className="ml-auto text-zinc-400 hover:text-red-500 transition-colors text-xs px-2 py-1">✕</button>
          </div>
        ))}
        <button onClick={addPeriod}
          className="text-sm px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mt-1">
          ＋ 期間を追加
        </button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <StatCard label="FIRE時・個人資産" value={fmt(Math.round(firePersonal))} />
        <StatCard label="FIRE時・法人資産" value={fmt(Math.round(fireCorp))} />
        <StatCard label="FIRE時・合算" value={fmt(Math.round(firePersonal + fireCorp))} />
        <StatCard label="寿命時残高（合算）" value={fmt(tData[tData.length - 1] ?? 0)} />
        <StatCard label="資産枯渇" value={depleted ? `${depleted}歳` : "なし"} danger={!!depleted} />
      </div>

      {/* グラフ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["all", "personal", "corp", "three"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${tab === t
                ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
              {{ all: "合算", personal: "個人", corp: "法人", three: "3系統" }[t]}
            </button>
          ))}
        </div>
        <div className="w-full h-64 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,135,128,0.12)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#888780" }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#888780" }}
                tickFormatter={fmtYAxis}
                width={52}
              />
              <Tooltip
                formatter={(value: unknown, name: string) => [fmt(value as number), name]}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12 }}
              />
              {visibleSeries.map((name) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={CHART_COLORS[name].stroke}
                  fill={CHART_COLORS[name].fill}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 flex-wrap">
          {visibleSeries.map((name) => (
            <span key={name} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="inline-block w-3 h-0.5" style={{ background: CHART_COLORS[name].stroke }} />
              {name}
            </span>
          ))}
        </div>
        <p className="text-xs text-zinc-400 mt-3">
          ※税計算は簡易概算。FIRE後副業収入の税率は20%（雑所得相当）で概算。法人清算・相続はスコープ外（運用継続で表示）。
        </p>
      </div>
    </main>
  );
}
