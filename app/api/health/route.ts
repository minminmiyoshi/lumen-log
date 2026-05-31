import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

const GARMIN_CSV = path.join(process.env.HOME || "", "garmin_sync/output/garmin_master.csv");
const SCALE_CSV  = path.join(process.env.HOME || "", "garmin_sync/output/scale_master.csv");
const WORKOUT_CSV = path.join(process.env.HOME || "", "garmin_sync/output/workout_master.csv");

function readCsv(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const result = Papa.parse(content, { header: true, skipEmptyLines: true });
    return result.data as Record<string, string>[];
  } catch {
    return [];
  }
}

export async function GET() {
  const garmin  = readCsv(GARMIN_CSV);
  const scale   = readCsv(SCALE_CSV);
  const workout = readCsv(WORKOUT_CSV);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const filterRecent = (rows: Record<string, string>[]) =>
    rows
      .filter((r) => r.date && new Date(r.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    garmin:  filterRecent(garmin),
    scale:   filterRecent(scale),
    workout: filterRecent(workout),
  });
}