import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data/health");
const OUT = join(ROOT, "data/health.json");
const NOW_OUT = join(ROOT, "data/now.json");

function readCsv(filePath) {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, "utf-8");
  const result = Papa.parse(content, { header: true, skipEmptyLines: true });
  return result.data;
}

const garmin  = readCsv(join(DATA_DIR, "garmin_master.csv"));
const scale   = readCsv(join(DATA_DIR, "scale_master.csv"));
const workout = readCsv(join(DATA_DIR, "workout_master.csv"));

writeFileSync(OUT, JSON.stringify({ garmin, scale, workout }, null, 2));
console.log(`✅ health.json生成完了 (garmin:${garmin.length}件, scale:${scale.length}件, workout:${workout.length}件)`);

// ── now.json生成 ──────────────────────────────────────────────────
// 直近7日の平均を計算するヘルパー
function recentAvg(rows, key, days = 7) {
  const vals = rows.slice(-days)
    .map(r => parseFloat(r[key]))
    .filter(v => !isNaN(v));
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function latestVal(rows, key) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = parseFloat(rows[i][key]);
    if (!isNaN(v)) return v;
  }
  return null;
}

// 安静時心拍：最新値 + 直近7日平均との差
const hrNow  = latestVal(garmin, "resting_hr");
const hrAvg  = recentAvg(garmin, "resting_hr", 7);
const hrDelta = (hrNow !== null && hrAvg !== null)
  ? Math.round((hrNow - hrAvg) * 10) / 10
  : null;

// 睡眠時間：最新値 + 直近7日平均との差
const sleepNow  = latestVal(garmin, "sleep_duration_h");
const sleepAvg  = recentAvg(garmin, "sleep_duration_h", 7);
const sleepDelta = (sleepNow !== null && sleepAvg !== null)
  ? Math.round((sleepNow - sleepAvg) * 10) / 10
  : null;

// 体重：最新値 + 一個前との差
const scaleRows = scale.filter(r => parseFloat(r["weight_kg"]));
const weightNow  = scaleRows.length > 0 ? parseFloat(scaleRows[scaleRows.length - 1]["weight_kg"]) : null;
const weightPrev = scaleRows.length > 1 ? parseFloat(scaleRows[scaleRows.length - 2]["weight_kg"]) : null;
const weightDelta = (weightNow !== null && weightPrev !== null)
  ? Math.round((weightNow - weightPrev) * 10) / 10
  : null;

// 最終更新日
const lastDate = garmin.length > 0 ? garmin[garmin.length - 1]["date"] : null;

const now = {
  updatedAt: lastDate,
  restingHr: {
    value: hrNow !== null ? Math.round(hrNow) : null,
    delta: hrDelta,
  },
  sleep: {
    value: sleepNow !== null ? Math.round(sleepNow * 10) / 10 : null,
    delta: sleepDelta,
  },
  weight: {
    value: weightNow,
    delta: weightDelta,
  },
};

writeFileSync(NOW_OUT, JSON.stringify(now, null, 2));
console.log(`✅ now.json生成完了`, now);
