import { NextRequest, NextResponse } from "next/server";
import { sendEnquiryEmails } from "@/lib/email/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { enquirySchema } from "@/lib/validation";

export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 12_000;

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "local";
}

function sanitizeMessage(value: string | undefined) {
  return value?.replace(/\s+/g, " ").trim() || null;
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(getClientKey(request), { limit: 5, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many enquiries have been submitted. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ message: "The enquiry payload is too large." }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "The enquiry payload is not valid JSON." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Please check the form and try again.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  if (payload.website) {
    return NextResponse.json({ message: "The enquiry could not be accepted." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        message:
          "Submission storage is not configured yet. Add Supabase environment variables before accepting enquiries.",
      },
      { status: 503 },
    );
  }

  const submittedAt = new Date().toISOString();
  const { error } = await supabase.from("enquiries").insert({
    created_at: submittedAt,
    full_name: payload.fullName,
    email: payload.email,
    phone: payload.phone || null,
    country: payload.country,
    city: payload.city,
    preferred_contact_method: payload.preferredContactMethod,
    preferred_test_drive_date: payload.preferredTestDriveDate || null,
    exterior_finish: payload.exteriorFinish,
    wheel_theme: payload.wheelTheme,
    transmission: payload.transmission,
    message: sanitizeMessage(payload.message),
    marketing_consent: payload.marketingConsent,
    privacy_consent: payload.privacyConsent,
    status: "new",
    user_agent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  });

  if (error) {
    console.error("Supabase enquiry insert failed:", error.message);
    return NextResponse.json(
      { message: "The enquiry could not be stored. Please try again later." },
      { status: 502 },
    );
  }

  try {
    await sendEnquiryEmails(payload, submittedAt);
  } catch (error) {
    console.warn("Email delivery failed after enquiry storage:", error instanceof Error ? error.message : error);
  }

  return NextResponse.json({ ok: true, message: "The demonstration enquiry has been stored." });
}
