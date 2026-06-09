import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-static";

export function GET() {
  const filePath = join(process.cwd(), "data/oncall_public.json");
  if (!existsSync(filePath)) {
    return NextResponse.json({ summary: { count: 0 }, entries: [] });
  }
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  return NextResponse.json(data);
}
