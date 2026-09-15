import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { AdminDashboard } from "./workspace";
import "./admin.css";

export const dynamic = "force-dynamic";

export type Lead = { id: string; created_at: string; name: string; email: string | null; phone: string; address: string; service: string; status: string };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const supabase = getSupabaseAdmin();
  let leads: Lead[] = [];
  let connectionError = "";
  if (!supabase) connectionError = "Connect Supabase to view live leads.";
  else {
    const { data, error } = await supabase.from("leads").select("id, created_at, name, email, phone, address, service, status").order("created_at", { ascending: false });
    if (error) connectionError = "The dashboard could not load leads. Check the Supabase table setup.";
    else leads = data as Lead[];
  }
  return <AdminDashboard initialLeads={leads} connectionError={connectionError} />;
}
