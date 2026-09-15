"use client";

import { FormEvent, useState } from "react";

const services = [
  { id: "01", name: "Home / Garage Epoxy", copy: "Seamless, durable epoxy for garages and residential workspaces.", image: "https://plus.unsplash.com/premium_photo-1764691293898-fdd2e1553f2a?auto=format&fit=crop&w=1400&q=88", imageAlt: "Modern residential garage with a finished floor" },
  { id: "02", name: "Commercial / Factory Epoxy", copy: "High-performance flooring for warehouses, shops, and production spaces.", image: "https://images.unsplash.com/photo-1772305595483-6b058aff40f9?auto=format&fit=crop&w=1400&q=88", imageAlt: "Workers coating a large industrial warehouse floor" },
  { id: "03", name: "Other Epoxy Flooring", copy: "Custom epoxy finishes for specialty rooms, studios, and unique spaces.", image: "https://plus.unsplash.com/premium_photo-1676471847850-68a1bc8db597?auto=format&fit=crop&w=1400&q=88", imageAlt: "Specialty room with a colored finished floor" },
];

const finishes = [
  ["Obsidian flake", "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85"],
  ["Silver wash", "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=900&q=85"],
  ["Graphite marble", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85"],
];

type FieldErrors = Partial<Record<"name" | "phone" | "address" | "service", string>>;

export default function Home() {
  const [service, setService] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function chooseService(value: string) {
    setService(value);
    clearFieldError("service");
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      address: String(form.get("address") || "").trim(),
      service: String(form.get("service") || ""),
    };
    const nextErrors: FieldErrors = {};
    if (!payload.name) nextErrors.name = "Enter your name so we know who to contact.";
    if (!payload.phone) nextErrors.phone = "Enter a phone number so we can call you back.";
    else if (!/^[+()\-\s\d]{7,24}$/.test(payload.phone)) nextErrors.phone = "Enter a valid phone number, including area code.";
    if (!payload.address) nextErrors.address = "Enter your city, region, or service address.";
    if (!services.some(({ name }) => name === payload.service)) nextErrors.service = "Choose the service that best fits your project.";
    if (Object.keys(nextErrors).length) { setFieldErrors(nextErrors); return; }
    setFieldErrors({});
    setSending(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Request failed");
      setSent(true);
    } catch { setError("We couldn’t send your request just now. Please try again in a moment."); }
    finally { setSending(false); }
  }

  return <main>
    <nav className="nav shell"><a className="brand" href="#top">EPOXY <span>ATELIER</span></a><div className="nav-links"><a href="#services">Services</a><a href="#work">Our work</a><a href="#about">About</a></div><a className="nav-cta" href="#quote">Get a quote <i>↗</i></a></nav>
    <section id="top" className="hero shell">
      <div className="hero-copy"><p className="eyebrow">PREMIUM EPOXY FLOORING <b>•</b> MADE FOR YOUR SPACE</p><h1>Concrete,<br/><em>reconsidered.</em></h1><p className="lede">Professional epoxy flooring for garages, commercial spaces, and everywhere a better surface changes the room.</p><div className="hero-actions"><a className="button gold" href="#quote">Get a free quote <span>↗</span></a><a className="text-link" href="#services">Explore services <span>↓</span></a></div></div>
      <div className="hero-art" aria-label="Polished epoxy floor installation"><div className="art-grid"/><div className="art-sheen"/><div className="art-label"><span>01 / 03</span><span>FORM + FUNCTION</span></div><div className="art-orb"/></div>
    </section>
    <section className="intro shell"><p className="eyebrow">THE SURFACE SETS THE TONE</p><p className="statement">A floor is the largest finish in a room. Make it a considered one.</p><div className="intro-mark">EA<sup>®</sup></div></section>
    <section id="services" className="services"><div className="shell"><div className="section-head"><p className="eyebrow">SELECT YOUR PROJECT</p><h2>Built around<br/>the way you use space.</h2><p>Choose your starting point. We’ll take it from there.</p></div><div className="service-list">{services.map((item) => <article key={item.id} className="service-card"><div className="service-image" role="img" aria-label={item.imageAlt} style={{ backgroundImage: `url(${item.image})` }}/><div className="service-info"><span className="service-index">{item.id}</span><h3>{item.name}</h3><p>{item.copy}</p><button onClick={() => chooseService(item.name)}>Select this service <span>↗</span></button></div></article>)}</div></div></section>
    <section id="work" className="finishes shell"><div className="section-head compact"><p className="eyebrow">SURFACE STUDIES</p><h2>Made to be<br/><em>looked at.</em></h2></div><div className="finish-grid">{finishes.map(([name,image], index) => <figure key={name} className={`finish finish-${index + 1}`}><div style={{ backgroundImage: `url(${image})` }}/><figcaption><span>{name}</span><span>View finish ↗</span></figcaption></figure>)}</div></section>
    <section id="about" className="benefits"><div className="shell benefits-inner"><div><p className="eyebrow">A BETTER BASELINE</p><h2>Quietly capable.<br/>Visibly considered.</h2></div><div className="benefit-list"><p><b>01</b><span>Durable</span><small>Built for demanding everyday use.</small></p><p><b>02</b><span>Easy to maintain</span><small>A smooth surface that’s simple to clean.</small></p><p><b>03</b><span>Professional finish</span><small>Clean, modern, and made for the room.</small></p></div></div></section>
    <section id="quote" className="quote shell"><div className="quote-copy"><p className="eyebrow">START A CONVERSATION</p><h2>Let’s talk about<br/><em>your floor.</em></h2><p>Tell us a little about the project. Our team will contact you to discuss the next step.</p><div className="quote-metal"/></div>{sent ? <div className="success" role="status" aria-live="polite"><div>✓</div><h3>Thank you — you’re all set.</h3><p>We’ve received your information. Someone from our team will contact you soon.</p></div> : <form onSubmit={submit} noValidate><p className="form-intro">All fields are required. Choose a service above, or select one below.</p><label>Full name <span className="required-mark" aria-hidden="true">*</span><input required name="name" placeholder="Your name" autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} onChange={() => clearFieldError("name")}/>{fieldErrors.name && <span className="field-error" id="name-error">{fieldErrors.name}</span>}</label><label>Phone number <span className="required-mark" aria-hidden="true">*</span><input required name="phone" inputMode="tel" autoComplete="tel" placeholder="(000) 000-0000" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "phone-error" : undefined} onChange={() => clearFieldError("phone")}/>{fieldErrors.phone && <span className="field-error" id="phone-error">{fieldErrors.phone}</span>}</label><label>Address / region <span className="required-mark" aria-hidden="true">*</span><input required name="address" autoComplete="street-address" placeholder="City or service area" aria-invalid={Boolean(fieldErrors.address)} aria-describedby={fieldErrors.address ? "address-error" : undefined} onChange={() => clearFieldError("address")}/>{fieldErrors.address && <span className="field-error" id="address-error">{fieldErrors.address}</span>}</label><label>Selected service <span className="required-mark" aria-hidden="true">*</span><select required name="service" value={service} aria-invalid={Boolean(fieldErrors.service)} aria-describedby={fieldErrors.service ? "service-error" : undefined} onChange={(e) => { setService(e.target.value); clearFieldError("service"); }}><option value="" disabled>Choose a service</option>{services.map(({name}) => <option key={name}>{name}</option>)}</select>{fieldErrors.service && <span className="field-error" id="service-error">{fieldErrors.service}</span>}</label>{error && <p className="form-error" role="alert">{error}</p>}<button className="submit" disabled={sending} aria-busy={sending}>{sending ? "Submitting request…" : "Get a quote"}<span>↗</span></button></form>}</section>
    <section className="closing"><div className="shell"><p className="eyebrow">YOUR SPACE, REDEFINED</p><h2>Ready to upgrade<br/>your floor?</h2><a className="button light" href="#quote">Get a free quote <span>↗</span></a></div></section>
    <footer className="shell"><a className="brand" href="#top">EPOXY <span>ATELIER</span></a><p>Professional flooring. Built around your space.</p><div><a href="#services">Services</a><a href="#work">Our work</a><a href="#quote">Get a quote</a></div><small>© {new Date().getFullYear()} Epoxy Atelier. Placeholder business details to be replaced before launch.</small></footer>
  </main>;
}
