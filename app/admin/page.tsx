import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getContent } from "@/lib/content-store";
import { PHOTO_CREDITS } from "@/lib/content";
import { isConfigured } from "@/lib/supabase";
import { Editor } from "@/components/admin/editor";

export const metadata = { title: "Site admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const content = await getContent();
  const library = PHOTO_CREDITS.map((p) => ({ src: p.file, alt: p.alt }));

  return <Editor initial={content} library={library} storageReady={isConfigured()} />;
}
