import type { Service } from "@/config/site";

/**
 * Generated material swatch for a service card.
 *
 * Manager feedback, slide 2: "Pictures are not matching the description:
 *                             Label is garage, but seeing Living Room"
 *
 * That bug was structural: the cards pointed at hot-linked Unsplash IDs whose actual
 * contents nobody could verify from the code. A generated swatch cannot contradict its
 * own label, loads instantly, needs no third party, and reads as an honest material
 * sample rather than a stock photo pretending to be this installer's work.
 *
 * When the installer supplies real project photography, set `photo` on the service in
 * config/site.ts and it takes over — the swatch is the default, not a permanent choice.
 */

/** Deterministic PRNG so server and client render byte-identical markup. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const PALETTES = {
  // Sealed garage floor: charcoal base scattered with decorative flake.
  flake: { base: "#3c3a37", deep: "#26241f", chips: ["#cbbfa8", "#8f8677", "#e4ddd0", "#6e6559"] },
  // Poured metallic countertop: pigment swirl through a resin pour.
  metallic: { base: "#4a4136", deep: "#2b251d", chips: ["#d9bd8a", "#a8875a", "#efe2c9", "#7d6644"] },
  // Quartz-broadcast commercial floor: dense fine aggregate.
  quartz: { base: "#46433e", deep: "#2d2a26", chips: ["#d6d0c4", "#a49c8d", "#efeae0", "#7a7367"] },
} as const;

export function FinishPlate({ service, priority = false }: { service: Service; priority?: boolean }) {
  if (service.photo) {
    // eslint-disable-next-line @next/next/no-img-element -- fill-style decorative plate, sized by CSS
    return (
      <img
        className="finish-plate"
        src={service.photo}
        alt={service.photoAlt ?? service.name}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  const palette = PALETTES[service.finish];
  const random = seeded(hashSeed(service.id));
  const id = `fp-${service.id}`;

  // Flake density differs per finish — quartz broadcast is much denser than garage flake.
  const count = service.finish === "quartz" ? 320 : service.finish === "flake" ? 150 : 70;
  const chips = Array.from({ length: count }, (_, i) => {
    const size = service.finish === "quartz" ? 0.9 + random() * 1.6 : 1.6 + random() * 4.2;
    return {
      key: i,
      x: random() * 400,
      y: random() * 300,
      rx: size,
      ry: size * (0.45 + random() * 0.5),
      rotate: random() * 180,
      fill: palette.chips[Math.floor(random() * palette.chips.length)],
      opacity: 0.35 + random() * 0.5,
    };
  });

  return (
    <svg
      className="finish-plate"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${service.name} — ${service.finish} finish sample`}
    >
      <defs>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.base} />
          <stop offset="100%" stopColor={palette.deep} />
        </linearGradient>
        {/* Wet-look sheen across the plate, matching the polished finish of a real pour. */}
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="20%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="48%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill={`url(#${id}-base)`} />

      {service.finish === "metallic" && (
        // Pigment swirl unique to a metallic pour.
        <g opacity="0.5">
          <path d="M-20 210 C 90 150, 150 250, 250 175 S 380 95, 430 130" stroke={palette.chips[2]} strokeWidth="26" fill="none" opacity="0.32" />
          <path d="M-20 150 C 100 210, 180 110, 270 160 S 390 210, 430 170" stroke={palette.chips[1]} strokeWidth="18" fill="none" opacity="0.4" />
        </g>
      )}

      <g>
        {chips.map((chip) => (
          <ellipse
            key={chip.key}
            cx={chip.x}
            cy={chip.y}
            rx={chip.rx}
            ry={chip.ry}
            fill={chip.fill}
            opacity={chip.opacity}
            transform={`rotate(${chip.rotate} ${chip.x} ${chip.y})`}
          />
        ))}
      </g>

      <rect width="400" height="300" fill={`url(#${id}-sheen)`} />
    </svg>
  );
}
