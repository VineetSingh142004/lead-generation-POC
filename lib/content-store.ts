import "server-only";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/content";
import { serviceClient } from "@/lib/supabase";

/**
 * Reads and writes the editable site content.
 *
 * Storage is a single jsonb row in `site_content`. Reads always fall back to
 * DEFAULT_CONTENT, so the public site renders correctly with no database, with an empty
 * table, or if Supabase is briefly unreachable — a marketing page going blank because a
 * CMS call failed is a far worse outcome than serving slightly stale copy.
 */

const ROW_ID = "default";

/** Shallow-merges stored content over the defaults so a partial row cannot blank a section. */
function merge(stored: Partial<SiteContent> | null | undefined): SiteContent {
  if (!stored) return DEFAULT_CONTENT;
  return {
    ...DEFAULT_CONTENT,
    ...stored,
    contact: { ...DEFAULT_CONTENT.contact, ...(stored.contact ?? {}) },
    hero: { ...DEFAULT_CONTENT.hero, ...(stored.hero ?? {}) },
    quote: { ...DEFAULT_CONTENT.quote, ...(stored.quote ?? {}) },
    services: stored.services?.length ? stored.services : DEFAULT_CONTENT.services,
    gallery: stored.gallery?.length ? stored.gallery : DEFAULT_CONTENT.gallery,
    benefits: stored.benefits?.length ? stored.benefits : DEFAULT_CONTENT.benefits,
  };
}

export async function getContent(): Promise<SiteContent> {
  const supabase = serviceClient();
  if (!supabase) return DEFAULT_CONTENT;
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) {
      console.error("[content] read failed, serving defaults", { message: error.message, code: error.code });
      return DEFAULT_CONTENT;
    }
    return merge(data?.data as Partial<SiteContent> | undefined);
  } catch (error) {
    console.error("[content] unexpected read error, serving defaults", error);
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<{ ok: boolean; error?: string }> {
  const supabase = serviceClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured, so changes cannot be saved yet." };
  const { error } = await supabase
    .from("site_content")
    .upsert({ id: ROW_ID, data: content, updated_at: new Date().toISOString() });
  if (error) {
    console.error("[content] save failed", { message: error.message, code: error.code });
    return { ok: false, error: error.message };
  }
  console.info("[content] saved");
  return { ok: true };
}
