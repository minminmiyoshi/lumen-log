"use client";

import { useState } from "react";

/**
 * NOCT（夜勤×健康ダッシュボード）の実画面を忠実に再現した体験デモ。
 * 実ソース（health-dashboard-cloud）の配色・タブ・パネル構成・AI解析レポートの節構造に準拠。
 * ★データはすべてデモ用の合成サンプル（実際の健康データは載せない＝プライバシー方針）。
 */

const KPIS = [
  { label: "VO2max", val: "45.8", delta: "+0.4", tone: "good" },
  { label: "安静時心拍", val: "58", unit: "bpm", delta: "−1", tone: "good" },
  { label: "HRV（前夜）", val: "42", unit: "ms", delta: "+2", tone: "good" },
  { label: "体重", val: "68.0", unit: "kg", delta: "−0.3", tone: "flat" },
  { label: "体脂肪率", val: "17.9", unit: "%", delta: "−0.6", tone: "good" },
  { label: "骨格筋量", val: "51.2", unit: "kg", delta: "+0.2", tone: "good" },
];

const CHECKS = [
  { label: "RHR週次トレンド", thr: "+3bpm/2w 以上", val: "+1 bpm/2w", hit: false },
  { label: "HRVベースライン低下", thr: "−20% 以下", val: "+2%", hit: false },
  { label: "夜間HR non-dipping", thr: "連続3日", val: "0日", hit: false },
  { label: "明けの睡眠", thr: "4時間未満", val: "4.2h", hit: false },
];

const CORE = [
  { label: "夜間HR dip率", val: "14%", note: "十分に低下", tone: "good" },
  { label: "RHR週次トレンド", val: "+1 bpm", note: "2週 +1 bpm", tone: "flat" },
  { label: "HRVベースライン乖離", val: "+2%", note: "基準を上回る", tone: "good" },
];

// 夜勤ごとの回復スコア（合成）
const RECOVERY = [0, 55, 62, 71, 48, 68, 74, 58];
const recTone = (v: number) => (v >= 70 ? "#4fd1a5" : v >= 45 ? "#ffce6b" : "#ff7a7a");

const TABS = ["総評", "自律神経", "概日リズム", "夜勤回復", "健康寿命", "体組成", "その他"];

