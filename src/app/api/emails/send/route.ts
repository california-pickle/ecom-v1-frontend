import { NextRequest, NextResponse } from "next/server";
import { db, generateSentEmailId, addLog, today, nowTime, persistDb } from "@/lib/db";
import { buildBrandedEmail } from "@/lib/emailTemplate";

export async function GET() {
  return NextResponse.json(db.sentEmails);
}

export async function POST(req: NextRequest) {
  try {
    const { to, toName, subject, body, couponCode } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "to, subject, and body are required" },
        { status: 400 },
      );
    }

    // Look up coupon details for the branded block
    let couponData: { code: string; discountPercent: number; expiresAt: string } | undefined;
    if (couponCode) {
      const coupon = db.coupons.find((c) => c.code === couponCode);
      if (coupon) {
        couponData = {
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          expiresAt: coupon.expiresAt,
        };
      }
    }

    const htmlBody = buildBrandedEmail(toName || to, body, couponData);

    const apiKey = process.env.ZEPTOMAIL_API_KEY;

    if (apiKey) {
      try {
        const zepto = await fetch("https://api.zeptomail.com/v1.1/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Zoho-enczapikey ${apiKey}`,
          },
          body: JSON.stringify({
            from: {
              address: "noreply@thecaliforniapickle.com",
              name: "The California Pickle",
            },
            to: [
              {
                email_address: {
                  address: to,
                  name: toName || to,
                },
              },
            ],
            subject,
            htmlbody: htmlBody,
          }),
        });

        if (!zepto.ok) {
          const errorText = await zepto.text();
          console.error(`ZeptoMail API error (${zepto.status}): ${errorText}`);
        }
      } catch (sendError) {
        console.error("ZeptoMail fetch failed:", sendError);
      }
    }

    const sentEmail = {
      id: generateSentEmailId(),
      to,
      toName: toName || "",
      subject,
      body,
      ...(couponCode ? { couponCode } : {}),
      sentAt: `${today()} ${nowTime()}`,
    };

    db.sentEmails.unshift(sentEmail);
    persistDb();
    addLog("Email Sent", `Email "${subject}" sent to ${toName || to}`);

    return NextResponse.json({ success: true, email: sentEmail });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
