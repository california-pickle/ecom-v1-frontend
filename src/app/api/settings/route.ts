import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/settings
export async function GET() {
  return NextResponse.json(db.settings);
}

// PATCH /api/settings
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (body.adminEmail !== undefined) db.settings.adminEmail = body.adminEmail;
  if (body.emailNotificationsEnabled !== undefined) db.settings.emailNotificationsEnabled = body.emailNotificationsEnabled;
  if (body.lowStockAlertEnabled !== undefined) db.settings.lowStockAlertEnabled = body.lowStockAlertEnabled;
  if (body.orderNotificationsEnabled !== undefined) db.settings.orderNotificationsEnabled = body.orderNotificationsEnabled;
  return NextResponse.json(db.settings);
}
