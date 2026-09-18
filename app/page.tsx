import Image from "next/image";
import { getContent } from "@/lib/content-store";
import { HeroStage } from "@/components/hero-stage";
import { QuoteForm } from "@/components/quote-form";
import { Reveal } from "@/components/reveal";
import { ServicePickButton } from "@/components/service-picker";
import { SiteHeader } from "@/components/site-header";
import { StickyQuoteBar } from "@/components/sticky-quote-bar";

/**
 * Server component. Every string and photo comes from the content store, which falls
 * back to DEFAULT_CONTENT when no database is configured — so this page renders fully
 * whether or not Supabase exists, and /admin edits appear here without a redeploy.
 */

// Content is operator-editable, so don't bake it into a static build.
export const revalidate = 60;

const PROCESS = [
  { step: "01", title: "You call, or fill the form", detail: "Four details. We come back the same day where we can." },
  { step: "02", title: "We look at the slab", detail: "Moisture, cracks and contamination decide the system. No guessing from photos." },
  { step: "03", title: "Grind, pour, finish", detail: "Diamond prep, then the coat build. Most homes are back in use inside a week." },
];

export default async function Home() {
  const content = await getContent();
  const { hero, contact, services, gallery, benefits, quote } = content;

  return (
    <>
      <SiteHeader wordmark={content.wordmark} phone={contact.phone} />

      <main id="top">
        {/* ---------- hero ---------- */}
        <section className="hero">
          <div className="shell hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1>
                {hero.headline}
                <br />
                <em>{hero.headlineAccent}</em>
              </h1>
              <p className="lede">{hero.lede}</p>
              <div className="hero-actions">
                <a className="button gold" href="#quote">Get a free quote</a>
                <a className="button ghost" href="#work">See the work</a>
              </div>
              <dl className="hero-facts">
                <div><dt>Service area</dt><dd>{contact.serviceArea}</dd></div>
                <div><dt>Call direct</dt><dd><a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a></dd></div>
              </dl>
            </div>
            <div className="hero-visual">
              <HeroStage />
              <p className="hero-visual-note"><span>Mirror finish</span><span>Poured, not tiled</span></p>
            </div>
          </div>
        </section>

        {/* ---------- statement ---------- */}
        <section className="statement-band">
          <div className="shell">
            <Reveal>
              <p className="statement">{content.statement}</p>
            </Reveal>
          </div>
        </section>

        {/* ---------- services ---------- */}
        <section id="services" className="services">
          <div className="shell">
            <Reveal>
              <div className="section-head">
                <div>
                  <p className="eyebrow">What we pour</p>
                  <h2>Three things,<br /><em>done properly.</em></h2>
                </div>
                <p className="section-note">Pick the closest match. We&rsquo;ll work out the detail on the call.</p>
              </div>
            </Reveal>

            <div className="service-list">
              {services.map((service, i) => (
                <Reveal as="article" key={service.id} delay={i * 90}>
                  <div className="service-card">
                    <div className="service-media">
                      <Image
                        src={service.photo.src}
                        alt={service.photo.alt}
                        width={1024}
                        height={768}
                        sizes="(max-width: 860px) 100vw, 33vw"
                        priority={i === 0}
                      />
                      <span className="service-index">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="service-info">
                      <h3>{service.name}</h3>
                      <p>{service.copy}</p>
                      <ServicePickButton service={service.name} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- work ---------- */}
        <section id="work" className="work">
          <div className="shell">
            <Reveal>
              <div className="section-head compact">
                <div>
                  <p className="eyebrow">Recent finishes</p>
                  <h2>Floors we&rsquo;d<br /><em>put our name on.</em></h2>
                </div>
              </div>
            </Reveal>
            <div className="gallery">
              {gallery.map((item, i) => (
                <Reveal as="figure" key={item.photo.src} delay={(i % 3) * 80} className={`gal gal-${(i % 6) + 1}`}>
                  <div className="gal-media">
                    <Image
                      src={item.photo.src}
                      alt={item.photo.alt}
                      width={1024}
                      height={768}
                      sizes="(max-width: 860px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                  <figcaption>{item.caption}</figcaption>
                </Reveal>
              ))}
            </div>
            <p className="work-note">
              Reference photography of epoxy installations, used under CC0. These become the
              installer&rsquo;s own project photos before launch — see <a href="/credits">credits</a>.
            </p>
          </div>
        </section>

        {/* ---------- approach ---------- */}
        <section id="approach" className="approach">
          <div className="shell approach-inner">
            <Reveal>
              <div className="approach-copy">
                <p className="eyebrow">How we work</p>
                <h2>The prep is<br />the whole job.</h2>
                <p className="approach-lede">
                  Nearly every failed resin floor failed at the bond, not the surface. That is where
                  our time goes.
                </p>
              </div>
            </Reveal>
            <div className="benefit-list">
              {benefits.map((b, i) => (
                <Reveal key={b.title} delay={i * 80}>
                  <div className="benefit">
                    <b>{String(i + 1).padStart(2, "0")}</b>
                    <div>
                      <h3>{b.title}</h3>
                      <p>{b.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- process ---------- */}
        <section className="process">
          <div className="shell">
            <div className="process-grid">
              {PROCESS.map((p, i) => (
                <Reveal key={p.step} delay={i * 80}>
                  <div className="process-step">
                    <span className="process-num">{p.step}</span>
                    <h3>{p.title}</h3>
                    <p>{p.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- quote ---------- */}
        <section id="quote" className="quote">
          <div className="shell quote-inner">
            <div className="quote-copy">
              <p className="eyebrow">Get a quote</p>
              <h2>{quote.heading}<br /><em>{quote.headingAccent}</em></h2>
              <p className="quote-lede">{quote.intro}</p>
              <div className="quote-direct">
                <span>Would rather talk?</span>
                <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>
              </div>
            </div>
            <QuoteForm
              services={services.map(({ id, name }) => ({ id, name }))}
              copy={quote}
              businessName={content.businessName}
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell">
          <div className="footer-top">
            <a className="brand" href="#top">{content.wordmark[0]}&nbsp;<span>{content.wordmark[1]}</span></a>
            <p className="footer-tagline">{content.tagline}</p>
            <div className="footer-links">
              <a href="#services">Services</a>
              <a href="#work">Work</a>
              <a href="#quote">Get a quote</a>
              <a href="/credits">Credits</a>
            </div>
          </div>
          <div className="footer-bottom">
            <small>
              © {new Date().getFullYear()} {content.businessName}. Placeholder business details —
              to be replaced with the client&rsquo;s approved information before launch.
            </small>
            <small>We use the details you submit only to contact you about your request.</small>
          </div>
        </div>
      </footer>

      <StickyQuoteBar phone={contact.phone} />
    </>
  );
}