export default function NoctDemo() {
  const [tab, setTab] = useState("総評");
  const [openReport, setOpenReport] = useState(true);

  return (
    <div className="nx-outer">
      <style>{CSS}</style>

      <div className="nx-intro">
        <div className="nx-intro-tag">demo — sample data</div>
        <h1>NOCT を触ってみる</h1>
        <p>
          本物の <b>noct.lumen-log.com</b> と同じ見た目です。夜勤サイクルに睡眠・自律神経・回復を重ねて可視化し、
          <b>AI解析レポート</b>（判定はエンジンが機械確定、本文はその解説）まで出します。
          ※表示の数値はすべて<b>デモ用の合成サンプル</b>で、実際の健康データではありません。
        </p>
      </div>

      <div className="nx-app">
        {/* top nav */}
        <div className="nx-nav">
          <div className="nx-navgroup">
            <span className="nx-navlink on">Dashboard</span>
            <span className="nx-navlink">Log</span>
            <span className="nx-navlink">Import</span>
          </div>
        </div>

        {/* tab bar */}
        <div className="nx-tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="nx-wrap">
          {tab !== "総評" ? (
            <div className="nx-panel nx-otab">このタブは本物の NOCT で見られます（デモは「総評」のみ）。</div>
          ) : (
            <>
              {/* KPI grid */}
              <div className="nx-kpis">
                {KPIS.map((k) => (
                  <div className="nx-kpi" key={k.label}>
                    <div className="nx-kpi-l">{k.label}</div>
                    <div className={`nx-kpi-v ${k.tone}`}>
                      {k.val}
                      {k.unit && <span className="nx-kpi-u"> {k.unit}</span>}
                    </div>
                    <div className={`nx-kpi-d ${k.tone}`}>{k.delta}</div>
                  </div>
                ))}
              </div>

              {/* alert */}
              <div className="nx-panel">
                <div className="nx-ph">🚨 離職予防アラート <span className="nx-tag">複合指標</span></div>
                <div className="nx-alert good">
                  <div className="nx-alert-lv">良好</div>
                  <div className="nx-alert-msg">
                    該当 <b>0 / 4</b> 指標 — 交感神経優位の進行・睡眠負債の兆候なし。前兆フラグは立っていません。
                  </div>
                </div>
                <div className="nx-checks">
                  {CHECKS.map((c) => (
                    <div className={`nx-check ${c.hit ? "hit" : ""}`} key={c.label}>
                      <span className="nx-check-mk">{c.hit ? "●" : "○"}</span>
                      <span className="nx-check-l">{c.label}</span>
                      <span className="nx-check-thr">{c.thr}</span>
                      <span className="nx-check-v">{c.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* core 3 */}
              <div className="nx-core">
                {CORE.map((c) => (
                  <div className="nx-panel nx-core-c" key={c.label}>
                    <div className="nx-core-l">{c.label}</div>
                    <div className={`nx-core-v ${c.tone}`}>{c.val}</div>
                    <div className="nx-core-n">{c.note}</div>
                  </div>
                ))}
              </div>

              {/* recovery mini chart */}
              <div className="nx-panel">
                <div className="nx-ph">🌙 夜勤ごとの回復スコア <span className="nx-tag">平均 62</span></div>
                <div className="nx-bars">
                  {RECOVERY.map((v, i) => (
                    <div className="nx-barcol" key={i}>
                      <div className="nx-bar" style={{ height: `${Math.max(4, v)}%`, background: recTone(v) }} />
                      <div className="nx-barv">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="nx-legend">
                  <span><i style={{ background: "#4fd1a5" }} />70+ 良好</span>
                  <span><i style={{ background: "#ffce6b" }} />45–70 境界</span>
                  <span><i style={{ background: "#ff7a7a" }} />&lt;45 要注意</span>
                </div>
              </div>

              {/* AI report */}
              <div className="nx-panel">
                <div className="nx-ph">📋 AI解析レポート <span className="nx-tag">2026-07-15</span></div>
                <div className="nx-desc">骨子に沿って生成された最新レポート。判定はエンジンが機械確定、本文はその解説。</div>
                <button className="nx-toggle" onClick={() => setOpenReport((v) => !v)}>
                  レポートを{openReport ? "閉じる ▴" : "開く ▾"}
                </button>
                {openReport && <div className="nx-report">{REPORT}</div>}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="nx-cta">
        <a href="https://noct.lumen-log.com">本物の NOCT を開く →</a>
        <span>実データは Garmin / Apple Health / 手入力から取り込み。相関エクスプローラ・日内変動・夜勤カレンダーは本体で。</span>
      </div>
      <div className="nx-foot">
        <a href="/tools">← 道具の一覧へ</a>
        <span>Lumen-log ©</span>
      </div>
    </div>
  );
}

// AI解析レポート（合成サンプル・実データではない）を実フォーマットで描画
const REPORT = (
  <>
    <h2>健康AI解析レポート（2026-07-15）</h2>
    <p className="nx-r-sub">
      対象期間: 2026-06-01〜2026-07-14（44日 / 夜勤12回）<br />
      ※評価グレード・リスクフラグは解析エンジンが機械確定した値。本レポートはそれを根拠に助言へ翻訳したもの。
    </p>
    <hr />
    <h3>1. 総合評価 — <b>グレード B</b></h3>
    <p>
      自律神経が安定し（ANSスコア 76.4・Grade A）、VO2max も 45.8 で良好域。夜勤回復は平均 62（Bゾーン）と改善傾向。
      明けの睡眠が 4.2h に伸び、前回の懸念が解消されつつある。引き続き夜勤中の仮眠確保を維持したい。
    </p>
    <hr />
    <h3>2. 自律神経（ANS） — <b>グレード A・安定（trajectory: 安定）</b> ★離職予防の中核</h3>
    <ul>
      <li><b>評価</b>: ANSスコア <b>76.4</b>、悪化シグナル <b>0個</b> → 交感神経優位の進行なし。</li>
      <li><b>根拠（数値）</b>: 個人比HRV BALANCED率 <b>97%</b>（UNBALANCED 1日のみ）。HRVトレンド +0.5ms／RHRトレンド +0.8bpm で横ばい。夜勤間の戻り D+1 −2.1 → D+2 +1.2 → D+3 +2.4。</li>
      <li><b>助言</b>: グレードA維持フェーズ。BALANCED率の低下が始まったら最優先で介入。</li>
    </ul>
    <hr />
    <h3>3. 夜勤回復 — <b>グレード B・おおむね良好</b></h3>
    <ul>
      <li><b>評価</b>: 回復スコア平均 <b>62.3</b>、直近4回 <b>71.5</b>、回復日数中央値 <b>1.5日</b>。</li>
      <li><b>効くレバー（本人データの相関）</b>: 夜勤中(1–6時)の仮眠↑ → 明けRHR改善（r=−0.40）＝回復の最大レバー。明け午後の仮眠↑ → 明けHRV改善（r=+0.42）。</li>
      <li><b>助言</b>: 忙しさは選べないが仮眠は設計できる。深夜帯にまとまった仮眠（90–120分、無理なら20–30分×複数）を意図的に確保。</li>
    </ul>
    <hr />
    <h3>4. 健康寿命 — VO2max <b>良好・上昇</b> / 安静時心拍 <b>良好・横ばい</b></h3>
    <ul>
      <li><b>VO2max</b>: 現在 <b>45.8</b>、期間内 −0.3（良好域維持）。</li>
      <li><b>安静時心拍</b>: <b>58 bpm</b>、トレンド +0.8bpm（正常範囲）。</li>
    </ul>
    <hr />
    <h3>5. 体組成 — <b>健康域</b></h3>
    <ul>
      <li><b>評価</b>: 体脂肪率 <b>17.9%</b>、腕左右差 −3.2%（均等）。筋量を維持しつつ脂肪 −1.0pt。</li>
    </ul>
    <hr />
    <h3>6. リスク／注意フラグ</h3>
    <ul>
      <li>夜勤回復のやや遅さ ← <b>前回懸念、改善確認</b>（平均 45.8 → 62.3）。</li>
      <li>明けの睡眠短縮 ← <b>改善中</b>（3.5h → 4.2h、目標 4.5h）。</li>
    </ul>
    <p>※離職リスク前兆フラグは <b>立っていません</b>。</p>
    <hr />
    <h3>7. 優先アクション（今週の3手）</h3>
    <ol>
      <li><b>夜勤中の仮眠継続（1–6時に90–120分）</b> → 回復スコア上昇が実証済み（r=−0.40）。</li>
      <li><b>明け午後13–16時の仮眠を60–90分で守る</b> → HRV改善（r=+0.42）、当日は高強度運動を避ける。</li>
      <li><b>VO2max維持：Zone2×2/週＋HIIT 4×4分×1/週</b> → 現在 45.8 の好調を継続。</li>
    </ol>
    <hr />
    <h3>8. 次回チェック指標</h3>
    <ul>
      <li>明け睡眠が 4.5h へ伸びるか（現在 4.2h）</li>
      <li>回復スコア直近4が 71.5 を維持できるか</li>
      <li>HRV BALANCED率が 97% を下回らないか</li>
    </ul>
    <p className="nx-r-note">
      *本レポートは生活・トレーニング・仮眠の最適化を目的とし、医療診断・治療指示ではありません。気になる兆候があれば受診の検討を。
    </p>
  </>
);

const CSS = `
.nx-outer{max-width:1060px;margin:0 auto;padding:40px 20px 64px;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Segoe UI",sans-serif;}
.nx-intro{max-width:640px;}
.nx-intro-tag{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.05em;color:#8B3A2C;margin-bottom:10px;}
.nx-intro h1{font-family:'Shippori Mincho B1',serif;font-weight:400;font-size:30px;margin:0 0 10px;color:#1a1a1a;}
.nx-intro p{font-size:14px;line-height:1.9;color:#57534e;margin:0;}
.nx-intro p b{color:#3b5bdb;}

.nx-app{margin-top:22px;background:#0f1420;border:1px solid #2c3650;border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.35);overflow:hidden;color:#e8edf7;color-scheme:dark;}
.nx-nav{display:flex;justify-content:center;padding:12px 16px;background:rgba(15,20,32,.82);border-bottom:1px solid #2c3650;}
.nx-navgroup{display:flex;gap:6px;}
.nx-navlink{font-size:13px;font-weight:600;color:#93a0bd;padding:9px 14px;border-radius:11px;}
.nx-navlink.on{color:#0f1420;background:linear-gradient(135deg,#7c9cff,#9f8bff);box-shadow:0 2px 12px rgba(124,156,255,.35);}
.nx-tabs{display:flex;gap:8px;overflow-x:auto;padding:12px 16px;background:#0f1420;}
.nx-tabs button{flex:none;padding:8px 14px;font-size:13px;font-weight:700;border-radius:999px;background:#1a2132;color:#93a0bd;border:1px solid #2c3650;cursor:pointer;font-family:inherit;}
.nx-tabs button.on{background:#7c9cff;color:#0f1420;border-color:#7c9cff;}
.nx-wrap{padding:16px;}

.nx-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px;}
.nx-kpi{background:#1a2132;border:1px solid #2c3650;border-radius:12px;padding:12px 14px;}
.nx-kpi-l{font-size:11px;letter-spacing:.03em;color:#93a0bd;text-transform:uppercase;}
.nx-kpi-v{font-size:26px;font-weight:700;margin-top:2px;color:#e8edf7;}
.nx-kpi-v.good{color:#4fd1a5;}
.nx-kpi-u{font-size:12px;color:#93a0bd;font-weight:600;}
.nx-kpi-d{font-size:12px;font-weight:600;color:#93a0bd;margin-top:2px;}
.nx-kpi-d.good{color:#4fd1a5;}

.nx-panel{background:#1a2132;border:1px solid #2c3650;border-radius:14px;padding:16px;margin-bottom:14px;}
.nx-ph{font-size:14px;font-weight:700;color:#e8edf7;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.nx-tag{font-size:10.5px;font-weight:700;color:#0f1420;background:#7c9cff;border-radius:6px;padding:2px 7px;}
.nx-desc{font-size:12px;color:#93a0bd;line-height:1.6;margin-bottom:10px;}

.nx-alert{border-radius:10px;padding:14px 16px;background:rgba(79,209,165,.12);border:1px solid rgba(79,209,165,.4);}
.nx-alert-lv{font-size:22px;font-weight:700;color:#4fd1a5;}
.nx-alert-msg{font-size:12.5px;color:#93a0bd;line-height:1.6;margin-top:4px;}
.nx-alert-msg b{color:#e8edf7;}
.nx-checks{display:grid;gap:6px;margin-top:12px;}
.nx-check{display:flex;align-items:center;gap:10px;font-size:12px;color:#93a0bd;padding:6px 4px;}
.nx-check-mk{color:#4fd1a5;}
.nx-check.hit .nx-check-mk{color:#ff7a7a;}
.nx-check-l{flex:1;color:#e8edf7;font-weight:600;}
.nx-check-thr{color:#6b7690;font-size:11px;}
.nx-check-v{font-family:ui-monospace,monospace;color:#e8edf7;min-width:70px;text-align:right;}

.nx-core{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:14px;}
.nx-core-c{margin-bottom:0;}
.nx-core-l{font-size:12px;color:#93a0bd;}
.nx-core-v{font-size:24px;font-weight:700;margin:4px 0;color:#e8edf7;}
.nx-core-v.good{color:#4fd1a5;}
.nx-core-n{font-size:11.5px;color:#93a0bd;}

.nx-bars{display:flex;align-items:flex-end;gap:8px;height:120px;padding:8px 4px 0;}
.nx-barcol{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px;}
.nx-bar{width:100%;max-width:34px;border-radius:5px 5px 0 0;min-height:4px;}
.nx-barv{font-size:10px;color:#93a0bd;font-family:ui-monospace,monospace;}
.nx-legend{display:flex;gap:16px;margin-top:12px;font-size:11px;color:#93a0bd;}
.nx-legend span{display:flex;align-items:center;gap:5px;}
.nx-legend i{width:10px;height:10px;border-radius:3px;display:inline-block;}

.nx-toggle{font-size:12.5px;font-weight:700;color:#7c9cff;background:transparent;border:1px solid #2c3650;border-radius:9px;padding:8px 14px;cursor:pointer;font-family:inherit;}
.nx-report{margin-top:12px;background:#212a40;border:1px solid #2c3650;border-radius:10px;padding:16px 18px;font-size:13px;line-height:1.7;max-height:60vh;overflow-y:auto;color:#e8edf7;}
.nx-report h2{font-size:19px;font-weight:700;margin:0 0 6px;}
.nx-report h3{font-size:15px;font-weight:700;margin:14px 0 6px;}
.nx-report p{margin:6px 0;}
.nx-report .nx-r-sub{font-size:11.5px;color:#93a0bd;}
.nx-report .nx-r-note{font-size:11px;color:#93a0bd;font-style:italic;}
.nx-report ul,.nx-report ol{margin:6px 0;padding-left:20px;}
.nx-report li{margin:5px 0;}
.nx-report b{color:#ffce6b;}
.nx-report hr{border:none;border-top:1px solid #2c3650;margin:14px 0;}

.nx-otab{color:#93a0bd;font-size:13px;text-align:center;padding:40px 16px;}

.nx-cta{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:26px;}
.nx-cta a{display:inline-flex;padding:12px 22px;border-radius:999px;background:#2b2842;color:#fff;font-family:ui-monospace,monospace;font-size:12px;text-decoration:none;}
.nx-cta a:hover{background:#8B3A2C;}
.nx-cta span{font-size:12px;color:#6E665B;max-width:440px;line-height:1.7;}
.nx-foot{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:20px;border-top:1px solid #D8D2C5;}
.nx-foot a{font-family:ui-monospace,monospace;font-size:11px;color:#2b2842;text-decoration:none;}
.nx-foot a:hover{color:#8B3A2C;}
.nx-foot span{font-family:ui-monospace,monospace;font-size:11px;color:#6E665B;}
`;
