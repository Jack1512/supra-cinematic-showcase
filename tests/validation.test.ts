import { describe, expect, it } from "vitest";
import { enquirySchema, isPastIsoDate, isReasonablePhone } from "@/lib/validation";

const validPayload = {
  fullName: "Ada Driver",
  email: "ada@example.com",
  phone: "+61412345678",
  country: "Australia",
  city: "Sydney",
  preferredContactMethod: "Email",
  preferredTestDriveDate: "2099-01-01",
  exteriorFinish: "Renaissance Red",
  wheelTheme: "Performance Black",
  transmission: "6-Speed Manual",
  message: "Please contact me in the morning.",
  marketingConsent: false,
  privacyConsent: true,
};

describe("enquiry validation", () => {
  it("accepts a complete demonstration enquiry", () => {
    expect(enquirySchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(enquirySchema.safeParse({ ...validPayload, email: "broken" }).success).toBe(false);
  });

  it("requires privacy consent", () => {
    expect(enquirySchema.safeParse({ ...validPayload, privacyConsent: false }).success).toBe(false);
  });

  it("validates phone numbers reasonably", () => {
    expect(isReasonablePhone("+1 555 010 2048")).toBe(true);
    expect(isReasonablePhone("123")).toBe(false);
  });

  it("detects past ISO dates", () => {
    expect(isPastIsoDate("2026-07-19", new Date("2026-07-20T12:00:00Z"))).toBe(true);
    expect(isPastIsoDate("2026-07-20", new Date("2026-07-20T12:00:00Z"))).toBe(false);
  });
});
