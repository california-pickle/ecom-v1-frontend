import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/notifications
export async function GET() {
  const sorted = [...db.notifications].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json({
    notifications: sorted,
    unreadCount: sorted.filter((n) => !n.read).length,
  });
}

// POST /api/notifications — mark single or all as read
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.id) {
    const notif = db.notifications.find((n) => n.id === body.id);
    if (notif) notif.read = true;
  } else {
    db.notifications.forEach((n) => { n.read = true; });
  }
  return NextResponse.json({
    success: true,
    unreadCount: db.notifications.filter((n) => !n.read).length,
  });
}
