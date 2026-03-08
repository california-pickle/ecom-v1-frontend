import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

// GET /api/products — proxies to backend storefront products (public, no auth needed)
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/products/storefront`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}
