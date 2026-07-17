// mm:2940:14174 (B.7_Spotlight) — single floating sunner-name tag, absolutely
// positioned within the spotlight board panel per its Figma coordinates.

import type { SpotlightNameParticle } from "./spotlight-name-particles-data";

const MONTSERRAT = "var(--font-montserrat)";

export function SpotlightNameParticleTag({ name, x, y, size }: SpotlightNameParticle) {
  return (
    <span
      className="pointer-events-none absolute whitespace-nowrap text-center text-white/90"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontFamily: MONTSERRAT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: "0.1px",
      }}
    >
      {name}
    </span>
  );
}
