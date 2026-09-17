"use client";

import { useEffect, useState } from "react";

/**
 * Persistent quote prompt that appears once the visitor has scrolled past the hero
 * and hides again when the form itself is on screen.
 *
 * Meeting 3: "...as they scroll and they get to a place where, if you're interested,
 *             [they can] just follow and fill the form."
 *
 * Mobile-first: on small screens this is the primary path back to the form, since the
 * hero CTA is long gone by the time most visitors decide.
 */
export function StickyQuoteBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const quote = document.getElementById("quote");
    if (!quote) return;

    // Hide the bar whenever the form is actually in view — it would be redundant there.
    const formInView = new IntersectionObserver(
      ([entry]) => setVisible((current) => (entry.isIntersecting ? false : current)),
      { threshold: 0.12 },
    );
    formInView.observe(quote);

    function onScroll() {
      const pastHero = window.scrollY > window.innerHeight * 0.85;
      const rect = quote!.getBoundingClientRect();
      const formVisible = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
      setVisible(pastHero && !formVisible);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      formInView.disconnect();
    };
  }, []);

  return (
    <div className={`sticky-quote${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <p>Ready for a quote on your space?</p>
      <a className="button gold" href="#quote" tabIndex={visible ? 0 : -1}>
        Get a free quote <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
