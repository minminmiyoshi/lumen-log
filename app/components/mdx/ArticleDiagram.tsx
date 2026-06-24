'use client'

import { useEffect, useRef } from 'react'

// ─── Color tokens (match lumen-log's wabi-sabi palette) ───
const C = {
  bg: '#F4F0E8',
  ink: '#1B1B19',
  accent: '#8B3A2C',    // 弁柄
  muted: '#6E665B',     // 霞
  teal: '#4A5859',      // 藍鼠
  border: '#D8D2C5',
  // Semantic
  purple: '#6B5FA0',
  purpleBg: '#EEEDFE',
  coral: '#D85A30',
  coralBg: '#FAECE7',
  green: '#1D9E75',
  greenBg: '#E1F5EE',
  amber: '#BA7517',
  amberBg: '#FAEEDA',
  red: '#A32D2D',
  redBg: '#FCEBEB',
  pinkBg: '#FBEAF0',
  pink: '#993556',
  grayBg: '#F1EFE8',
  gray: '#5F5E5A',
}

// ─── SVG building blocks ───
function Arrow({ x1, y1, x2, y2, color = C.muted, dashed = false }: {
  x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={1.5}
      markerEnd="url(#arrowhead)"
      strokeDasharray={dashed ? '4 3' : undefined}
    />
  )
}

function ArrowPath({ d, color = C.muted, dashed = false }: {
  d: string; color?: string; dashed?: boolean
}) {
  return (
    <path
      d={d} fill="none"
      stroke={color} strokeWidth={1.5}
      markerEnd="url(#arrowhead)"
      strokeDasharray={dashed ? '4 3' : undefined}
    />
  )
}

function Box({ x, y, w, h, fill, stroke, rx = 8, strokeWidth = 0.5, children }: {
  x: number; y: number; w: number; h: number
  fill: string; stroke: string; rx?: number; strokeWidth?: number
  children?: React.ReactNode
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {children}
    </g>
  )
}

function Label({ x, y, text, size = 14, weight = 400, fill = C.ink, anchor = 'middle' as const }: {
  x: number; y: number; text: string; size?: number; weight?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'
}) {
  return (
    <text
      x={x} y={y}
      textAnchor={anchor} dominantBaseline="central"
      fontFamily="'Shippori Mincho B1', 'Inter', sans-serif"
      fontSize={size} fontWeight={weight} fill={fill}
    >
      {text}
    </text>
  )
}

// ─── Diagram: 3-pathway synchronization model ───
function ThreePathwayDiagram() {
  return (
    <svg
      width="100%" viewBox="0 0 680 530"
      role="img" aria-label="腸内細菌の概日リズム同期 3経路モデル"
      style={{ maxWidth: 680, margin: '0 auto', display: 'block' }}
    >
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refX={8} refY={5}
          markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
            strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* Title */}
      <Label x={340} y={30} text="腸内細菌の概日リズム同期 — 3経路モデル" size={15} weight={500} />

      {/* Light */}
      <Box x={240} y={55} w={200} h={44} fill={C.amberBg} stroke={C.amber}>
        <Label x={340} y={77} text="光（明暗サイクル）" weight={500} fill={C.amber} />
      </Box>

      <Arrow x1={340} y1={99} x2={340} y2={130} />

      {/* SCN */}
      <Box x={220} y={132} w={240} h={56} fill={C.purpleBg} stroke={C.purple}>
        <Label x={340} y={152} text="視交叉上核（SCN）" weight={500} fill={C.purple} />
        <Label x={340} y={172} text="中枢時計・マスタークロック" size={11} fill={C.muted} />
      </Box>

      {/* Pathway labels */}
      <Label x={98} y={218} text="経路 ①" size={12} fill={C.purple} anchor="start" />
      <Label x={545} y={218} text="経路 ②" size={12} fill={C.coral} anchor="start" />

      {/* SCN → Peripheral clock */}
      <Arrow x1={280} y1={188} x2={175} y2={262} color={C.purple} />
      {/* SCN → Feeding */}
      <Arrow x1={400} y1={188} x2={505} y2={262} color={C.coral} />

      {/* Peripheral clock */}
      <Box x={55} y={264} w={230} h={56} fill={C.purpleBg} stroke={C.purple}>
        <Label x={170} y={284} text="腸管末梢時計" weight={500} fill={C.purple} />
        <Label x={170} y={304} text="Bmal1 / Clock / Per1/2" size={11} fill={C.muted} />
      </Box>

      {/* Feeding */}
      <Box x={395} y={264} w={230} h={56} fill={C.coralBg} stroke={C.coral}>
        <Label x={510} y={284} text="食事タイミング" weight={500} fill={C.coral} />
        <Label x={510} y={304} text="基質の流入リズム" size={11} fill={C.muted} />
      </Box>

      {/* Arrows to gut bacteria */}
      <Arrow x1={170} y1={320} x2={275} y2={400} color={C.purple} />
      <Arrow x1={510} y1={320} x2={405} y2={400} color={C.coral} />

      {/* Gut bacteria (central target) */}
      <Box x={200} y={394} w={280} h={56} fill={C.greenBg} stroke={C.green} rx={12} strokeWidth={1}>
        <Label x={340} y={414} text="腸内細菌叢" weight={500} fill={C.green} />
        <Label x={340} y={434} text="24時間周期の組成変動" size={11} fill={C.muted} />
      </Box>

      {/* SCFA */}
      <Box x={225} y={478} w={230} h={40} fill={C.greenBg} stroke={C.green}>
        <Label x={340} y={498} text="短鎖脂肪酸（SCFA）" weight={500} fill={C.green} size={13} />
      </Box>

      {/* Gut → SCFA */}
      <Arrow x1={310} y1={450} x2={310} y2={476} color={C.green} />

      {/* SCFA → Peripheral clock (feedback loop) */}
      <ArrowPath d="M225 498 L45 498 L45 320 L53 320" color={C.green} dashed />

      {/* Pathway 3 label */}
      <Label x={38} y={408} text="経路 ③" size={12} fill={C.green} anchor="end" />
      <Label x={38} y={424} text="双方向" size={11} fill={C.green} anchor="end" />

      {/* Night shift annotation */}
      <Box x={490} y={388} w={160} h={66} fill={C.redBg} stroke={C.red} rx={6}>
        <Label x={570} y={406} text="夜勤では3経路が" size={11} fill={C.red} />
        <Label x={570} y={422} text="同時に乱れる" size={11} fill={C.red} />
        <Label x={570} y={440} text="→ ディスバイオーシス" size={11} weight={500} fill={C.red} />
      </Box>
    </svg>
  )
}

