import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { serviceClient } from "@/lib/supabase";

/**
 * Image upload for the admin editor.
 *
 * Files go to the public `site-photos` Supabase Storage bucket (see supabase/schema.sql
 * for the one-time setup). Serverless filesystems are read-only, so writing into
 * /public at runtime is not an option — object storage is the only route that survives
 * a deploy.
 */

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const supabase = serviceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured, so uploads are unavailable." },
      { status: 503 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const candidate = form.get("file");
    if (candidate instanceof File) file = candidate;
  } catch {
    return NextResponse.json({ error: "We couldn't read that upload." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file was attached." }, { status: 400 });

  // Trust the sniffed type, not the filename.
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Upload a JPEG, PNG, WebP or AVIF image." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That image is larger than 6 MB. Please resize it first." }, { status: 413 });
  }

  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("site-photos")
    .upload(key, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });

  if (error) {
    console.error("[admin] upload failed", { message: error.message });
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 502 });
  }

  const { data } = supabase.storage.from("site-photos").getPublicUrl(key);
  console.info("[admin] uploaded", { key });
  return NextResponse.json({ url: data.publicUrl });
}
