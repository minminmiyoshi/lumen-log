import { NextResponse } from "next/server";
import oncallPublic from "@/data/oncall_public.json";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(oncallPublic ?? { summary: { count: 0 }, entries: [] });
}
