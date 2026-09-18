import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/content-store";
import type { SiteContent } from "@/lib/content";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ content: await getContent() });
}

/** Rejects anything that would render the public page structurally broken. */
function validate(c: Partial<SiteContent>): string | null {
  if (!c || typeof c !== "object") return "Malformed content.";
  if (!c.businessName?.trim()) return "Business name cannot be empty.";
  if (!Array.isArray(c.services) || c.services.length === 0) return "At least one service is required.";
  if (c.services.length > 6) return "Six services is the maximum this layout supports.";
  for (const s of c.services) {
    if (!s.id?.trim()) return "Every service needs an id.";
    if (!s.name?.trim()) return "Every service needs a name.";
    if (!s.photo?.src?.trim()) return `"${s.name}" is missing a photo.`;
    if (!s.photo?.alt?.trim()) return `"${s.name}" is missing alt text for its photo.`;
  }
  const ids = c.services.map((s) => s.id);
  if (new Set(ids).size !== ids.length) return "Two services share the same id.";
  for (const g of c.gallery ?? []) {
    if (!g.photo?.src?.trim()) return "A gallery item is missing its photo.";
    if (!g.photo?.alt?.trim()) return "Every gallery photo needs alt text.";
  }
  return null;
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let incoming: SiteContent;
  try {
    incoming = (await request.json()).content;
  } catch {
    return NextResponse.json({ error: "We couldn't read that request." }, { status: 400 });
  }

  const problem = validate(incoming);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const result = await saveContent(incoming);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 503 });
  return NextResponse.json({ ok: true });
}
