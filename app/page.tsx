import { SupraPageShell } from "@/components/SupraPageShell";
import { envSiteUrl } from "@/lib/utils";

const siteUrl = envSiteUrl();

export default function Home() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "GR Supra Interactive Portfolio Concept",
      url: siteUrl,
      description:
        "An unofficial cinematic Toyota GR Supra Mk5 portfolio concept demonstrating scroll-controlled web animation.",
    },
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: "Toyota GR Supra Mk5 Interactive Automotive Portfolio Concept",
      url: siteUrl,
      creator: {
        "@type": "Person",
        name: "Interactive Automotive Portfolio Concept",
      },
      about: "Unofficial frontend engineering and interaction design portfolio concept.",
      isAccessibleForFree: true,
    },
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SupraPageShell />
      <noscript>
        <section className="noscript-fallback">
          <p>TOYOTA GAZOO RACING</p>
          <h1>GR SUPRA</h1>
          <p>
            An unofficial cinematic portfolio concept for the Toyota GR Supra Mk5, built to demonstrate advanced
            scroll-based storytelling, frontend engineering and accessible form handling.
          </p>
          <dl>
            <div>
              <dt>3.0L</dt>
              <dd>Turbocharged inline-six</dd>
            </div>
            <div>
              <dt>3.9 SEC</dt>
              <dd>0-60 mph</dd>
            </div>
            <div>
              <dt>RWD</dt>
              <dd>Rear-wheel drive</dd>
            </div>
          </dl>
          <p>
            This is not an official Toyota website, dealership, reservation platform or vehicle configurator.
          </p>
        </section>
      </noscript>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </>
  );
}
