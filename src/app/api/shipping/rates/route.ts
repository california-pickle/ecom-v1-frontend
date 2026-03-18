import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${BACKEND_URL}/shipping/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    const msg = error?.message ?? "Unknown error";
    console.error("Shipping rates proxy error:", msg);
    return NextResponse.json({ message: "Failed to reach shipping service", detail: msg }, { status: 502 });
  }
}
