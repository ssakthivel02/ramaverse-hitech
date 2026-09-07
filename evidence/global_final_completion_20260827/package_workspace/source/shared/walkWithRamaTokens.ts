/**
 * Shared, platform-neutral tokens for the Walk with Rama experience.
 * Mobile consumers may import or reproduce these values; this file does not
 * alter the Mobile application or publish any content.
 */
export const WALK_WITH_RAMA_TOKENS = {
  colors: {
    deepNavy: "#070b14",
    nightBlue: "#101a2a",
    ramaBlue: "#6ea4c5",
    ayodhyaGold: "#d7b45a",
    sacredSaffron: "#e88d4a",
    forestGreen: "#557b63",
    parchment: "#f3e9d2",
  },
  motion: {
    quickMs: 180,
    revealMs: 240,
    reducedMotionMediaQuery: "(prefers-reduced-motion: reduce)",
  },
  interaction: {
    minimumTouchTargetPx: 44,
    audioDefault: "off",
    sourceDisclosure: "required",
    unsupportedOutcomeClaims: "prohibited",
  },
  trustLabels: ["Source", "Evidence", "Tradition", "Confidence"] as const,
} as const;

export type WalkWithRamaTrustLabel = (typeof WALK_WITH_RAMA_TOKENS.trustLabels)[number];
