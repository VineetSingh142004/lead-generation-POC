"use client";

import { FormEvent, useState } from "react";

const services = [
  { id: "01", name: "Home / Garage Epoxy", copy: "A clean, durable finish for your garage, workshop, or home space.", visual: "garage" },
  { id: "02", name: "Commercial / Factory Epoxy", copy: "A hard-wearing surface for warehouses, shops, and high-use facilities.", visual: "commercial" },
  { id: "03", name: "Other Epoxy Flooring", copy: "Tell us about the space and we’ll help identify the right solution.", visual: "other" },
];

const finishes = [
  ["Obsidian flake", "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85"],
  ["Silver wash", "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=900&q=85"],
  ["Graphite marble", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85"],
];

export default function Home() {
  const [service, setService] = useState(services[0].name);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function chooseService(value: string) {
    setService(value);
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    const phone = String(payload.phone || "");
    if (!/^[+()\-\s\d]{7,24}$/.test(phone)) { setError("Please enter a valid phone number."); return; }
    setSending(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSent(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); }
    finally { setSending(false); }
  }

  return <main>
    <nav className="nav shell"><a className="brand" href="#top">EPOXY <span>ATELIER</span></a><div className="nav-links"><a href="#services">Services</a><a href="#work">Our work</a><a href="#about">About</a></div><a className="nav-cta" href="#quote">Get a quote <i>↗</i></a></nav>
    <section id="top" className="hero shell">
      <div className="hero-copy"><p className="eyebrow">PREMIUM EPOXY FLOORING <b>•</b> MADE FOR YOUR SPACE</p><h1>Concrete,<br/><em>reconsidered.</em></h1><p className="lede">Professional epoxy flooring for garages, commercial spaces, and everywhere a better surface changes the room.</p><div className="hero-actions"><a className="button gold" href="#quote">Get a free quote <span>↗</span></a><a className="text-link" href="#services">Explore services <span>↓</span></a></div></div>
      <div className="hero-art" aria-label="Polished epoxy floor installation"><div className="art-grid"/><div className="art-sheen"/><div className="art-label"><span>01 / 03</span><span>FORM + FUNCTION</span></div><div className="art-orb"/></div>
    </section>
    <section className="intro shell"><p className="eyebrow">THE SURFACE SETS THE TONE</p><p className="statement">A floor is the largest finish in a room. Make it a considered one.</p><div className="intro-mark">EA<sup>®</sup></div></section>
    <section id="services" className="services"><div className="shell"><div className="section-head"><p className="eyebrow">SELECT YOUR PROJECT</p><h2>Built around<br/>the way you use space.</h2><p>Three clear starting points. Choose one and we’ll take it from there.</p></div><div className="service-list">{services.map((item) => <article key={item.id} className="service-card"><div className={`service-image service-${item.visual}`} aria-label={`${item.name} flooring visual`}><span>{item.visual === "garage" ? "GARAGE / HOME" : item.visual === "commercial" ? "COMMERCIAL / FACTORY" : "YOUR PROJECT"}</span></div><div className="service-info"><span className="service-index">{item.id}</span><h3>{item.name}</h3><p>{item.copy}</p><button onClick={() => chooseService(item.name)}>Get a quote <span>↗</span></button></div></article>)}</div></div></section>
    <section id="work" className="finishes shell"><div className="section-head compact"><p className="eyebrow">SURFACE STUDIES</p><h2>Made to be<br/><em>looked at.</em></h2></div><div className="finish-grid">{finishes.map(([name,image], index) => <figure key={name} className={`finish finish-${index + 1}`}><div style={{ backgroundImage: `url(${image})` }}/><figcaption><span>{name}</span><span>View finish ↗</span></figcaption></figure>)}</div></section>
    <section id="about" className="benefits"><div className="shell benefits-inner"><div><p className="eyebrow">A BETTER BASELINE</p><h2>Quietly capable.<br/>Visibly considered.</h2></div><div className="benefit-list"><p><b>01</b><span>Durable</span><small>Built for demanding everyday use.</small></p><p><b>02</b><span>Easy to maintain</span><small>A smooth surface that’s simple to clean.</small></p><p><b>03</b><span>Professional finish</span><small>Clean, modern, and made for the room.</small></p></div></div></section>
    <section id="quote" className="quote shell"><div className="quote-copy"><p className="eyebrow">START A CONVERSATION</p><h2>Let’s talk about<br/><em>your floor.</em></h2><p>Tell us a little about the project. Our team will contact you to discuss the next step.</p><div className="quote-metal"/></div>{sent ? <div className="success"><div>✓</div><h3>You’re all set.</h3><p>We’ve received your information. Someone from our team will contact you soon.</p></div> : <form onSubmit={submit} noValidate><label>Full name<input required name="name" placeholder="Your name"/></label><label>Email address<input required name="email" type="email" autoComplete="email" placeholder="you@example.com"/></label><label>Phone number<input required name="phone" inputMode="tel" placeholder="(000) 000-0000"/></label><label>Address / region<input required name="address" placeholder="City or service area"/></label><label>Service needed<select name="service" value={service} onChange={(e) => setService(e.target.value)}>{services.map(({name}) => <option key={name}>{name}</option>)}</select></label>{error && <p className="form-error">{error}</p>}<button className="submit" disabled={sending}>{sending ? "Sending request…" : "Request a free quote"}<span>↗</span></button><p className="form-note">We’ll only use your details to follow up on this request.</p></form>}</section>
    <section className="closing"><div className="shell"><p className="eyebrow">YOUR SPACE, REDEFINED</p><h2>Ready to upgrade<br/>your floor?</h2><a className="button light" href="#quote">Get a free quote <span>↗</span></a></div></section>
    <footer className="shell"><a className="brand" href="#top">EPOXY <span>ATELIER</span></a><p>Professional flooring. Built around your space.</p><div><a href="#services">Services</a><a href="#work">Our work</a><a href="#quote">Get a quote</a></div><small>© {new Date().getFullYear()} Epoxy Atelier. Placeholder business details to be replaced before launch.</small></footer>
  </main>;
}
