import { Resend } from "resend";
import type { EnquiryValues } from "@/lib/validation";
import { adminEmailTemplate, visitorEmailTemplate } from "./templates";

export async function sendEnquiryEmails(payload: EnquiryValues, submittedAt: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ENQUIRY_NOTIFICATION_EMAIL;

  if (!apiKey || !adminEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Email delivery skipped: RESEND_API_KEY or ENQUIRY_NOTIFICATION_EMAIL is missing.");
    }

    return { attempted: false, delivered: false };
  }

  const resend = new Resend(apiKey);
  const from = "GR Supra Concept <onboarding@resend.dev>";

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: payload.email,
      subject: "Your GR Supra concept enquiry",
      html: visitorEmailTemplate(payload),
    }),
    resend.emails.send({
      from,
      to: adminEmail,
      subject: "New GR Supra concept enquiry",
      html: adminEmailTemplate(payload, submittedAt),
    }),
  ]);

  return {
    attempted: true,
    delivered: results.every((result) => result.status === "fulfilled"),
  };
}
