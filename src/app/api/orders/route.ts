import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // We expect the body to have the format the backend needs
    // or we transform it here.
    
    const response = await fetch(`${BACKEND_URL}/order/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Order proxy error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
