import { Suspense } from "react";
import { services, site } from "@/config/site";
import { FinishPlate } from "@/components/finish-plate";
import { QuoteForm } from "@/components/quote-form";
import { ServicePickButton } from "@/components/service-picker";
import { SiteHeader } from "@/components/site-header";
import { StickyQuoteBar } from "@/components/sticky-quote-bar";

/**
 * Server component (audit finding #9). Previously the entire landing page carried
 * "use client" even though only the form needs interactivity; all copy and markup now
 * renders on the server and only the four small islands ship JavaScript.
 *
 * Every string on this page comes from config/site.ts — meeting 3's "cookie cutter...
 * blocks for content, blocks for images" and slide 5's "Adjust per Company's product
 * offerings". Restyling this for a different business is a one-file edit.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section id="top" className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow">{site.hero.eyebrow}</p>
            <h1>
              {site.hero.headline}
              <br />
              <em>{site.hero.headlineAccent}</em>
            </h1>
            <p className="lede">{site.hero.lede}</p>
            <div className="hero-actions">
              <a className="button gold" href="#quote">Get a free quote <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#services">Explore services <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero-art" role="img" aria-label="Polished epoxy floor surface">
            <div className="art-grid" />
            <div className="art-sheen" />
            <div className="art-orb" />
            <div className="art-label">
              <span>01 / 0{services.length}</span>
              <span>FORM + FUNCTION</span>
            </div>
          </div>
        </section>

        <section className="intro shell">
          <p className="eyebrow">The surface sets the tone</p>
          <p className="statement">{site.statement}</p>
        </section>

        <section id="services" className="services">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow">Select your project</p>
              <h2>Built around<br />the way you use space.</h2>
              <p className="section-note">Choose your starting point. We&rsquo;ll take it from there.</p>
            </div>
            <div className="service-list">
              {services.map((service, index) => (
                <article key={service.id} className="service-card">
                  <div className="service-image">
                    <FinishPlate service={service} priority={index === 0} />
                  </div>
                  <div className="service-info">
                    <span className="service-index">0{index + 1}</span>
                    <h3>{service.name}</h3>
                    <p>{service.copy}</p>
                    <ServicePickButton service={service.name} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="finishes shell">
          <div className="section-head compact">
            <p className="eyebrow">Surface studies</p>
            <h2>Made to be<br /><em>looked at.</em></h2>
          </div>
          <div className="finish-grid">
            {services.map((service, index) => (
              <figure key={service.id} className={`finish finish-${index + 1}`}>
                <div className="finish-media">
                  <FinishPlate service={service} />
                </div>
                <figcaption>
                  <span>{service.finish} finish</span>
                  <span className="finish-note">Sample</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="finish-disclaimer">
            Material samples shown. Photography of completed installations will replace these before launch.
          </p>
        </section>

        <section id="about" className="benefits">
          <div className="shell benefits-inner">
            <div>
              <p className="eyebrow">A better baseline</p>
              <h2>Quietly capable.<br />Visibly considered.</h2>
            </div>
            <div className="benefit-list">
              {site.benefits.map((benefit, index) => (
                <p key={benefit.title}>
                  <b>0{index + 1}</b>
                  <span>{benefit.title}</span>
                  <small>{benefit.detail}</small>
                </p>
              ))}
            </div>
          </div>
        </section>

        <section id="quote" className="quote shell">
          <div className="quote-copy">
            <p className="eyebrow">Start a conversation</p>
            <h2>{site.quote.heading}<br /><em>{site.quote.headingAccent}</em></h2>
            <p className="quote-lede">{site.quote.intro}</p>
            <div className="quote-metal" />
          </div>
          <Suspense fallback={<div className="quote-form-slot" />}>
            <QuoteForm />
          </Suspense>
        </section>

        <section className="closing">
          <div className="shell">
            <p className="eyebrow">Your space, redefined</p>
            <h2>Ready to upgrade<br />your floor?</h2>
            <a className="button light" href="#quote">Get a free quote <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <footer className="shell">
          <a className="brand" href="#top">{site.wordmark[0]} <span>{site.wordmark[1]}</span></a>
          <p>{site.tagline}</p>
          <div>
            <a href="#services">Services</a>
            <a href="#work">Our work</a>
            <a href="#quote">Get a quote</a>
          </div>
          <small>
            © {new Date().getFullYear()} {site.businessName}. Placeholder business details to be replaced before launch.
            We use the details you submit only to contact you about your request.
          </small>
        </footer>
      </main>
      <StickyQuoteBar />
    </>
  );
}
