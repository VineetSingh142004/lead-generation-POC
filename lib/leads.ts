/**
 * Shared lead validation, run by BOTH the client form and the API route so the two can
 * never drift.
 *
 * The allowed service names are passed in rather than imported: services are editable
 * from /admin, so a hardcoded list here would reject every lead the moment an operator
 * renamed a service.
 */

export const LIMITS = { name: 120, phone: 24, address: 200, email: 254 } as const;

export type LeadInput = {
  name: string;
  phone: string;
  address: string;
  service: string;
  email?: string;
  /** Consent to be contacted. Required — see README, "Consent and privacy". */
  consent?: boolean;
};

export type FieldErrors = Partial<Record<keyof LeadInput, string>>;

/**
 * A phone number is valid if it contains at least 7 actual digits and nothing
 * other than digits and common formatting characters.
 *
 * The previous regex /^[+()\-\s\d]{7,24}$/ accepted "-------" and "(((((((" — a lead
 * with an unreachable phone number is worthless, and it is the only field that makes
 * the lead actionable.
 */
const PHONE_SHAPE = /^[+()\-.\s\d]+$/;
export function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}
export function isValidPhone(value: string) {
  if (!PHONE_SHAPE.test(value)) return false;
  const digits = normalizePhone(value);
  return digits.length >= 7 && digits.length <= 15;
}

/** Deliberately permissive — we only need to know it can plausibly receive the confirmation copy. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates and normalizes a lead. Returns trimmed, length-capped values on success.
 * Runs identically in the browser (for inline errors) and on the server (as the real gate).
 */
export function validateLead(
  raw: Partial<Record<keyof LeadInput, unknown>>,
  allowedServices: string[],
): {
  errors: FieldErrors;
  lead: Required<Pick<LeadInput, "name" | "phone" | "address" | "service">> & { email: string | null };
} {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const name = str(raw.name, LIMITS.name);
  const phone = str(raw.phone, LIMITS.phone);
  const address = str(raw.address, LIMITS.address);
  const email = str(raw.email, LIMITS.email);
  const service = typeof raw.service === "string" ? raw.service : "";

  const errors: FieldErrors = {};
  if (!name) errors.name = "Enter your name so we know who to contact.";
  if (!phone) errors.phone = "Enter a phone number so we can call you back.";
  else if (!isValidPhone(phone)) errors.phone = "Enter a valid phone number, including area code.";
  if (!address) errors.address = "Enter your city, region, or service address.";
  if (email && !EMAIL.test(email)) errors.email = "Enter a valid email address, or leave this blank.";
  if (!allowedServices.includes(service)) errors.service = "Choose the service that best fits your project.";
  if (raw.consent !== true) errors.consent = "Please confirm we can contact you about your request.";

  return { errors, lead: { name, phone, address, service, email: email || null } };
}
