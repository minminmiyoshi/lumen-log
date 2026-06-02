import { NextResponse } from "next/server";
import healthData from "@/data/health.json";

export async function GET() {
  const { garmin, scale, workout } = healthData as {
    garmin:  Record<string, string>[];
    scale:   Record<string, string>[];
    workout: Record<string, string>[];
  };

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
