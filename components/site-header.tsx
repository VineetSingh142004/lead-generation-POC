"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Our work" },
  { href: "#about", label: "About" },
];

/**
 * Sticky header with a working mobile menu.
 *
 * Audit finding #12: below 760px the nav links were simply `display:none` with no
 * replacement, so mobile visitors — the majority for this category — lost navigation
 * entirely. Sticky also serves meeting 3: "as they scroll... a place where, if you're
 * interested, [you can] fill the form" — Get a quote is now always one tap away.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Close on Escape, and never leave the menu open across a resize to desktop.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onResize() {
      if (window.innerWidth > 760) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="Primary">
        <a className="brand" href="#top">
          {site.wordmark[0]} <span>{site.wordmark[1]}</span>
        </a>

        <div className="nav-links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        <div className="nav-actions">
          <a className="nav-cta" href="#quote">Get a quote <span aria-hidden="true">↗</span></a>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <div className="shell">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <a className="mobile-menu-cta" href="#quote" onClick={() => setOpen(false)}>
            Get a free quote <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
}
