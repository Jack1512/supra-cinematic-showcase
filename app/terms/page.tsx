import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms - GR Supra Portfolio Concept",
  description: "Terms for the unofficial GR Supra interactive portfolio concept.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Link className="legal-back" href="/">
        Back to experience
      </Link>
      <p className="micro-label">Portfolio terms</p>
      <h1>Terms</h1>
      <p>
        This website is a portfolio demonstration created to show interaction design, animation, responsive frontend
        development, accessibility and backend form handling. It is not affiliated with, endorsed by or operated by
        Toyota Motor Corporation.
      </p>
      <p>
        The experience does not create official vehicle reservations, bookings, quotes, purchases or dealership
        appointments. Vehicle names, marks and related trademarks belong to their respective owners.
      </p>
      <p>
        Performance details and configuration options are included for demonstration context and should not be treated
        as official specifications, availability, pricing or legal product information.
      </p>
      <p>
        You agree not to misuse the enquiry form, attempt to submit malicious payloads or interfere with the
        demonstration. The site owner may update, remove or change the demonstration at any time.
      </p>
      <p>
        The demonstration is provided without warranty. Use the configured portfolio contact method for questions or
        removal requests.
      </p>
    </main>
  );
}
