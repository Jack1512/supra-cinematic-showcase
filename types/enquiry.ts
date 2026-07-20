import type { ExteriorFinish, Transmission, WheelTheme } from "./configuration";

export type PreferredContactMethod = "Email" | "Phone" | "WhatsApp";

export type EnquiryPayload = {
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  city: string;
  preferredContactMethod: PreferredContactMethod;
  preferredTestDriveDate?: string;
  exteriorFinish: ExteriorFinish;
  wheelTheme: WheelTheme;
  transmission: Transmission;
  message?: string;
  marketingConsent: boolean;
  privacyConsent: boolean;
  website?: string;
};
