import { NextRequest, NextResponse } from "next/server";
import { db, persistDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json(db.emailTemplates);
}

export async function PUT(req: NextRequest) {
  try {
    const { id, subject, fields, body } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Template id is required" }, { status: 400 });
    }

    const template = db.emailTemplates.find((t) => t.id === id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (template.locked) {
      // Pre-designed templates: only subject and fields are editable
      if (subject !== undefined) template.subject = subject;
      if (fields !== undefined) template.fields = fields;
    } else {
      // Custom templates: subject and body are editable
      if (subject !== undefined) template.subject = subject;
      if (body !== undefined) template.body = body;
    }

    persistDb();
    return NextResponse.json(template);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
