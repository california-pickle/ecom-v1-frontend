import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/customers — return all customers sorted by joinDate desc
export async function GET() {
  const sorted = [...db.customers].sort((a, b) =>
    b.joinDate.localeCompare(a.joinDate)
  );
  return NextResponse.json(sorted);
}
