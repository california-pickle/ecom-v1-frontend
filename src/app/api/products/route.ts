import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products
export async function GET() {
  return NextResponse.json(db.products);
}
