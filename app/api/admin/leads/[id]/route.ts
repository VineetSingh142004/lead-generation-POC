import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const statuses = ["pending", "active", "responded", "closed"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { status } = await request.json();
  if (!statuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { id } = await params;
  const { data, error } = await supabase.from("leads").update({ status }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Unable to update this lead." }, { status: 500 });
  return NextResponse.json({ lead: data });
}
