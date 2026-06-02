import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data/health");
const OUT = join(ROOT, "data/health.json");

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
