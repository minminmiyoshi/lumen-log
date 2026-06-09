import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC  = join(ROOT, "data/public_data.json");
const HEALTH_OUT = join(ROOT, "data/health.json");
const NOW_OUT    = join(ROOT, "data/now.json");
const ONCALL_OUT = join(ROOT, "data/oncall_public.json");

if (!existsSync(SRC)) {
  console.error("❌ data/public_data.json が見つかりません");
  process.exit(1);
}

const pub = JSON.parse(readFileSync(SRC, "utf-8"));

// health.json
writeFileSync(HEALTH_OUT, JSON.stringify(pub.health, null, 2));
console.log(`✅ health.json生成完了 (garmin:${pub.health.garmin.length}件, scale:${pub.health.scale.length}件, workout:${pub.health.workout.length}件, 週次強度:${pub.health.weeklyIntensity.length}週)`);

// now.json
writeFileSync(NOW_OUT, JSON.stringify(pub.now, null, 2));
console.log(`✅ now.json生成完了`, pub.now);

// oncall_public.json
writeFileSync(ONCALL_OUT, JSON.stringify(pub.oncall, null, 2));
console.log(`✅ oncall_public.json生成完了 (${pub.oncall.entries.length}件)`);