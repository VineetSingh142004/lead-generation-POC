"use client";

/**
 * "Get a quote" on a service card. A tiny client component so the card itself — photo,
 * heading, copy — stays server-rendered. Tells the form which service was picked, then
 * scrolls to it.
 */
export function ServicePickButton({ service }: { service: string }) {
  function pick() {
    window.dispatchEvent(new CustomEvent("service:selected", { detail: service }));
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <button type="button" className="service-pick" onClick={pick}>
      <span>Get a quote</span>
      <span className="service-pick-arrow" aria-hidden="true">→</span>
      <span className="sr-only"> for {service}</span>
    </button>
  );
}
