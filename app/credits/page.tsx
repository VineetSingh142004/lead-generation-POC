import Link from "next/link";
import { PHOTO_CREDITS } from "@/lib/content";

export const metadata = { title: "Photo credits", robots: { index: false, follow: true } };

/**
 * Every photograph on the site, with its licence and source.
 *
 * All are CC0 (public domain dedication), so attribution is not legally required — it is
 * here because saying where a picture came from costs nothing and settles the question.
 */
export default function CreditsPage() {
  return (
    <main className="legal">
      <div className="shell">
        <p className="eyebrow">Credits</p>
        <h1>Photography</h1>
        <p className="legal-lede">
          Reference photography of real epoxy installations, every image released under CC0.
          Each was reviewed before use to confirm it shows what its caption claims. These are
          placeholders — they will be replaced with the installer&rsquo;s own project
          photography before launch.
        </p>
        <ul className="credit-list">
          {PHOTO_CREDITS.map((c) => (
            <li key={c.file}>
              <strong>{c.title || c.file}</strong>
              <span>{c.alt}</span>
              <span className="credit-meta">
                Licence: {String(c.license).toUpperCase()}
                {c.creator ? ` · ${c.creator}` : ""}
                {c.source ? ` · via ${c.source}` : ""}
                {c.page ? <> · <a href={c.page} rel="noreferrer nofollow" target="_blank">source</a></> : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="legal-back"><Link href="/">← Back to the site</Link></p>
      </div>
    </main>
  );
}
