"use client";

import { useRef, useState } from "react";
import type { Photo } from "@/lib/content";

/**
 * Picks an image for any slot: upload a new file, or choose one already in the site's
 * library. Alt text sits beside the picker rather than behind a toggle, because a photo
 * saved without it is an accessibility regression that nobody notices until much later.
 */
export function ImageField({
  value,
  onChange,
  library,
  storageReady,
  label = "Photo",
}: {
  value: Photo;
  onChange: (photo: Photo) => void;
  library: Photo[];
  storageReady: boolean;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange({ ...value, src: data.url });
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="image-field">
      <span className="label-text">{label}</span>

      <div className="image-field-row">
        <div className="image-preview">
          {/* Sources are user-supplied at runtime, so a plain img avoids having to
              whitelist every possible storage host in next.config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value.src ? <img src={value.src} alt="" /> : <span className="image-empty">No image</span>}
        </div>

        <div className="image-field-actions">
          <button type="button" className="btn" onClick={() => fileRef.current?.click()} disabled={busy || !storageReady}>
            {busy ? "Uploading…" : "Upload"}
          </button>
          <button type="button" className="btn" onClick={() => setPicking((p) => !p)}>
            {picking ? "Close library" : "Library"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
          />
        </div>
      </div>

      {!storageReady && (
        <p className="field-hint">Uploads need Supabase configured. You can still pick from the library.</p>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}

      {picking && (
        <div className="image-library">
          {library.map((p) => (
            <button
              key={p.src}
              type="button"
              className={`image-chip${p.src === value.src ? " is-current" : ""}`}
              onClick={() => { onChange({ src: p.src, alt: value.alt || p.alt }); setPicking(false); }}
              title={p.alt}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" />
            </button>
          ))}
        </div>
      )}

      <label className="alt-field">
        <span className="label-text">Alt text <span className="required-mark">*</span></span>
        <input
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Describe what is actually in the photo"
        />
      </label>
    </div>
  );
}
