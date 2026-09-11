import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const services = ["Home / Garage Epoxy", "Commercial / Factory Epoxy", "Other Epoxy Flooring"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const service = typeof body.service === "string" ? body.service : "";
    if (!name || !address || !services.includes(service) || !/^[+()\-\s\d]{7,24}$/.test(phone)) {
      return NextResponse.json({ error: "Please complete each field with valid information." }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: "Lead storage has not been configured yet." }, { status: 503 });
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("leads").insert({ name, phone, address, service, status: "new" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn't send that request. Please try again." }, { status: 500 });
  }
}
