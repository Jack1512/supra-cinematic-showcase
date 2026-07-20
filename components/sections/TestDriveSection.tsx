"use client";

import { TestDriveForm } from "@/components/forms/TestDriveForm";
import type { SupraConfiguration } from "@/types/configuration";

type TestDriveSectionProps = {
  configuration: SupraConfiguration;
};

export function TestDriveSection({ configuration }: TestDriveSectionProps) {
  return (
    <section id="enquiry" className="test-drive-section">
      <div className="test-drive-intro">
        <p className="section-kicker">Demonstration enquiry</p>
        <h2>READY TO FEEL IT?</h2>
        <p>Save your concept configuration and submit a demonstration test-drive enquiry.</p>
        <p className="portfolio-note">
          This is an unofficial portfolio demonstration and does not create an official Toyota booking.
        </p>
        <div className="configuration-summary configuration-summary--inline" aria-label="Selected configuration">
          <p className="micro-label">SELECTED CONFIGURATION</p>
          <strong>{configuration.exteriorFinish}</strong>
          <span>{configuration.wheelTheme} Wheels</span>
          <span>{configuration.transmission}</span>
        </div>
        <p className="expectations">
          A configured project can store your submission in Supabase and send confirmation email through Resend.
        </p>
      </div>
      <TestDriveForm configuration={configuration} />
    </section>
  );
}
