import React from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
  Label,
} from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

/**
 * NightShiftScatter
 * 散布図 ＋ 単回帰線 ＋ 95%信頼区間帯（平均応答のCI）。
 * 回帰線とCI帯は渡された points から内部計算する（ハードコードしない）。
 * r / ρ / p / n は「表示用の確定値」を props で受け取り、キャプションに出す。
 *
 * MDX からの呼び出しは NightShiftChart と同じくバッククォートJSON文字列を使う:
 *   <NightShiftScatter
 *     points={`[{"x":56,"y":4},{"x":185,"y":4}, ... 全24点]`}
 *     xLabel="明け仮眠の長さ (分)" yLabel="回復日数 (日)"
 *     pearsonR={-0.10} spearmanRho={-0.23} pValue={0.65} n={24}
 *     showRegression={true} showConfidenceBand={true}
 *     annotations={`[{"x":185,"y":4,"label":"185分→4日"},{"x":56,"y":4,"label":"56分→4日"}]`}
 *     caption="..." height={420}
 *   />
 */

type Pt = { x: number; y: number };
type Anno = { x: number; y: number; label: string };

interface NightShiftScatterProps {
  points: string | Pt[];
  xLabel?: string;
  yLabel?: string;
  pearsonR?: number | string;
  spearmanRho?: number | string;
  pValue?: number | string;
  n?: number | string;
  showRegression?: boolean;
  showConfidenceBand?: boolean;
  annotations?: string | Anno[];
  caption?: string;
  height?: number;
}

// wabi-sabi パレット（記事トーンに合わせる）＋ Meridian の amber を散布点に
const INK = '#3A342B';
const RULE = '#D8D2C5';
const AMBER = '#C08A2D'; // 散布点
const BENGARA = '#8B3A2C'; // 弁柄＝回帰線
const BAND = 'rgba(139, 58, 44, 0.12)'; // CI帯（弁柄の淡色）
const FONT = "'Shippori Mincho B1', 'Inter', sans-serif";

function parseArr<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

