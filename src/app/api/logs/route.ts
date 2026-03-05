import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/logs
export async function GET() {
  return NextResponse.json(db.logs.slice(0, 100)); // latest 100
}
