"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EXTERIOR_FINISHES, TRANSMISSIONS, WHEEL_THEMES, type SupraConfiguration } from "@/types/configuration";
import { enquirySchema, preferredContactMethods, type EnquiryFormValues } from "@/lib/validation";

type TestDriveFormProps = {
  configuration: SupraConfiguration;
};

export function TestDriveForm({ configuration }: TestDriveFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      preferredContactMethod: "Email",
      preferredTestDriveDate: "",
      exteriorFinish: configuration.exteriorFinish,
      wheelTheme: configuration.wheelTheme,
      transmission: configuration.transmission,
      message: "",
      marketingConsent: false,
      privacyConsent: false,
      website: "",
    },
  });

  useEffect(() => {
    setValue("exteriorFinish", configuration.exteriorFinish, { shouldValidate: true });
    setValue("wheelTheme", configuration.wheelTheme, { shouldValidate: true });
    setValue("transmission", configuration.transmission, { shouldValidate: true });
  }, [configuration, setValue]);

  const errorList = Object.entries(errors)
    .map(([field, error]) => ({ field, message: error?.message }))
    .filter((item): item is { field: string; message: string } => Boolean(item.message));

  async function onSubmit(values: EnquiryFormValues) {
    setServerMessage(null);
    setSuccess(false);

    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setServerMessage(result?.message || "The enquiry could not be submitted. Please try again.");
      return;
    }

    setSuccess(true);
    setServerMessage("Your demonstration enquiry has been stored.");
    reset({
      ...values,
      fullName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      preferredTestDriveDate: "",
      message: "",
      marketingConsent: false,
      privacyConsent: false,
      website: "",
    });
  }

  return (
    <form className="test-drive-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {errorList.length > 0 ? (
        <div className="error-summary" role="alert">
          <strong>Check the following fields:</strong>
          <ul>
            {errorList.map((error) => (
              <li key={error.field}>{error.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="form-grid">
        <label>
          <span>Full name</span>
          <Input autoComplete="name" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
          <FormMessage>{errors.fullName?.message}</FormMessage>
        </label>
        <label>
          <span>Email address</span>
          <Input type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
          <FormMessage>{errors.email?.message}</FormMessage>
        </label>
        <label>
          <span>Phone number</span>
          <Input type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
          <FormMessage>{errors.phone?.message}</FormMessage>
        </label>
        <label>
          <span>Country</span>
          <Input autoComplete="country-name" aria-invalid={Boolean(errors.country)} {...register("country")} />
          <FormMessage>{errors.country?.message}</FormMessage>
        </label>
        <label>
          <span>City</span>
          <Input autoComplete="address-level2" aria-invalid={Boolean(errors.city)} {...register("city")} />
          <FormMessage>{errors.city?.message}</FormMessage>
        </label>
        <label>
          <span>Preferred contact method</span>
          <Select aria-invalid={Boolean(errors.preferredContactMethod)} {...register("preferredContactMethod")}>
            {preferredContactMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
          <FormMessage>{errors.preferredContactMethod?.message}</FormMessage>
        </label>
        <label>
          <span>Preferred test-drive date</span>
          <Input
            type="date"
            min={today}
            aria-invalid={Boolean(errors.preferredTestDriveDate)}
            {...register("preferredTestDriveDate")}
          />
          <FormMessage>{errors.preferredTestDriveDate?.message}</FormMessage>
        </label>
        <label>
          <span>Exterior finish</span>
          <Select aria-invalid={Boolean(errors.exteriorFinish)} {...register("exteriorFinish")}>
            {EXTERIOR_FINISHES.map((finish) => (
              <option key={finish} value={finish}>
                {finish}
              </option>
            ))}
          </Select>
          <FormMessage>{errors.exteriorFinish?.message}</FormMessage>
        </label>
        <label>
          <span>Wheel theme</span>
          <Select aria-invalid={Boolean(errors.wheelTheme)} {...register("wheelTheme")}>
            {WHEEL_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </Select>
          <FormMessage>{errors.wheelTheme?.message}</FormMessage>
        </label>
        <label>
          <span>Transmission preference</span>
          <Select aria-invalid={Boolean(errors.transmission)} {...register("transmission")}>
            {TRANSMISSIONS.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </Select>
          <FormMessage>{errors.transmission?.message}</FormMessage>
        </label>
      </div>

      <label>
        <span>Message</span>
        <Textarea maxLength={700} aria-invalid={Boolean(errors.message)} {...register("message")} />
        <FormMessage>{errors.message?.message}</FormMessage>
      </label>

      <label className="hidden-field" aria-hidden="true">
        <span>Website</span>
        <input tabIndex={-1} autoComplete="off" {...register("website")} />
      </label>

      <label className="checkbox-row">
        <Checkbox {...register("marketingConsent")} />
        <span>I agree to receive optional portfolio follow-up communication about this demonstration.</span>
      </label>

      <label className="checkbox-row">
        <Checkbox aria-invalid={Boolean(errors.privacyConsent)} {...register("privacyConsent")} />
        <span>I agree that this demonstration enquiry may be stored and handled according to the privacy notice.</span>
      </label>
      <FormMessage>{errors.privacyConsent?.message}</FormMessage>

      <div className="form-footer">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting" : "Submit enquiry"}
        </Button>
        <p className={success ? "form-status is-success" : "form-status"} role="status" aria-live="polite">
          {serverMessage || "No official Toyota booking is created by this form."}
        </p>
      </div>
    </form>
  );
}