// ─── Diagram: Dysbiosis cascade ───
function CascadeDiagram() {
  return (
    <svg
      width="100%" viewBox="0 0 680 490"
      role="img" aria-label="ディスバイオーシスから全身への影響カスケード"
      style={{ maxWidth: 680, margin: '0 auto', display: 'block' }}
    >
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refX={8} refY={5}
          markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
            strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* Title */}
      <Label x={340} y={28} text="ディスバイオーシス → 全身への影響カスケード" size={15} weight={500} />

      {/* Step 1 */}
      <Box x={180} y={48} w={320} h={44} fill={C.amberBg} stroke={C.amber}>
        <Label x={340} y={70} text="概日リズム破綻（夜勤・時差ボケ）" weight={500} fill={C.amber} />
      </Box>
      <Arrow x1={340} y1={92} x2={340} y2={118} />

      {/* Step 2 */}
      <Box x={150} y={120} w={380} h={56} fill={C.coralBg} stroke={C.coral}>
        <Label x={340} y={140} text="腸内細菌叢ディスバイオーシス" weight={500} fill={C.coral} />
        <Label x={340} y={160} text="α多様性↓　炎症促進菌↑　SCFA産生↓" size={11} fill={C.muted} />
      </Box>
      <Arrow x1={340} y1={176} x2={340} y2={202} />

      {/* Step 3 */}
      <Box x={150} y={204} w={380} h={56} fill={C.redBg} stroke={C.red}>
        <Label x={340} y={224} text="腸管バリア破綻（リーキーガット）" weight={500} fill={C.red} />
        <Label x={340} y={244} text="タイトジャンクション蛋白（ZO-1・Occludin）↓" size={11} fill={C.muted} />
      </Box>
      <Arrow x1={340} y1={260} x2={340} y2={286} />

      {/* Step 4 */}
      <Box x={180} y={288} w={320} h={56} fill={C.redBg} stroke={C.red}>
        <Label x={340} y={308} text="エンドトキセミア" weight={500} fill={C.red} />
        <Label x={340} y={328} text="LPS（細菌由来毒素）の血中流入" size={11} fill={C.muted} />
      </Box>
      <Arrow x1={340} y1={344} x2={340} y2={370} />

      {/* Step 5 */}
      <Box x={200} y={372} w={280} h={44} fill={C.pinkBg} stroke={C.pink}>
        <Label x={340} y={394} text="慢性低レベル炎症" weight={500} fill={C.pink} />
      </Box>

      {/* Branches to outcomes */}
      <Arrow x1={255} y1={416} x2={140} y2={444} color={C.pink} />
      <Arrow x1={340} y1={416} x2={340} y2={444} color={C.pink} />
      <Arrow x1={425} y1={416} x2={540} y2={444} color={C.pink} />

      {/* Outcomes */}
      <Box x={50} y={446} w={170} h={32} fill={C.grayBg} stroke={C.border}>
        <Label x={135} y={462} text="肥満・2型糖尿病" size={12} fill={C.gray} />
      </Box>
      <Box x={255} y={446} w={170} h={32} fill={C.grayBg} stroke={C.border}>
        <Label x={340} y={462} text="心血管疾患" size={12} fill={C.gray} />
      </Box>
      <Box x={460} y={446} w={170} h={32} fill={C.grayBg} stroke={C.border}>
        <Label x={545} y={462} text="メンタルヘルス" size={12} fill={C.gray} />
      </Box>

      {/* Gut-brain axis side branch */}
      <ArrowPath d="M530 232 L600 232 L600 362 L585 362" color={C.pink} dashed />
      <Label x={608} y={288} text="腸脳相関" size={11} fill={C.pink} anchor="start" />
      <Label x={608} y={304} text="（迷走神経）" size={11} fill={C.pink} anchor="start" />
    </svg>
  )
}

// ─── Main component ───
const VARIANTS: Record<string, () => React.ReactElement> = {
  'three-pathways': ThreePathwayDiagram,
  'cascade': CascadeDiagram,
}

export function ArticleDiagram({ variant, caption }: { variant: string; caption?: string }) {
  const Diagram = VARIANTS[variant]
  if (!Diagram) {
    return <div style={{ color: 'red', padding: '1rem' }}>Unknown diagram variant: {variant}</div>
  }

  return (
    <figure style={{ margin: '2rem 0' }}>
      <Diagram />
      {caption && (
        <figcaption style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: C.muted,
          marginTop: '0.5rem',
          fontFamily: "'Shippori Mincho B1', serif",
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
