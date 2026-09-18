"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Photo, SiteContent } from "@/lib/content";
import { ImageField } from "@/components/admin/image-field";

type Tab = "brand" | "hero" | "services" | "gallery" | "approach" | "quote";

const TABS: { id: Tab; label: string }[] = [
  { id: "brand", label: "Brand & contact" },
  { id: "hero", label: "Hero" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "approach", label: "Approach" },
  { id: "quote", label: "Quote form" },
];

/**
 * The site editor.
 *
 * Holds the whole SiteContent object in local state and PUTs it as one document, so a
 * save is atomic — there is no window in which the live site shows half of an edit.
 * Everything here maps one-to-one onto what the public page renders.
 */
export function Editor({
  initial,
  library,
  storageReady,
}: {
  initial: SiteContent;
  library: Photo[];
  storageReady: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("brand");
  const [content, setContent] = useState<SiteContent>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirty = useMemo(() => JSON.stringify(content) !== JSON.stringify(initial), [content, initial]);

  // Don't let a stray tab close throw away unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = useCallback(<K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setContent((c) => ({ ...c, [key]: value }));
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Save failed." });
        return;
      }
      setMessage({ kind: "ok", text: "Saved. The live site will pick this up within a minute." });
      router.refresh();
    } catch {
      setMessage({ kind: "err", text: "Could not reach the server." });
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar-left">
          <strong>Site admin</strong>
          <span className={`admin-dot${dirty ? " is-dirty" : ""}`} aria-hidden="true" />
          <span className="admin-state">{dirty ? "Unsaved changes" : "All changes saved"}</span>
        </div>
        <div className="admin-bar-right">
          <a className="btn" href="/" target="_blank" rel="noreferrer">View site</a>
          <button className="btn" onClick={signOut} type="button">Sign out</button>
          <button className="btn primary" onClick={save} disabled={saving || !dirty} type="button">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      {!storageReady && (
        <p className="admin-warn admin-banner">
          Supabase is not configured on this deployment, so changes cannot be saved yet. Set
          <code> NEXT_PUBLIC_SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>, and apply
          <code> supabase/schema.sql</code>.
        </p>
      )}
      {message && <p className={`admin-banner ${message.kind === "ok" ? "admin-ok" : "admin-warn"}`} role="status">{message.text}</p>}

      <nav className="admin-tabs" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="admin-body">
        {tab === "brand" && (
          <section className="admin-section">
            <h2>Brand &amp; contact</h2>
            <Text label="Business name" value={content.businessName} onChange={(v) => set("businessName", v)} />
            <div className="pair">
              <Text label="Wordmark, first word" value={content.wordmark[0]}
                onChange={(v) => set("wordmark", [v, content.wordmark[1]])} />
              <Text label="Wordmark, second word" value={content.wordmark[1]}
                onChange={(v) => set("wordmark", [content.wordmark[0], v])} />
            </div>
            <Text label="Tagline" value={content.tagline} onChange={(v) => set("tagline", v)} />
            <div className="pair">
              <Text label="Phone" value={content.contact.phone}
                onChange={(v) => set("contact", { ...content.contact, phone: v })} />
              <Text label="Email" value={content.contact.email}
                onChange={(v) => set("contact", { ...content.contact, email: v })} />
            </div>
            <Text label="Service area" value={content.contact.serviceArea}
              onChange={(v) => set("contact", { ...content.contact, serviceArea: v })} />
            <h3>Search listing</h3>
            <Text label="Page title" value={content.metaTitle} onChange={(v) => set("metaTitle", v)} />
            <Area label="Meta description" value={content.metaDescription} onChange={(v) => set("metaDescription", v)} />
          </section>
        )}

        {tab === "hero" && (
          <section className="admin-section">
            <h2>Hero</h2>
            <Text label="Eyebrow" value={content.hero.eyebrow} onChange={(v) => set("hero", { ...content.hero, eyebrow: v })} />
            <div className="pair">
              <Text label="Headline" value={content.hero.headline} onChange={(v) => set("hero", { ...content.hero, headline: v })} />
              <Text label="Headline, italic line" value={content.hero.headlineAccent} onChange={(v) => set("hero", { ...content.hero, headlineAccent: v })} />
            </div>
            <Area label="Intro paragraph" value={content.hero.lede} onChange={(v) => set("hero", { ...content.hero, lede: v })} />
            <p className="field-hint">The hero visual is a rendered 3D scene, so it has no photo to set. The photo below is kept for reuse elsewhere.</p>
            <ImageField label="Stored hero photo" value={content.hero.photo} library={library} storageReady={storageReady}
              onChange={(photo) => set("hero", { ...content.hero, photo })} />
            <h3>Statement band</h3>
            <Area label="Statement" value={content.statement} onChange={(v) => set("statement", v)} />
          </section>
        )}

        {tab === "services" && (
          <section className="admin-section">
            <h2>Services</h2>
            <p className="field-hint">
              Three works best in this layout. The <code>id</code> is written onto every lead — rename
              freely, but changing an id breaks the link to leads already captured.
            </p>
            {content.services.map((service, i) => (
              <div className="admin-item" key={i}>
                <div className="admin-item-head">
                  <strong>Service {i + 1}</strong>
                  <div className="admin-item-actions">
                    <button type="button" className="btn" disabled={i === 0}
                      onClick={() => set("services", move(content.services, i, i - 1))}>↑</button>
                    <button type="button" className="btn" disabled={i === content.services.length - 1}
                      onClick={() => set("services", move(content.services, i, i + 1))}>↓</button>
                    <button type="button" className="btn danger" disabled={content.services.length <= 1}
                      onClick={() => set("services", content.services.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                </div>
                <div className="pair">
                  <Text label="Name" value={service.name}
                    onChange={(v) => set("services", replace(content.services, i, { ...service, name: v }))} />
                  <Text label="Id (stored on leads)" value={service.id}
                    onChange={(v) => set("services", replace(content.services, i, { ...service, id: v }))} />
                </div>
                <Area label="Description" value={service.copy}
                  onChange={(v) => set("services", replace(content.services, i, { ...service, copy: v }))} />
                <ImageField value={service.photo} library={library} storageReady={storageReady}
                  onChange={(photo) => set("services", replace(content.services, i, { ...service, photo }))} />
              </div>
            ))}
            {content.services.length < 6 && (
              <button type="button" className="btn" onClick={() => set("services", [...content.services, {
                id: `service-${content.services.length + 1}`, name: "New service", copy: "",
                photo: library[0] ?? { src: "", alt: "" },
              }])}>Add service</button>
            )}
          </section>
        )}

        {tab === "gallery" && (
          <section className="admin-section">
            <h2>Gallery</h2>
            {content.gallery.map((item, i) => (
              <div className="admin-item" key={i}>
                <div className="admin-item-head">
                  <strong>Image {i + 1}</strong>
                  <div className="admin-item-actions">
                    <button type="button" className="btn" disabled={i === 0}
                      onClick={() => set("gallery", move(content.gallery, i, i - 1))}>↑</button>
                    <button type="button" className="btn" disabled={i === content.gallery.length - 1}
                      onClick={() => set("gallery", move(content.gallery, i, i + 1))}>↓</button>
                    <button type="button" className="btn danger"
                      onClick={() => set("gallery", content.gallery.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                </div>
                <Text label="Caption" value={item.caption}
                  onChange={(v) => set("gallery", replace(content.gallery, i, { ...item, caption: v }))} />
                <ImageField value={item.photo} library={library} storageReady={storageReady}
                  onChange={(photo) => set("gallery", replace(content.gallery, i, { ...item, photo }))} />
              </div>
            ))}
            <button type="button" className="btn" onClick={() => set("gallery", [...content.gallery, {
              caption: "", photo: library[0] ?? { src: "", alt: "" },
            }])}>Add image</button>
          </section>
        )}

        {tab === "approach" && (
          <section className="admin-section">
            <h2>Approach</h2>
            {content.benefits.map((b, i) => (
              <div className="admin-item" key={i}>
                <div className="admin-item-head">
                  <strong>Point {i + 1}</strong>
                  <div className="admin-item-actions">
                    <button type="button" className="btn danger" disabled={content.benefits.length <= 1}
                      onClick={() => set("benefits", content.benefits.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                </div>
                <Text label="Title" value={b.title}
                  onChange={(v) => set("benefits", replace(content.benefits, i, { ...b, title: v }))} />
                <Area label="Detail" value={b.detail}
                  onChange={(v) => set("benefits", replace(content.benefits, i, { ...b, detail: v }))} />
              </div>
            ))}
            {content.benefits.length < 5 && (
              <button type="button" className="btn"
                onClick={() => set("benefits", [...content.benefits, { title: "", detail: "" }])}>Add point</button>
            )}
          </section>
        )}

        {tab === "quote" && (
          <section className="admin-section">
            <h2>Quote section</h2>
            <div className="pair">
              <Text label="Heading" value={content.quote.heading} onChange={(v) => set("quote", { ...content.quote, heading: v })} />
              <Text label="Heading, italic line" value={content.quote.headingAccent} onChange={(v) => set("quote", { ...content.quote, headingAccent: v })} />
            </div>
            <Area label="Intro" value={content.quote.intro} onChange={(v) => set("quote", { ...content.quote, intro: v })} />
            <h3>After submitting</h3>
            <Text label="Confirmation heading" value={content.quote.successHeading} onChange={(v) => set("quote", { ...content.quote, successHeading: v })} />
            <Area label="Confirmation message" value={content.quote.successBody} onChange={(v) => set("quote", { ...content.quote, successBody: v })} />
          </section>
        )}
      </div>
    </div>
  );
}

function replace<T>(list: T[], index: number, item: T): T[] {
  return list.map((x, i) => (i === index ? item : x));
}
function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="admin-field">
      <span className="label-text">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="admin-field">
      <span className="label-text">{label}</span>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
