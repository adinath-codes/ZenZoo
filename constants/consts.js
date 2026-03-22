// =============================================================================
// 2. CONFIGURATION & THEME
// =============================================================================
// =============================================================================
//  Constants
// =============================================================================
const Quotes = [
  "Stay strong",
  "Keep going",
  "Dream big",
  "Be kind",
  "Work hard",
  "Stay humble",
  "Trust you",
  "Think smart",
  "Move fast",
  "Stay sharp",
];
const Reminders = [
  "Drink water",
  "Call mom",
  "Take break",
  "Stretch now",
  "Sleep well",
  "Read 10m",
  "Walk 5m",
  "Smile :)",
  "Plan day",
  "Save money",
];
const RandomJokes = [
  "I debug, therefore I am.",
  "My code works… why?",
  "It works on my machine.",
  "AI said: try again.",
  "I fixed it. Don't ask.",
  "Bug found. Feature now.",
  "Semicolon saved my life.",
  "Coffee > production bugs.",
  "Git blame saves careers.",
  "I code. I cry. Repeat.",
];

// ── WIDGET SIZE CONSTANTS ─────────────────────────────────────────────────────
// Nothing Phone 4×2 widget target:
//   matrix width  = GRID_W × (DOT_SIZE + DOT_GAP) = 32 × 3.6 ≈ 115 dp
//   matrix height = GRID_H × (DOT_SIZE + DOT_GAP) = 25 × 3.6 ≈  90 dp
const GRID_W = 35;
const GRID_H = 30;
const DOT_SIZE = 4.0; // ↓ was 5.5
const DOT_GAP = 0.6; // ↓ was 1.8

const THEME = {
  bg: "#000000",
  panel: "#111111",
  dotInactive: "#1A1A1A",
  dotActive: "#FFFFFF",
  dotDim: "#444444",
  accent: "#D71921",
  text: "#FFFFFF",
  textDim: "#666666",
  bgDay: "#080808",
  bgEvening: "#050A14",
  bgLateNight: "#000000",
  sunCore: "#FFD700",
  sunRay: "#FFA500",
  moonCore: "#F0F0FF",
  moonShadow: "#707090",
  rain: "#4A90E2",
  snow: "#FFFFFF",
  frogLit: "#39FF14",
  frogDark: "#1A7A05",
  frogEye: "#FFFFFF",
  frogPupil: "#000000",
  frogBelly: "#A8FF78",
  frogGlow: "#00FF41",
  rabWhite: "#F4F4F4",
  rabGrey: "#BBBBBB",
  rabDark: "#888888",
  rabPink: "#FFB7C5",
  rabEye: "#1A1A1A",
  rabCream: "#E8E8E8",
  pandaPatch: "#0D0D0D",
  pandaGlow1: "#D4D4D4",
  pandaGlow2: "#7A7A7A",
  pandaGlow3: "#2E2E2E",
};
const NOTHING_THEME = {
  bg: tokens.colors.dark,
  surface: "#1B1B1D",
  border: "#2A2A2A",
  dot: "#2A2A2A",
  dotLit: tokens.colors.light,
  accent: tokens.colors.red,
  text: tokens.colors.light,
  textDim: tokens.colors["secondary-dark"],
  textMid: tokens.colors["secondary-light"],
};
const T = {
  bg: "#0A0A0A",
  surface: "#111111",
  border: "#1F1F1F",
  dot: "#1A1A1A",
  dotLit: "#FFFFFF",
  dimmed: "#3A3A3A",
  accent: "#D71921",
  text: "#FFFFFF",
  textDim: "#555555",
  textMid: "#888888",
};
const MONO = Platform.OS === "ios" ? "Courier" : "monospace";
const STORAGE_KEY = "ndot_habit_v1";
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const PD_WHITE = 1;
const PD_PATCH = 21;
const PD_GLOW1 = 22;
const PD_GLOW2 = 23;
const PD_GLOW3 = 24;
const PD_RED = 3;
const FROG_BODY = 10;
const FROG_DARK = 11;
const FROG_EYE = 12;
const FROG_BELL = 13;
const FROG_GLOW = 14;
const RB_WHITE = 15;
const RB_GREY = 16;
const RB_PINK = 17;
const RB_DARK = 18;
const RB_EYE = 19;
const RB_CREAM = 20;
const GLYPH = {
  0: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  1: [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  2: [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
  ],
  3: [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  4: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  5: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  6: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  7: [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  8: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  9: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  "/": [
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
  ],
};
const CHAR_ICONS = {
  panda: {
    dots: [
      0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 0,
    ],
    color: "#F0F0F0",
    dim: "#2A2A2A",
  },
  frog: {
    dots: [
      1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0,
      0, 1, 1, 0, 0,
    ],
    color: "#39FF14",
    dim: "#0D2200",
  },
  rabbit: {
    dots: [
      0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0,
      1, 1, 1, 0, 0,
    ],
    color: "#F4F4F4",
    dim: "#2A2A2A",
  },
};

const CHAR_ORDER = ["panda", "frog", "rabbit"];
const CHAR_LABELS = { panda: "PANDA", frog: "FROG", rabbit: "BUNNY" };
const CHAR_EMOJI = { panda: "🐼", frog: "🐸", rabbit: "🐇" };
const CHAR_ACCENT = { panda: "#FFFFFF", frog: "#39FF14", rabbit: "#FFB7C5" };
const CHAR_BORDER_ON = {
  panda: "#FFFFFF88",
  frog: "#39FF1488",
  rabbit: "#FFB7C588",
};
const CHAR_BORDER_OFF = {
  panda: "#333333",
  frog: "#1A3A00",
  rabbit: "#2A1A1A",
};
const CHAR_BG_ON = { panda: "#1A1A1A", frog: "#001A00", rabbit: "#1A0F14" };

export {
  Quotes,
  Reminders,
  RandomJokes,
  GRID_W,
  GRID_H,
  DOT_SIZE,
  DOT_GAP,
  THEME,
  NOTHING_THEME,
  T,
  MONO,
  STORAGE_KEY,
  DAY_LABELS,
  PD_WHITE,
  PD_PATCH,
  PD_GLOW1,
  PD_GLOW2,
  PD_GLOW3,
  PD_RED,
  FROG_BODY,
  FROG_DARK,
  FROG_EYE,
  FROG_BELL,
  FROG_GLOW,
  RB_WHITE,
  RB_GREY,
  RB_PINK,
  RB_DARK,
  RB_EYE,
  RB_CREAM,
  GLYPH,
  CHAR_ICONS,
  CHAR_ORDER,
  CHAR_LABELS,
  CHAR_EMOJI,
  CHAR_ACCENT,
  CHAR_BORDER_ON,
  CHAR_BORDER_OFF,
  CHAR_BG_ON,
};