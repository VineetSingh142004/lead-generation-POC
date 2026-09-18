"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
];

/**
 * Sticky header with a real mobile menu. The previous build hid the nav links below
 * 760px with no replacement, which left phone visitors — most of this audience — with
 * no navigation at all.
 */
export function SiteHeader({ wordmark, phone }: { wordmark: [string, string]; phone: string }) {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth > 860 && setOpen(false);
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Stop the page scrolling behind an open menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`site-header${condensed ? " is-condensed" : ""}`}>
      <nav className="nav shell" aria-label="Primary">
        <a className="brand" href="#top">
          {wordmark[0]}&nbsp;<span>{wordmark[1]}</span>
        </a>

        <div className="nav-links">
          {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </div>

        <div className="nav-actions">
          <a className="nav-phone" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>
          <a className="nav-cta" href="#quote">Get a quote</a>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`bars${open ? " is-open" : ""}`} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <div className="shell">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} onClick={() => setOpen(false)}>{phone}</a>
          <a className="mobile-menu-cta" href="#quote" onClick={() => setOpen(false)}>Get a free quote</a>
        </div>
      </div>
    </header>
  );
}
