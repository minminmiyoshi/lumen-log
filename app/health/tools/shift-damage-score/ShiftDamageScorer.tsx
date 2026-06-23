"use client";

import { useState, useEffect, useCallback } from "react";

/* ──────────────── Data ──────────────── */

interface Option {
  text: string;
  score: number;
  weight: number;
}

interface Question {
  id: string;
  label: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "frequency",
    label: "月あたりの夜勤回数は？",
    options: [
      { text: "1〜3回", score: 0, weight: 1.3 },
      { text: "4〜6回", score: 1, weight: 1.3 },
      { text: "7〜9回", score: 2, weight: 1.3 },
      { text: "10回以上", score: 3, weight: 1.3 },
    ],
  },
  {
    id: "consecutive",
    label: "休みを挟まずに連続する夜勤は最大何回？",
    options: [
      { text: "1回のみ（入り明け→休み）", score: 0, weight: 1.2 },
      { text: "2連続（入り明け入り明け）", score: 1, weight: 1.2 },
      { text: "3連続以上", score: 3, weight: 1.2 },
    ],
  },
  {
    id: "nap",
    label: "夜勤中に仮眠は取れる？",
    options: [
      { text: "だいたい取れる", score: 0, weight: 1.0 },
      { text: "取れたり取れなかったり", score: 1, weight: 1.0 },
      { text: "ほぼ取れない", score: 3, weight: 1.0 },
    ],
  },
  {
    id: "sleepAfter",
    label: "夜勤明けの睡眠時間は？",
    options: [
      { text: "6時間以上", score: 0, weight: 1.1 },
      { text: "4〜6時間", score: 1, weight: 1.1 },
      { text: "4時間未満", score: 3, weight: 1.1 },
    ],
  },
  {
    id: "age",
    label: "年齢は？",
    options: [
      { text: "20代", score: 0, weight: 0.7 },
      { text: "30代", score: 1, weight: 0.7 },
      { text: "40代", score: 2, weight: 0.7 },
      { text: "50代以上", score: 3, weight: 0.7 },
    ],
  },
  {
    id: "years",
    label: "夜勤歴はどのくらい？",
    options: [
      { text: "1年未満", score: 0, weight: 0.8 },
      { text: "1〜5年", score: 1, weight: 0.8 },
      { text: "5〜10年", score: 2, weight: 0.8 },
      { text: "10年以上", score: 3, weight: 0.8 },
    ],
  },
];

const MAX_RAW = QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.score)) * q.options[0].weight,
  0
);

const SITE_URL = "https://lumen-log.com/health/tools/shift-damage-score";

/* ──────────────── Scoring ──────────────── */

type Answers = Record<string, number>;

function calcScore(answers: Answers): number {
  let raw = 0;
  QUESTIONS.forEach((q) => {
    const idx = answers[q.id];
    if (idx !== undefined) {
      raw += q.options[idx].score * q.options[idx].weight;
    }
  });
  return Math.round((raw / MAX_RAW) * 100);
}

interface Level {
  label: string;
  color: string;
  bgColor: string;
  message: string;
}

function getLevel(score: number): Level {
  if (score <= 30)
    return { label: "Low", color: "#16a34a", bgColor: "#dcfce7", message: "夜勤負荷は比較的軽め" };
  if (score <= 55)
    return { label: "Moderate", color: "#ca8a04", bgColor: "#fef9c3", message: "蓄積リスクあり — 対策を意識しよう" };
  if (score <= 75)
    return { label: "High", color: "#ea580c", bgColor: "#ffedd5", message: "明確な健康リスク域" };
  return { label: "Critical", color: "#dc2626", bgColor: "#fee2e2", message: "勤務パターンの見直しを強く推奨" };
}

function getTips(answers: Answers): string[] {
  const tips: string[] = [];
  if (answers.nap === 2)
    tips.push(
      "夜勤中の20分仮眠でパフォーマンス低下を最大50%軽減できるというデータがあります。職場環境の改善を検討してみてください。"
    );
  if (answers.sleepAfter >= 1)
    tips.push(
      "夜勤明けの帰宅時にサングラスで光を遮ると、メラトニン分泌が維持されて入眠しやすくなります。"
    );
  if (answers.consecutive === 2)
    tips.push(
      "3連続以上の夜勤は概日リズムの回復に72時間以上かかります。可能なら2連続以下に抑えることを推奨します。"
    );
  if (answers.frequency >= 2)
    tips.push(
      "月7回以上の夜勤は心血管リスクが有意に上昇するという疫学データがあります。定期的な健康診断を。"
    );
  if (answers.age >= 2)
    tips.push(
      "40代以降は概日リズムの回復力が低下します。光曝露のタイミング管理がより重要になります。"
    );
  if (tips.length === 0)
    tips.push(
      "現在の夜勤パターンは比較的良好です。この水準を維持しつつ、睡眠の質にも目を向けてみてください。"
    );
  return tips.slice(0, 3);
}

