import type { EnquiryValues } from "@/lib/validation";

function escapeHtml(value: string | undefined) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function configurationRows(payload: EnquiryValues) {
  return `
    <tr><td>Exterior finish</td><td>${escapeHtml(payload.exteriorFinish)}</td></tr>
    <tr><td>Wheel theme</td><td>${escapeHtml(payload.wheelTheme)}</td></tr>
    <tr><td>Transmission</td><td>${escapeHtml(payload.transmission)}</td></tr>
  `;
}

const baseStyles = `
  body { margin: 0; background: #050505; color: #f4f4f2; font-family: Arial, sans-serif; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 32px 20px; }
  .mark { color: #ff2a2a; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; }
  h1 { font-size: 28px; letter-spacing: 0.06em; text-transform: uppercase; margin: 22px 0 12px; }
  p { color: #c7c9ce; line-height: 1.65; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  td { border-top: 1px solid rgba(255,255,255,0.14); padding: 12px 0; color: #f4f4f2; vertical-align: top; }
  td:first-child { color: #9a9da3; width: 42%; }
  .note { color: #9a9da3; font-size: 13px; }
`;

export function visitorEmailTemplate(payload: EnquiryValues) {
  return `
    <!doctype html>
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${baseStyles}</style></head>
      <body>
        <div class="wrap">
          <div class="mark">GR Supra Concept</div>
          <h1>Demonstration enquiry received</h1>
          <p>Thanks ${escapeHtml(payload.fullName)}. Your portfolio demonstration enquiry has been stored.</p>
          <table>${configurationRows(payload)}</table>
          <p class="note">This is an unofficial portfolio demonstration. It is not an official Toyota dealership booking, reservation, payment request or purchase process.</p>
        </div>
      </body>
    </html>
  `;
}

export function adminEmailTemplate(payload: EnquiryValues, submittedAt: string) {
  return `
    <!doctype html>
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${baseStyles}</style></head>
      <body>
        <div class="wrap">
          <div class="mark">GR Supra Concept</div>
          <h1>New demonstration enquiry</h1>
          <table>
            <tr><td>Name</td><td>${escapeHtml(payload.fullName)}</td></tr>
            <tr><td>Email</td><td>${escapeHtml(payload.email)}</td></tr>
            <tr><td>Phone</td><td>${escapeHtml(payload.phone)}</td></tr>
            <tr><td>Location</td><td>${escapeHtml(payload.city)}, ${escapeHtml(payload.country)}</td></tr>
            <tr><td>Contact method</td><td>${escapeHtml(payload.preferredContactMethod)}</td></tr>
            <tr><td>Preferred date</td><td>${escapeHtml(payload.preferredTestDriveDate || "Not supplied")}</td></tr>
            ${configurationRows(payload)}
            <tr><td>Message</td><td>${escapeHtml(payload.message || "No message supplied")}</td></tr>
            <tr><td>Submitted</td><td>${escapeHtml(submittedAt)}</td></tr>
          </table>
        </div>
      </body>
    </html>
  `;
}
