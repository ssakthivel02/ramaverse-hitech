export const RAMAVERSE_VISUAL_UNIVERSE = {
  palette: {
    deepNavy: "#070b14",
    nightBlue: "#101a2a",
    ayodhyaGold: "#d7b45a",
    ramaBlue: "#6ea4c5",
    sacredSaffron: "#e88d4a",
    forestGreen: "#557b63",
    parchment: "#f3e9d2",
  },
  breakpoints: {
    phone: "360-430px",
    tablet: "768-1024px",
    desktop: "1280px+",
    playScreenshot: "1080x1920 portrait contract",
  },
  motion: {
    systems: ["dawn-light", "bow-motif", "sarayu-flow", "forest-transition", "hanuman-journey", "setu-progression", "lanka-reveal", "return-to-ayodhya", "evidence-reveal"],
    implementation: ["CSS", "SVG"],
    autoplayHeavyVideo: false,
    reducedMotionRequired: true,
  },
  assetPolicy: {
    allowed: ["PROJECT_ORIGINAL", "LICENSED"],
    prohibited: ["TV_SERIAL_IMAGERY", "FILM_STILLS", "GOOGLE_IMAGES", "COPYRIGHTED_PAINTINGS", "UNLICENSED_WEBSITE_ART"],
    decorativeAssetsNeedAriaHidden: true,
    visibleMeaningNeedsSemanticText: true,
  },
} as const;