/* ──────────────── Gauge SVG ──────────────── */

function GaugeSVG({ score, level }: { score: number; level: Level }) {
  const r = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (totalAngle * score) / 100;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const bgStart = polarToCartesian(startAngle);
  const bgEnd = polarToCartesian(endAngle);
  const scoreEnd = polarToCartesian(scoreAngle);
  const largeArcBg = totalAngle > 180 ? 1 : 0;
  const largeArcScore = scoreAngle - startAngle > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 180 140" style={{ width: "100%", maxWidth: 220 }}>
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {score > 0 && (
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcScore} 1 ${scoreEnd.x} ${scoreEnd.y}`}
          fill="none"
          stroke={level.color}
          strokeWidth="12"
          strokeLinecap="round"
        />
      )}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="currentColor"
        fontSize="32"
        fontWeight="600"
      >
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#9ca3af" fontSize="11">
        / 100
      </text>
    </svg>
  );
}

/* ──────────────── Component ──────────────── */

export default function ShiftDamageScorer() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;
  const finalScore = calcScore(answers);
  const level = getLevel(finalScore);
  const tips = getTips(answers);

  function selectOption(idx: number) {
    setAnswers((prev) => ({ ...prev, [current.id]: idx }));
  }

  function next() {
    if (answers[current.id] === undefined) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function retry() {
    setStep(0);
    setAnswers({});
    setShowResult(false);
    setAnimatedScore(0);
    setCopied(false);
  }

  const shareToX = useCallback(() => {
    const text = `夜勤ダメージスコア: ${finalScore}/100\n${level.message}\n\nあなたの夜勤負荷はどのくらい？`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE_URL)}`,
      "_blank"
    );
  }, [finalScore, level.message]);

  const copyResult = useCallback(async () => {
    const text = `夜勤ダメージスコア: ${finalScore}/100\n${level.message}\n${SITE_URL}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [finalScore, level.message]);

  const generateImage = useCallback(() => {
    const tipsForImage = getTips(answers);
    const tipCount = tipsForImage.length;
    const W = 600, H = 360 + tipCount * 50;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f0f23";
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 16);
    ctx.fill();

    // Title
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("夜勤ダメージスコアラー", W / 2, 32);

    // Gauge
    const cx = W / 2, cy = 120, r = 60;
    const startA = (135 - 90) * Math.PI / 180;
    const endA = (405 - 90) * Math.PI / 180;
    const scoreA = startA + (endA - startA) * finalScore / 100;

    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = "#2a2a3e";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    if (finalScore > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, startA, scoreA);
      ctx.strokeStyle = level.color;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Score
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(String(finalScore), cx, cy + 10);

    ctx.fillStyle = "#6b7280";
    ctx.font = "12px sans-serif";
    ctx.fillText("/ 100", cx, cy + 26);

    // Level + message (below gauge arc)
    ctx.fillStyle = level.color;
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(level.label, cx, cy + 90);

    ctx.fillStyle = "#d1d5db";
    ctx.font = "14px sans-serif";
    ctx.fillText(level.message, cx, cy + 112);

    // Divider
    const divY = cy + 132;
    ctx.strokeStyle = "#1e1e36";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, divY);
    ctx.lineTo(W - 40, divY);
    ctx.stroke();

    // Tips
    ctx.textAlign = "left";
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6366f1";
    ctx.fillText("Advice", 40, divY + 22);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px sans-serif";
    const maxTipW = W - 80;
    let tipY = divY + 44;
    tipsForImage.forEach((tip) => {
      const words = tip.split("");
      let line = "";
      const lines: string[] = [];
      for (const ch of words) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxTipW) {
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      lines.forEach((l) => {
        ctx.fillText(l, 48, tipY);
        tipY += 18;
      });
      tipY += 8;
    });

    // Site URL
    ctx.textAlign = "center";
    ctx.fillStyle = "#4b5563";
    ctx.font = "11px sans-serif";
    ctx.fillText("lumen-log.com", W / 2, H - 16);

    const link = document.createElement("a");
    link.download = "shift-damage-score.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [finalScore, level, answers]);

  // Score animation
  useEffect(() => {
    if (!showResult) return;
    let frame: number;
    let start: number | null = null;
    const duration = 1200;

    function animate(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * finalScore));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [showResult, finalScore]);

  /* ──── Result Screen ──── */
  if (showResult) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <h2 style={s.title}>診断結果</h2>
        </div>

        <div style={s.resultArea}>
          <GaugeSVG score={animatedScore} level={level} />
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                ...s.badge,
                background: level.bgColor,
                color: level.color,
              }}
            >
              {level.label}
            </span>
          </div>
          <p style={s.levelMsg}>{level.message}</p>
        </div>

        <div style={s.tipsBlock}>
          <h3 style={s.tipsTitle}>あなたへのアドバイス</h3>
          {tips.map((tip, i) => (
            <div key={i} style={s.tipCard}>
              {tip}
            </div>
          ))}
        </div>

        <div style={s.shareRow}>
          <button style={s.shareBtn} onClick={shareToX}>
            Xでシェア
          </button>
          <button style={s.shareBtn} onClick={generateImage}>
            画像を保存
          </button>
          <button style={s.shareBtn} onClick={copyResult}>
            {copied ? "コピーしました！" : "結果をコピー"}
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <button style={s.retryBtn} onClick={retry}>
            もう一度やる
          </button>
        </div>

        <footer style={s.footer}>
          <p style={s.footerText}>
            本スコアは交代勤務に関する疫学研究をもとに独自に設計したものです。
            <br />
            医学的診断ではありません。気になる症状がある場合は医療機関を受診してください。
          </p>
        </footer>
      </div>
    );
  }

  /* ──── Question Screen ──── */
  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>夜勤ダメージスコアラー</h2>
        <p style={s.subtitle}>6つの質問であなたの夜勤負荷を可視化</p>
      </div>

      {/* Progress bar */}
      <div style={s.progress}>
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background:
                i < step ? "#6366f1" : i === step ? "#a5b4fc" : "#e5e7eb",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div style={s.questionLabel}>
        <span style={{ color: "#6366f1", marginRight: 8, fontSize: 14 }}>
          Q{step + 1}
        </span>
        {current.label}
      </div>

      {/* Options */}
      {current.options.map((opt, idx) => {
        const selected = answers[current.id] === idx;
        return (
          <button
            key={idx}
            onClick={() => selectOption(idx)}
            style={{
              ...s.optionBtn,
              borderColor: selected ? "#6366f1" : "#e5e7eb",
              background: selected ? "#eef2ff" : "#fff",
              color: selected ? "#4338ca" : "#374151",
              fontWeight: selected ? 600 : 400,
            }}
          >
            {opt.text}
          </button>
        );
      })}

      {/* Navigation */}
      <div style={s.navRow}>
        {step > 0 ? (
          <button style={s.backBtn} onClick={back}>
            ← 戻る
          </button>
        ) : (
          <div />
        )}
        <button
          style={{
            ...s.nextBtn,
            opacity: answers[current.id] === undefined ? 0.3 : 1,
            cursor:
              answers[current.id] === undefined ? "default" : "pointer",
          }}
          onClick={next}
          disabled={answers[current.id] === undefined}
        >
          {step === totalSteps - 1 ? "結果を見る" : "次へ →"}
        </button>
      </div>

      <footer style={s.footer}>
        <p style={s.footerText}>
          交代勤務に関する疫学データに基づくスコアリング
          <br />© lumen-log.com
        </p>
      </footer>
    </div>
  );
}

/* ──────────────── Styles ──────────────── */

const s: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },
  progress: {
    display: "flex",
    gap: 4,
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 17,
    fontWeight: 600,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  optionBtn: {
    display: "block",
    width: "100%",
    padding: "13px 16px",
    marginBottom: 8,
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 15,
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backBtn: {
    padding: "10px 18px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "transparent",
    color: "#6b7280",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  nextBtn: {
    padding: "10px 24px",
    border: "none",
    borderRadius: 8,
    background: "#6366f1",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.2s",
  },
  resultArea: {
    textAlign: "center" as const,
    padding: "1rem 0",
  },
  badge: {
    display: "inline-block",
    padding: "4px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  levelMsg: {
    fontSize: 15,
    color: "#6b7280",
    margin: "8px 0 24px",
  },
  tipsBlock: {
    textAlign: "left" as const,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#6366f1",
    marginBottom: 12,
    letterSpacing: "0.02em",
  },
  tipCard: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.7,
    padding: "12px 14px",
    background: "#f9fafb",
    borderRadius: 8,
    marginBottom: 6,
    borderLeft: "3px solid #e5e7eb",
  },
  shareRow: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap" as const,
    marginBottom: 12,
  },
  shareBtn: {
    padding: "10px 18px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  retryBtn: {
    padding: "10px 22px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "transparent",
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: 36,
    paddingTop: 20,
    borderTop: "1px solid #f3f4f6",
  },
  footerText: {
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 1.6,
    margin: 0,
  },
};
