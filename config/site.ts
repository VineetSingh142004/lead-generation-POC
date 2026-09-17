/**
 * SINGLE SOURCE OF TRUTH FOR THE WHOLE SITE.
 *
 * Manager feedback, slide 5: "Adjust per Company's product offerings."
 * Meeting 3: "...places where you can put the copy and places for the images.
 *             Blocks for content, blocks for images... for the particular website."
 *
 * To stand this template up for a different business, edit THIS FILE ONLY.
 * Nothing else in the codebase hard-codes a business name, a service, or a phone number.
 */

export type Service = {
  /** Stable key stored in the database. Changing it breaks existing rows — add a new one instead. */
  id: string;
  /** Display name, also the value written to the leads table. */
  name: string;
  /** One-line description shown on the card. */
  copy: string;
  /**
   * Material treatment for the generated finish plate (see components/finish-plate.tsx).
   * These are honest abstract swatches, NOT stock photos — a swatch cannot contradict its
   * own label the way the old Unsplash images did (slide 2: "Label is garage, but seeing Living Room").
   * Swap `photo` in for the installer's own project photography before launch.
   */
  finish: "flake" | "metallic" | "quartz";
  /** Optional: path to a real project photo under /public. Overrides the generated plate. */
  photo?: string;
  photoAlt?: string;
};

/**
 * THREE services — meeting 4: "there are a lot of products... we should limit them to like three."
 *
 * Selection is driven by the manager's colour coding on slide 3
 * ("Notes: Too many to add. Let's start with the Green ones"):
 *   - Garage & Driveway  <- blue cluster (garage floors, basement/workshop, driveways & patios)
 *   - Countertops & Bar Tops <- GREEN x2 (residential countertops + restaurant bar tops, merged)
 *   - Retail & Restaurant Flooring <- GREEN
 * Parked for v2: bathtub & tile refinishing (GREEN, 4th).
 */
export const services: Service[] = [
  {
    id: "garage-driveway",
    name: "Garage & Driveway Coatings",
    copy: "Sealed, stain-resistant floors for garages, basements, workshops and driveways.",
    finish: "flake",
  },
  {
    id: "countertops-bartops",
    name: "Countertops & Bar Tops",
    copy: "Seamless poured surfaces for kitchens, bathrooms, cafes and bars.",
    finish: "metallic",
  },
  {
    id: "retail-restaurant",
    name: "Retail & Restaurant Flooring",
    copy: "Hard-wearing, easy-to-clean floors built for constant foot traffic and spills.",
    finish: "quartz",
  },
];

/** Service names, derived. Used by validation on both client and server. */
export const serviceNames = services.map((s) => s.name);

export const site = {
  /** TODO before launch: replace with the client's approved business details. */
  businessName: "Epoxy Atelier",
  /** Rendered as two words in the wordmark; second word takes the accent colour. */
  wordmark: ["EPOXY", "ATELIER"],
  tagline: "Professional flooring. Built around your space.",
  metaTitle: "Epoxy Atelier | Premium Epoxy Flooring",
  metaDescription:
    "Professional epoxy flooring for garages, countertops and commercial spaces. Tell us about your project and we'll call you back.",

  hero: {
    eyebrow: "Premium epoxy flooring, made for your space",
    headline: "Concrete,",
    headlineAccent: "reconsidered.",
    lede:
      "Professional epoxy flooring for garages, countertops, and everywhere a better surface changes the room.",
  },

  statement: "A floor is the largest finish in a room. Make it a considered one.",

  benefits: [
    { title: "Durable", detail: "Built for demanding everyday use." },
    { title: "Easy to maintain", detail: "A smooth surface that is simple to clean." },
    { title: "Professional finish", detail: "Clean, modern, and made for the room." },
  ],

  quote: {
    heading: "Let's talk about",
    headingAccent: "your floor.",
    intro: "Tell us a little about the project. Our team will contact you to discuss the next step.",
    /** Shown after a successful submit. Requirements PDF, section 5. */
    successHeading: "Thank you — you're all set.",
    successBody:
      "We've received your information. Someone from our team will contact you soon.",
  },
} as const;
