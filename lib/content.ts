import photoManifest from "@/public/photos/manifest.json";

/**
 * THE SITE'S CONTENT MODEL.
 *
 * Everything an operator can change from /admin lives in this one shape. The public
 * page renders from it, the admin editor writes to it, and `DEFAULT_CONTENT` below is
 * the fallback whenever the database is unreachable or empty — so the marketing site
 * never renders blank, even with no Supabase configured at all.
 *
 * Manager brief, slide 5: "Adjust per Company's product offerings."
 * Meeting 3: "blocks for content, blocks for images... for the particular website."
 */

export type Photo = { src: string; alt: string };

export type ServiceItem = {
  /** Stable key stored on the lead row. Renaming `name` is safe; changing `id` is not. */
  id: string;
  name: string;
  copy: string;
  photo: Photo;
};

export type GalleryItem = { photo: Photo; caption: string };

export type SiteContent = {
  businessName: string;
  wordmark: [string, string];
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  contact: { phone: string; email: string; serviceArea: string };
  hero: { eyebrow: string; headline: string; headlineAccent: string; lede: string; photo: Photo };
  statement: string;
  services: ServiceItem[];
  gallery: GalleryItem[];
  benefits: { title: string; detail: string }[];
  quote: { heading: string; headingAccent: string; intro: string; successHeading: string; successBody: string };
};

/** Alt text comes from the verified photo manifest so a caption cannot drift from its image. */
const photo = (name: string): Photo => {
  const entry = photoManifest.find((p) => p.file === `/photos/${name}.jpg`);
  if (!entry) throw new Error(`Unknown photo: ${name}`);
  return { src: entry.file, alt: entry.alt };
};

export const DEFAULT_CONTENT: SiteContent = {
  businessName: "Epoxy Atelier",
  wordmark: ["EPOXY", "ATELIER"],
  tagline: "Resin floors and poured surfaces, installed properly.",
  metaTitle: "Epoxy Atelier | Resin Floors & Poured Surfaces",
  metaDescription:
    "Flake garage floors, poured resin counters and seamless commercial flooring. Tell us about the space and we will call you back.",
  contact: {
    // TODO before launch: replace with the client's approved details.
    phone: "(000) 000-0000",
    email: "hello@example.com",
    serviceArea: "Placeholder service area",
  },
  hero: {
    eyebrow: "Resin floors & poured surfaces",
    headline: "Concrete,",
    headlineAccent: "reconsidered.",
    lede:
      "A floor is the largest single surface in any room. We pour, grind and finish it so it outlasts everything you put on it.",
    photo: photo("hero-metallic"),
  },
  statement:
    "Most floors are chosen last and noticed first. We would rather you got that decision right.",
  /**
   * Three services — meeting 4: "we should limit them to like three."
   * Selected from the manager's slide-3 colour coding ("start with the Green ones"):
   * garage/driveway from the blue cluster, countertops and retail/restaurant from green.
   */
  services: [
    {
      id: "garage-driveway",
      name: "Garage & Driveway",
      copy:
        "Full-flake or solid-colour coatings over ground and sealed concrete. Resists oil, salt and hot tyres, and washes down with a hose.",
      photo: photo("svc-garage"),
    },
    {
      id: "countertops-bartops",
      name: "Counters & Bar Tops",
      copy:
        "Poured resin surfaces for kitchens, bathrooms and back bars. Seamless, non-porous and finished to the sheen you pick.",
      photo: photo("svc-bartop"),
    },
    {
      id: "retail-restaurant",
      name: "Retail & Restaurant",
      copy:
        "Hard-wearing seamless floors for rooms that take constant traffic. No grout lines, nowhere for spills to sit.",
      photo: photo("svc-retail"),
    },
  ],
  gallery: [
    { photo: photo("gal-flake-macro"), caption: "Flake broadcast, cove detail" },
    { photo: photo("gal-garage-open"), caption: "Residential garage, grey flake" },
    { photo: photo("gal-blue-flake"), caption: "Blue flake, full broadcast" },
    { photo: photo("gal-gloss-basement"), caption: "High-gloss seamless pour" },
    { photo: photo("gal-warm-flake"), caption: "Garage flake, timber surround" },
    { photo: photo("gal-countertop-pour"), caption: "Metallic counter, mid-pour" },
  ],
  benefits: [
    { title: "Ground, not painted", detail: "We diamond-grind the slab first. Coatings fail at the bond, and that is where it is won." },
    { title: "One surface, no seams", detail: "Nothing to trap grease or water, and nothing to lift at an edge." },
    { title: "Back in use quickly", detail: "Most residential floors are walk-on next day and park-on inside the week." },
  ],
  quote: {
    heading: "Tell us about",
    headingAccent: "the space.",
    intro:
      "Four details is all we need to give you a number. We call back the same day wherever we can.",
    successHeading: "Got it — thank you.",
    successBody: "We have your details and someone from the team will call you shortly.",
  },
};

/** Photo credits, surfaced at /credits. All images are CC0, verified before use. */
export const PHOTO_CREDITS = photoManifest;
