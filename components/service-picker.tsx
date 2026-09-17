"use client";

/**
 * The "select this service" action on a service card.
 *
 * Kept as a tiny client component so the card itself — image, heading, copy — stays
 * server-rendered. Tells the form which service was chosen, then scrolls to it.
 */
export function ServicePickButton({ service }: { service: string }) {
  function pick() {
    window.dispatchEvent(new CustomEvent("service:selected", { detail: service }));
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button type="button" className="service-pick" onClick={pick}>
      Get a quote <span aria-hidden="true">↗</span>
      <span className="sr-only"> for {service}</span>
    </button>
  );
}
