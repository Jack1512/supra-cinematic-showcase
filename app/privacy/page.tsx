import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy - GR Supra Portfolio Concept",
  description: "Privacy information for the unofficial GR Supra interactive portfolio concept.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/">
        Back to experience
      </Link>
      <p className="micro-label">Portfolio privacy notice</p>
      <h1>Privacy</h1>
      <p>
        This website is an unofficial portfolio demonstration. The enquiry form may collect your name, email address,
        optional phone number, country, city, preferred contact method, optional preferred date, selected concept
        configuration, message and consent choices.
      </p>
      <p>
        The information is collected only to demonstrate how a premium interactive form can validate, store and route a
        demonstration enquiry. It does not create an official Toyota booking, dealership appointment, reservation or
        purchase request.
      </p>
      <p>
        When configured, submissions are stored in a Supabase table named enquiries. Email notifications may be sent
        through Resend to the visitor and to the configured portfolio administrator. Missing service credentials prevent
        live storage rather than fabricating a successful submission.
      </p>
      <p>
        Demonstration submissions may be retained for portfolio review, testing and follow-up, then removed when no
        longer needed. To request deletion, use the contact address configured by the site owner. No payment details are
        collected.
      </p>
    </main>
  );
}
