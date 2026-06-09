import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ONCALL_JSON = join(ROOT, "data/health/oncall_data.json");
const GARMIN_CSV  = join(ROOT, "data/health/garmin_master.csv");
const OUT = join(ROOT, "data/oncall_public.json");

// 公開NG項目
const PRIVATE_KEYS = ["ambulance", "walkin", "total_cases", "memo"];

function readJson(filePath) {
  if (!existsSync(filePath)) return [];
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function readCsv(filePath) {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, "utf-8").trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const vals = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h.trim(), vals[i]?.trim() ?? ""]));
  });
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

const oncall = readJson(ONCALL_JSON);
const garmin = readCsv(GARMIN_CSV);

// Garminをdateでマップ化
const garminMap = {};
for (const row of garmin) {
  garminMap[row.date] = row;
}

// 夜勤ごとに公開データを生成
const entries = oncall.map(entry => {
  const date = entry.date;

  // 前日Garminデータ
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = prevDate.toISOString().split("T")[0];
  const prevGarmin = garminMap[prevDateStr] ?? {};

  // 翌日Garminデータ
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().split("T")[0];
  const nextGarmin = garminMap[nextDateStr] ?? {};

  // 翌日HRV変化率
  const prevHrv = num(prevGarmin.hrv_last_night);
  const nextHrv = num(nextGarmin.hrv_last_night);
  const hrvChangePct = (prevHrv && nextHrv)
    ? Math.round((nextHrv - prevHrv) / prevHrv * 1000) / 10
    : null;

  // Body Battery消耗量（夜勤当日）
  const bbMax = num(garminMap[date]?.body_battery_max);
  const bbMin = num(garminMap[date]?.body_battery_min);
  const bodyBatteryDrain = (bbMax !== null && bbMin !== null) ? bbMax - bbMin : null;

  // 公開OK項目のみ抽出
  const pub = {};
  for (const [k, v] of Object.entries(entry)) {
    if (!PRIVATE_KEYS.includes(k)) pub[k] = v;
  }

  // napMinutesをnap_hに変換
  pub.nap_h = entry.napMinutes != null ? Math.round(entry.napMinutes / 60 * 10) / 10 : null;
  delete pub.napMinutes;

  // preNapMinutesをpre_nap_hに変換
  if (entry.preNapMinutes != null) {
    pub.pre_nap_h = Math.round(entry.preNapMinutes / 60 * 10) / 10;
  }
  delete pub.preNapMinutes;

  // 派生KPI
  pub.delta_fatigue   = (entry.fatigueOut != null && entry.fatigueIn != null)
    ? entry.fatigueOut - entry.fatigueIn : null;
  pub.hrv_change_pct  = hrvChangePct;
  pub.body_battery_drain = bodyBatteryDrain;

  // 前日Garmin
  pub.prev_hrv        = prevHrv;
  pub.prev_sleep_h    = num(prevGarmin.sleep_duration_h);
  pub.prev_resting_hr = num(prevGarmin.resting_hr);

  return pub;
});

// サマリー統計
function avg(arr, key) {
  const vals = arr.map(r => r[key]).filter(v => v !== null && !isNaN(v));
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10;
}

const summary = {
  count:                  entries.length,
  avg_hrv_change_pct:     avg(entries, "hrv_change_pct"),
  avg_body_battery_drain: avg(entries, "body_battery_drain"),
  avg_nap_h:              avg(entries, "nap_h"),
  avg_delta_fatigue:      avg(entries, "delta_fatigue"),
  avg_sleepiness:         avg(entries, "sleepiness"),
  avg_fatigue_out:        avg(entries, "fatigueOut"),
};

const output = { summary, entries };
writeFileSync(OUT, JSON.stringify(output, null, 2));
console.log(`✅ oncall_public.json生成完了 (${entries.length}件)`);
console.log("   summary:", summary);
