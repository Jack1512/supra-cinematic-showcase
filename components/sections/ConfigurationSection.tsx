"use client";

import { COLOR_SWATCHES, WHEEL_DESCRIPTIONS } from "@/config/design";
import {
  EXTERIOR_FINISHES,
  TRANSMISSIONS,
  WHEEL_THEMES,
  type SupraConfiguration,
} from "@/types/configuration";

type ConfigurationSectionProps = {
  configuration: SupraConfiguration;
  onChange: (configuration: SupraConfiguration) => void;
};

export function ConfigurationSection({ configuration, onChange }: ConfigurationSectionProps) {
  return (
    <section id="configuration" className="configuration-section">
      <div className="section-kicker">Concept specification</div>
      <div className="configuration-layout">
        <div className="section-heading">
          <h2>DEFINE YOUR SUPRA</h2>
          <p>Choose a concept finish, wheel treatment and transmission preference for your demonstration enquiry.</p>
          <p className="portfolio-note">This is not an official Toyota configurator.</p>
        </div>
        <div className="configuration-controls">
          <fieldset>
            <legend>Exterior finish</legend>
            <div className="option-grid option-grid--finish">
              {EXTERIOR_FINISHES.map((finish) => (
                <button
                  key={finish}
                  type="button"
                  aria-pressed={configuration.exteriorFinish === finish}
                  className={configuration.exteriorFinish === finish ? "is-selected" : ""}
                  onClick={() => onChange({ ...configuration, exteriorFinish: finish })}
                >
                  <span
                    className="swatch"
                    style={{ backgroundColor: COLOR_SWATCHES[finish] }}
                    aria-hidden="true"
                  />
                  <span>{finish}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Wheel theme</legend>
            <div className="option-grid">
              {WHEEL_THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  aria-pressed={configuration.wheelTheme === theme}
                  className={configuration.wheelTheme === theme ? "is-selected" : ""}
                  onClick={() => onChange({ ...configuration, wheelTheme: theme })}
                >
                  <span>{theme}</span>
                  <small>{WHEEL_DESCRIPTIONS[theme]}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Transmission</legend>
            <div className="segmented-options">
              {TRANSMISSIONS.map((transmission) => (
                <button
                  key={transmission}
                  type="button"
                  aria-pressed={configuration.transmission === transmission}
                  className={configuration.transmission === transmission ? "is-selected" : ""}
                  onClick={() => onChange({ ...configuration, transmission })}
                >
                  {transmission}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="configuration-summary" aria-label="Your configuration">
          <p className="micro-label">YOUR CONFIGURATION</p>
          <strong>{configuration.exteriorFinish}</strong>
          <span>{configuration.wheelTheme} Wheels</span>
          <span>{configuration.transmission}</span>
        </aside>
      </div>
    </section>
  );
}
