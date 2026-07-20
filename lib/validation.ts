import { z } from "zod";
import { EXTERIOR_FINISHES, TRANSMISSIONS, WHEEL_THEMES } from "@/types/configuration";

export const preferredContactMethods = ["Email", "Phone", "WhatsApp"] as const;

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export function isPastIsoDate(value: string, now = new Date()) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return false;
  }

  const input = new Date(Date.UTC(year, month - 1, day));
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return input < today;
}

export function isReasonablePhone(value: string) {
  const normalized = value.replace(/[\s().-]/g, "");
  return /^\+?[0-9]{7,16}$/.test(normalized);
}

export const enquirySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(120, "Full name is too long."),
  email: z.string().trim().min(1, "Email address is required.").email("Email must be valid."),
  phone: optionalTrimmed.refine((value) => !value || isReasonablePhone(value), {
    message: "Phone number must look valid.",
  }),
  country: z.string().trim().min(1, "Country is required.").max(80, "Country is too long."),
  city: z.string().trim().min(1, "City is required.").max(80, "City is too long."),
  preferredContactMethod: z.enum(preferredContactMethods, {
    error: "Preferred contact method is required.",
  }),
  preferredTestDriveDate: optionalTrimmed.refine((value) => !value || !isPastIsoDate(value), {
    message: "Preferred date cannot be in the past.",
  }),
  exteriorFinish: z.enum(EXTERIOR_FINISHES, { error: "Exterior finish is required." }),
  wheelTheme: z.enum(WHEEL_THEMES, { error: "Wheel theme is required." }),
  transmission: z.enum(TRANSMISSIONS, { error: "Transmission is required." }),
  message: z.string().trim().max(700, "Message must be 700 characters or fewer.").optional(),
  marketingConsent: z.boolean().default(false),
  privacyConsent: z.boolean().refine((value) => value, {
    message: "Privacy consent is required.",
  }),
  website: z.string().trim().max(0, "Submission could not be accepted.").optional(),
});

export type EnquiryFormValues = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;
