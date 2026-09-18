"use client";

import { useEffect, useState } from "react";

/**
 * Persistent quote prompt once the visitor is past the hero, hidden again when the form
 * itself is on screen.
 *
 * Meeting 3: "as they scroll and they get to a place where, if you're interested,
 * [they can] just follow and fill the form."
 */
export function StickyQuoteBar({ phone }: { phone: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const quote = document.getElementById("quote");
    if (!quote) return;
    function onScroll() {
      const pastHero = window.scrollY > window.innerHeight * 0.8;
      const rect = quote!.getBoundingClientRect();
      const formVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
      setVisible(pastHero && !formVisible);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`sticky-quote${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <div className="sticky-quote-copy">
        <strong>Free quote, no obligation</strong>
        <span>Same-day callback wherever we can</span>
      </div>
      <div className="sticky-quote-actions">
        <a className="sticky-call" href={`tel:${phone.replace(/[^+\d]/g, "")}`} tabIndex={visible ? 0 : -1}>Call</a>
        <a className="button gold" href="#quote" tabIndex={visible ? 0 : -1}>Get a quote</a>
      </div>
    </div>
  );
}