// points を正規化：{x,y} オブジェクトでも [x,y] タプルでも受ける。
// これで抽出側の出力形の食い違いで点が黙って全脱落する事故を防ぐ。
function normPoints(v: unknown): Pt[] {
  const raw = parseArr<unknown>(v);
  return raw
    .map((p): Pt => {
      if (Array.isArray(p)) return { x: Number(p[0]), y: Number(p[1]) };
      if (p && typeof p === 'object') {
        const o = p as Record<string, unknown>;
        return { x: Number(o.x), y: Number(o.y) };
      }
      return { x: NaN, y: NaN };
    })
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

function toNum(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function fmt(v: number | undefined): string {
  if (v === undefined) return '—';
  // 符号付きで小数2桁。−（U+2212）で表記を揃える。
  const s = v.toFixed(2);
  return s.startsWith('-') ? '\u2212' + s.slice(1) : s;
}

// 両側95% t 分位点（Cornish–Fisher 展開・df>=1）。n=24→df=22 で ≈2.074。
function t95(df: number): number {
  if (df <= 0) return NaN;
  const z = 1.959963985;
  const z3 = z * z * z;
  const z5 = z3 * z * z;
  const c1 = (z3 + z) / (4 * df);
  const c2 = (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df);
  return z + c1 + c2;
}

function NightShiftScatter(props: NightShiftScatterProps): React.ReactElement {
  const pts = normPoints(props.points);
  const annos = parseArr<Anno>(props.annotations);
  const height = toNum(props.height) ?? 400;
  const showReg = props.showRegression !== false;
  const showBand = props.showConfidenceBand !== false;
  const n = pts.length;

  // --- x 軸ドメイン（5%パディング） ---
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const xMinRaw = xs.length ? Math.min(...xs) : 0;
  const xMaxRaw = xs.length ? Math.max(...xs) : 1;
  const xPad = (xMaxRaw - xMinRaw) * 0.05 || 1;
  const xMin = Math.max(0, xMinRaw - xPad);
  const xMax = xMaxRaw + xPad;

  const yMinRaw = ys.length ? Math.min(...ys) : 0;
  const yMaxRaw = ys.length ? Math.max(...ys) : 1;
  const yPad = (yMaxRaw - yMinRaw) * 0.15 || 1;

  // --- 単回帰 ＋ 平均応答の95%CI ---
  let gridData: { x: number; yhat: number; band: [number, number] }[] = [];
  if (n >= 3) {
    const xbar = xs.reduce((a, b) => a + b, 0) / n;
    const ybar = ys.reduce((a, b) => a + b, 0) / n;
    let Sxx = 0;
    let Sxy = 0;
    for (let i = 0; i < n; i++) {
      Sxx += (xs[i] - xbar) ** 2;
      Sxy += (xs[i] - xbar) * (ys[i] - ybar);
    }
    const slope = Sxx === 0 ? 0 : Sxy / Sxx;
    const intercept = ybar - slope * xbar;
    let sse = 0;
    for (let i = 0; i < n; i++) {
      const yhat = intercept + slope * xs[i];
      sse += (ys[i] - yhat) ** 2;
    }
    const s = Math.sqrt(sse / (n - 2)); // 残差標準誤差
    const tCrit = t95(n - 2);
    const STEPS = 48;
    for (let k = 0; k <= STEPS; k++) {
      const x = xMin + ((xMax - xMin) * k) / STEPS;
      const yhat = intercept + slope * x;
      // 平均応答のSE: s * sqrt(1/n + (x - xbar)^2 / Sxx)
      const seMean =
        Sxx === 0 ? 0 : s * Math.sqrt(1 / n + (x - xbar) ** 2 / Sxx);
      const half = tCrit * seMean;
      gridData.push({ x, yhat, band: [yhat - half, yhat + half] });
    }
  }

  const statLine = [
    props.pearsonR !== undefined ? `r = ${fmt(toNum(props.pearsonR))}` : null,
    props.spearmanRho !== undefined
      ? `\u03c1 = ${fmt(toNum(props.spearmanRho))}`
      : null,
    props.pValue !== undefined
      ? `p = ${toNum(props.pValue)?.toFixed(2)}（参考）`
      : null,
    props.n !== undefined ? `n = ${toNum(props.n)}` : null,
  ]
    .filter(Boolean)
    .join('　/　');

  return (
    <figure style={{ margin: '2rem 0', fontFamily: FONT }}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart margin={{ top: 16, right: 24, bottom: 40, left: 16 }}>
          <CartesianGrid stroke={RULE} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[Math.floor(xMin), Math.ceil(xMax)]}
            tick={{ fill: INK, fontSize: 12 }}
            stroke={RULE}
          >
            <Label
              value={props.xLabel ?? ''}
              position="bottom"
              offset={16}
              style={{ fill: INK, fontSize: 13 }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={[Math.max(0, yMinRaw - yPad), yMaxRaw + yPad]}
            tick={{ fill: INK, fontSize: 12 }}
            stroke={RULE}
          >
            <Label
              value={props.yLabel ?? ''}
              angle={-90}
              position="left"
              offset={0}
              style={{ fill: INK, fontSize: 13, textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip
            cursor={{ stroke: RULE }}
            formatter={(value?: ValueType, name?: NameType): [string, NameType | undefined] => [String(value), name]}
          />
          {showBand && gridData.length > 0 && (
            <Area
              data={gridData}
              dataKey="band"
              stroke="none"
              fill={BAND}
              isAnimationActive={false}
              legendType="none"
              activeDot={false}
            />
          )}
          {showReg && gridData.length > 0 && (
            <Line
              data={gridData}
              dataKey="yhat"
              stroke={BENGARA}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              legendType="none"
              activeDot={false}
            />
          )}
          <Scatter
            data={pts}
            fill={AMBER}
            fillOpacity={0.85}
            isAnimationActive={false}
          />
          {annos.map((a, i) => (
            <ReferenceDot
              key={`anno-${i}`}
              x={a.x}
              y={a.y}
              r={6}
              stroke={BENGARA}
              strokeWidth={1.5}
              fill="none"
            >
              <Label
                value={a.label}
                position="top"
                offset={8}
                style={{ fill: BENGARA, fontSize: 11 }}
              />
            </ReferenceDot>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      {(statLine || props.caption) && (
        <figcaption
          style={{
            marginTop: '0.75rem',
            fontSize: '0.85rem',
            color: '#6E665B',
            lineHeight: 1.6,
          }}
        >
          {statLine && (
            <span style={{ color: INK, fontWeight: 600 }}>{statLine}</span>
          )}
          {statLine && props.caption && <br />}
          {props.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default NightShiftScatter;
