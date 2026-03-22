import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Easing,
  LogBox,
  Dimensions,
  Modal,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Pattern,
  Rect,
  Path,
  Mask,
  Filter,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
} from "react-native-svg";
import DeviceInfo from "react-native-device-info";
import RNCalendarEvents from "react-native-calendar-events";
import * as Location from "expo-location";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokens } from "./src/styles/tokens";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

// =============================================================================
// 1. PERMISSION WRAPPER
// =============================================================================
function WithCalendarReadPermission({ children }) {
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const checkPerms = async () => {
      try {
        let result = await check(PERMISSIONS.ANDROID.READ_CALENDAR);
        if (result === RESULTS.DENIED || result === RESULTS.BLOCKED)
          result = await request(PERMISSIONS.ANDROID.READ_CALENDAR);
        setStatus(result === RESULTS.GRANTED ? "authorized" : "denied");
      } catch {
        setStatus("denied");
      }
    };
    checkPerms();
  }, []);
  if (status === "loading") return null;
  return <>{children}</>;
}

// =============================================================================
// 2. CONFIGURATION & THEME
// =============================================================================

// ── WIDGET SIZE CONSTANTS ─────────────────────────────────────────────────────
// Nothing Phone 4×2 widget target:
//   matrix width  = GRID_W × (DOT_SIZE + DOT_GAP) = 32 × 3.6 ≈ 115 dp
//   matrix height = GRID_H × (DOT_SIZE + DOT_GAP) = 25 × 3.6 ≈  90 dp
const GRID_W = 35;
const GRID_H = 30;
const DOT_SIZE = 4.0; // ↓ was 5.5
const DOT_GAP = 0.6; // ↓ was 1.8
const SECTION_HEIGHT = 170; // ↓ was 320

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

// =============================================================================
// 3. GRAPHICS ENGINE
// =============================================================================
const createBuffer = () =>
  Array(GRID_H)
    .fill(0)
    .map(() => Array(GRID_W).fill(0));

const drawClouds = (buffer, frame, density) => {
  const xBase = -(frame * 0.2);
  drawRect(buffer, (xBase + 5) % (GRID_W + 15), 2, 6, 2, 8);
  drawRect(buffer, ((xBase + 5) % (GRID_W + 15)) + 2, 1, 3, 1, 8);
  if (density !== "low")
    drawRect(buffer, (xBase + 20) % (GRID_W + 15), 4, 5, 2, 8);
  if (density === "high") {
    drawRect(buffer, (xBase + 12) % (GRID_W + 15), 1, 8, 3, 8);
    drawRect(buffer, (xBase + 28) % (GRID_W + 15), 3, 4, 2, 8);
  }
};
const drawCircle = (buffer, cx, cy, r, colorVal) => {
  for (let y = 0; y < GRID_H; y++)
    for (let x = 0; x < GRID_W; x++)
      if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) < r) buffer[y][x] = colorVal;
};
const drawRect = (buffer, x, y, w, h, colorVal) => {
  for (let iy = Math.floor(y); iy < Math.floor(y) + h; iy++)
    for (let ix = Math.floor(x); ix < Math.floor(x) + w; ix++) {
      const wx = ((ix % GRID_W) + GRID_W) % GRID_W;
      if (iy >= 0 && iy < GRID_H) buffer[iy][wx] = colorVal;
    }
};
const setPixel = (buffer, x, y, colorVal) => {
  const ix = Math.round(x),
    iy = Math.round(y);
  if (iy >= 0 && iy < GRID_H && ix >= 0 && ix < GRID_W)
    buffer[iy][ix] = colorVal;
};
const drawRain = (buffer, frame) => {
  for (let x = 0; x < GRID_W; x += 3) {
    const yo = (frame * 2 + x * 7) % (GRID_H + 5);
    setPixel(buffer, x, yo - 1, 8);
    setPixel(buffer, x, yo, 9);
  }
};
const drawSnow = (buffer, frame) => {
  for (let i = 0; i < 15; i++) {
    const seed = i * 137;
    const y = (frame * 0.5 + seed) % GRID_H;
    const x = (seed + Math.sin(frame * 0.1 + i) * 1.5) % GRID_W;
    setPixel(buffer, x, y, 9);
  }
};

// =============================================================================
// 4A. PANDA RENDERER v2 — GLOW / GRADIENT
// =============================================================================
const PD_WHITE = 1;
const PD_PATCH = 21;
const PD_GLOW1 = 22;
const PD_GLOW2 = 23;
const PD_GLOW3 = 24;
const PD_RED = 3;

const _fe = (buf, cx, cy, rx, ry, v) => {
  const x0 = Math.max(0, Math.floor(cx - rx - 1));
  const x1 = Math.min(GRID_W - 1, Math.ceil(cx + rx + 1));
  const y0 = Math.max(0, Math.floor(cy - ry - 1));
  const y1 = Math.min(GRID_H - 1, Math.ceil(cy + ry + 1));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) buf[y][x] = v;
};

const _ring = (buf, cx, cy, r, v, step = 1.4) => {
  for (let d = 0; d < 360; d += step) {
    const rad = (d * Math.PI) / 180;
    setPixel(buf, cx + r * Math.cos(rad), cy + r * Math.sin(rad), v);
  }
};

const renderPanda = (buf, state) => {
  const {
    mood,
    lookX,
    lookY,
    blinkOpen,
    mouthOpen,
    yOffset,
    xOffset,
    breathScale,
    frame,
    timePeriod,
    weather,
    hasCrown,
    isZen,
  } = state;

  const CX = GRID_W / 2 - 0.5 + xOffset;
  // ALIGNED TO BOTTOM: Center Y is now relative to the bottom of the grid
  const CY = GRID_H - 15 - yOffset; 
  const HR = 9.5 + breathScale * 0.5;

  if (weather === "Rainy") {
    drawClouds(buf, frame, "high");
    drawRain(buf, frame);
  } else if (weather === "Snowy") {
    drawClouds(buf, frame, "low");
    drawSnow(buf, frame);
  } else if (
    mood === "trip" ||
    weather === "Cloudy" ||
    weather === "Partly Cloudy" ||
    (weather === "Clear" && frame % 200 < 100)
  )
    drawClouds(buf, frame, "normal");

  if (weather !== "Rainy" && weather !== "Snowy") {
    if (timePeriod === "day") {
      drawRect(buf, 27, 2, 3, 3, 4);
      if (frame % 8 < 4) {
        setPixel(buf, 28, 1, 5);
        setPixel(buf, 28, 5, 5);
        setPixel(buf, 26, 3, 5);
        setPixel(buf, 30, 3, 5);
      }
    } else {
      setPixel(buf, 28, 1, 6);
      setPixel(buf, 29, 1, 6);
      setPixel(buf, 27, 2, 6);
      setPixel(buf, 30, 2, 6);
    }
  }

  if (hasCrown) {
    drawRect(buf, CX - 3, CY - 12, 7, 1, 4);
    setPixel(buf, CX - 3, CY - 14, 4);
    setPixel(buf, CX - 1, CY - 14, 4);
    setPixel(buf, CX + 1, CY - 14, 4);
    setPixel(buf, CX + 3, CY - 14, 4);
    setPixel(buf, CX, CY - 15, 4);
  }

  _ring(buf, CX - 8.5, CY - 8, 5.2, PD_GLOW1, 2.5);
  _ring(buf, CX + 8.5, CY - 8, 5.2, PD_GLOW1, 2.5);
  _ring(buf, CX, CY, HR + 2.2, PD_GLOW1, 1.8);
  _ring(buf, CX, CY, HR + 1.2, PD_GLOW2, 1.6);

  drawCircle(buf, CX - 8.5, CY - 8, 4.8, PD_PATCH);
  drawCircle(buf, CX + 8.5, CY - 8, 4.8, PD_PATCH);
  _ring(buf, CX - 8.5, CY - 8, 3.2, PD_GLOW3, 2.2);
  _ring(buf, CX + 8.5, CY - 8, 3.2, PD_GLOW3, 2.2);
  setPixel(buf, CX - 8.5, CY - 9, PD_RED);
  setPixel(buf, CX + 8.5, CY - 9, PD_RED);

  _fe(buf, CX, CY, HR + 0.5, HR, PD_WHITE);
  _ring(buf, CX, CY, HR + 0.1, PD_GLOW1, 1.2);
  _ring(buf, CX, CY, HR - 0.5, PD_GLOW2, 2.0);

  const PL_CX = CX - 5.5;
  const PR_CX = CX + 5.5;
  const P_CY = CY + 0.5;
  const BROW_Y = P_CY - 6;

  if (mood === "happy" || mood === "birthday") {
    setPixel(buf, PL_CX - 2, BROW_Y + 2, PD_PATCH);
    setPixel(buf, PL_CX - 1, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PL_CX, BROW_Y, PD_PATCH);
    setPixel(buf, PL_CX + 1, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PR_CX - 1, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PR_CX, BROW_Y, PD_PATCH);
    setPixel(buf, PR_CX + 1, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PR_CX + 2, BROW_Y + 2, PD_PATCH);
  } else if (mood === "starving" || mood === "disappointed") {
    setPixel(buf, PL_CX - 2, BROW_Y, PD_PATCH);
    setPixel(buf, PL_CX - 1, BROW_Y, PD_PATCH);
    setPixel(buf, PL_CX, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PL_CX + 1, BROW_Y + 2, PD_PATCH);
    setPixel(buf, PR_CX - 1, BROW_Y + 2, PD_PATCH);
    setPixel(buf, PR_CX, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PR_CX + 1, BROW_Y, PD_PATCH);
    setPixel(buf, PR_CX + 2, BROW_Y, PD_PATCH);
  } else if (mood === "tired" || mood === "sleep") {
    for (let dx = -2; dx <= 2; dx++)
      setPixel(buf, PL_CX + dx, BROW_Y + 3, PD_PATCH);
    for (let dx = -2; dx <= 2; dx++)
      setPixel(buf, PR_CX + dx, BROW_Y + 3, PD_PATCH);
  } else if (mood === "work") {
    for (let dx = -2; dx <= 2; dx++)
      setPixel(buf, PL_CX + dx, BROW_Y + 1, PD_PATCH);
    for (let dx = -2; dx <= 2; dx++)
      setPixel(buf, PR_CX + dx, BROW_Y + 1, PD_PATCH);
  } else {
    setPixel(buf, PL_CX - 2, BROW_Y + 2, PD_PATCH);
    setPixel(buf, PL_CX - 1, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PL_CX, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PL_CX + 1, BROW_Y + 2, PD_PATCH);
    setPixel(buf, PR_CX - 1, BROW_Y + 2, PD_PATCH);
    setPixel(buf, PR_CX, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PR_CX + 1, BROW_Y + 1, PD_PATCH);
    setPixel(buf, PR_CX + 2, BROW_Y + 2, PD_PATCH);
  }

  const PRX2 = 3.8,
    PRY2 = 5.0;
  _fe(buf, PL_CX, P_CY, PRX2, PRY2, PD_PATCH);
  _fe(buf, PR_CX, P_CY, PRX2, PRY2, PD_PATCH);
  _ring(buf, PL_CX, P_CY, PRX2 - 1.0, PD_GLOW3, 2.2);
  _ring(buf, PR_CX, P_CY, PRX2 - 1.0, PD_GLOW3, 2.2);

  const eyeY = P_CY;
  const asleep = mood === "sleep";
  const doBlink = !blinkOpen && !asleep && mood !== "starving";

  if (asleep) {
    for (let dx = -2; dx <= 2; dx++) {
      const dy = dx === 0 ? 1 : Math.abs(dx) === 1 ? 0 : -1;
      setPixel(buf, PL_CX + dx, eyeY + dy, PD_WHITE);
      setPixel(buf, PR_CX + dx, eyeY + dy, PD_WHITE);
    }
  } else if (doBlink) {
    for (let dx = -2; dx <= 2; dx++) {
      setPixel(buf, PL_CX + dx, eyeY, PD_WHITE);
      setPixel(buf, PR_CX + dx, eyeY, PD_WHITE);
    }
  } else if (mood === "starving") {
    for (let i = -2; i <= 2; i++) {
      setPixel(buf, PL_CX + i, eyeY + i, PD_WHITE);
      setPixel(buf, PL_CX + i, eyeY - i, PD_WHITE);
      setPixel(buf, PR_CX + i, eyeY + i, PD_WHITE);
      setPixel(buf, PR_CX + i, eyeY - i, PD_WHITE);
    }
  } else if (mood === "tired" || mood === "disappointed") {
    _fe(buf, PL_CX, eyeY - 3.5, 4.0, 3.2, PD_WHITE);
    _fe(buf, PR_CX, eyeY - 3.5, 4.0, 3.2, PD_WHITE);
    drawCircle(buf, PL_CX, eyeY + 1.5, 1.6, PD_PATCH);
    drawCircle(buf, PR_CX, eyeY + 1.5, 1.6, PD_PATCH);
    setPixel(buf, PL_CX + 1, eyeY + 0.5, PD_WHITE);
    setPixel(buf, PR_CX + 1, eyeY + 0.5, PD_WHITE);
  } else if (mood === "happy" || mood === "birthday") {
    _fe(buf, PL_CX, eyeY - 2.5, 3.8, 2.8, PD_WHITE);
    _fe(buf, PR_CX, eyeY - 2.5, 3.8, 2.8, PD_WHITE);
    drawCircle(buf, PL_CX, eyeY + 2, 1.8, PD_PATCH);
    drawCircle(buf, PR_CX, eyeY + 2, 1.8, PD_PATCH);
    setPixel(buf, PL_CX + 1, eyeY + 1, PD_WHITE);
    setPixel(buf, PR_CX + 1, eyeY + 1, PD_WHITE);
  } else if (mood === "music") {
    drawCircle(buf, PL_CX, eyeY + 0.7, 2.2, PD_PATCH);
    drawCircle(buf, PL_CX, eyeY - 2.0, 2.2, PD_WHITE);
    drawCircle(buf, PR_CX, eyeY + 0.7, 2.2, PD_PATCH);
    drawCircle(buf, PR_CX, eyeY - 2.0, 2.2, PD_WHITE);
  } else if (mood === "work") {
    _fe(buf, PL_CX, eyeY, 2.5, 1.3, PD_PATCH);
    _fe(buf, PR_CX, eyeY, 2.5, 1.3, PD_PATCH);
    setPixel(buf, PL_CX + 1.5, eyeY - 0.5, PD_WHITE);
    setPixel(buf, PR_CX + 1.5, eyeY - 0.5, PD_WHITE);
  } else {
    const clx = Math.max(-1.5, Math.min(1.5, lookX));
    const cly = Math.max(-1.0, Math.min(1.0, lookY));
    drawCircle(buf, PL_CX + clx, eyeY + cly, 2.2, PD_PATCH);
    drawCircle(buf, PR_CX + clx, eyeY + cly, 2.2, PD_PATCH);
    setPixel(buf, PL_CX + clx + 1.5, eyeY + cly - 1.5, PD_WHITE);
    setPixel(buf, PR_CX + clx + 1.5, eyeY + cly - 1.5, PD_WHITE);
    setPixel(buf, PL_CX + clx - 1, eyeY + cly + 1, PD_GLOW1);
    setPixel(buf, PR_CX + clx - 1, eyeY + cly + 1, PD_GLOW1);
  }

  const muzzleCY = P_CY + PRY2 + 0.8;
  _fe(buf, CX, muzzleCY, 4.2, 3.0, PD_GLOW1);
  _fe(buf, CX, muzzleCY, 2.5, 1.8, PD_WHITE);

  const noseY = muzzleCY - 1.2;
  drawCircle(buf, CX, noseY, 1.8, PD_RED);

  const MY = muzzleCY + 1.5;
  if (mood === "happy" || mood === "birthday") {
    setPixel(buf, CX - 4, MY, PD_PATCH);
    setPixel(buf, CX - 3, MY + 1, PD_PATCH);
    setPixel(buf, CX - 2, MY + 2, PD_PATCH);
    setPixel(buf, CX - 1, MY + 1, PD_PATCH);
    setPixel(buf, CX, MY + 2, PD_PATCH);
    setPixel(buf, CX + 1, MY + 1, PD_PATCH);
    setPixel(buf, CX + 2, MY + 2, PD_PATCH);
    setPixel(buf, CX + 3, MY + 1, PD_PATCH);
    setPixel(buf, CX + 4, MY, PD_PATCH);
  } else if (mood === "starving") {
    setPixel(buf, CX - 3, MY + 2, PD_PATCH);
    setPixel(buf, CX - 2, MY + 1, PD_PATCH);
    setPixel(buf, CX - 1, MY, PD_PATCH);
    setPixel(buf, CX, MY, PD_PATCH);
    setPixel(buf, CX + 1, MY, PD_PATCH);
    setPixel(buf, CX + 2, MY + 1, PD_PATCH);
    setPixel(buf, CX + 3, MY + 2, PD_PATCH);
  } else if (mood === "disappointed") {
    setPixel(buf, CX - 2, MY + 1, PD_PATCH);
    setPixel(buf, CX - 1, MY, PD_PATCH);
    setPixel(buf, CX, MY, PD_PATCH);
    setPixel(buf, CX + 1, MY, PD_PATCH);
    setPixel(buf, CX + 2, MY + 1, PD_PATCH);
  } else if (mood === "tired") {
    setPixel(buf, CX - 1, MY, PD_PATCH);
    setPixel(buf, CX, MY, PD_PATCH);
    setPixel(buf, CX + 1, MY, PD_PATCH);
  } else if (mood === "sleep") {
    drawCircle(buf, CX, MY, 1.8, PD_PATCH);
    setPixel(buf, CX, MY, PD_WHITE);
  } else if (mood === "work") {
    // Flat, focused mouth
    setPixel(buf, CX - 2, MY, PD_PATCH);
    setPixel(buf, CX - 1, MY, PD_PATCH);
    setPixel(buf, CX, MY, PD_PATCH);
    setPixel(buf, CX + 1, MY, PD_PATCH);
    setPixel(buf, CX + 2, MY, PD_PATCH);
  } else if (mouthOpen) {
    drawCircle(buf, CX, MY, 2.2, PD_PATCH);
    setPixel(buf, CX, MY, PD_WHITE);
    setPixel(buf, CX - 1, MY, PD_WHITE);
    setPixel(buf, CX + 1, MY, PD_WHITE);
  } else {
    setPixel(buf, CX - 3, MY, PD_PATCH);
    setPixel(buf, CX - 2, MY + 1, PD_PATCH);
    setPixel(buf, CX - 1, MY + 1, PD_PATCH);
    setPixel(buf, CX, MY + 1, PD_PATCH);
    setPixel(buf, CX + 1, MY + 1, PD_PATCH);
    setPixel(buf, CX + 2, MY + 1, PD_PATCH);
    setPixel(buf, CX + 3, MY, PD_PATCH);
  }

  if (mood === "happy" || mood === "birthday") {
    drawCircle(buf, CX - 9, muzzleCY - 0.5, 2.5, PD_RED);
    drawCircle(buf, CX + 9, muzzleCY - 0.5, 2.5, PD_RED);
    _ring(buf, CX - 9, muzzleCY - 0.5, 3.2, PD_GLOW2, 3.0);
    _ring(buf, CX + 9, muzzleCY - 0.5, 3.2, PD_GLOW2, 3.0);
  } else if (mood !== "starving" && mood !== "disappointed") {
    setPixel(buf, CX - 9, muzzleCY - 0.5, PD_RED);
    setPixel(buf, CX + 9, muzzleCY - 0.5, PD_RED);
  }

  if (mood === "trip") {
    drawRect(buf, CX - 9, P_CY - 1.5, 6, 3, PD_PATCH);
    drawRect(buf, CX + 3, P_CY - 1.5, 6, 3, PD_PATCH);
    setPixel(buf, CX - 1, P_CY - 0.5, PD_PATCH);
    setPixel(buf, CX, P_CY - 0.5, PD_PATCH);
    setPixel(buf, CX - 7, P_CY - 1, PD_GLOW1);
    setPixel(buf, CX + 5, P_CY - 1, PD_GLOW1);
  }

  if (mood === "work") {
  const tieY = CY + HR + 2; 
    
    setPixel(buf, CX, tieY, PD_RED);         // Tie knot top
    setPixel(buf, CX, tieY + 1, PD_RED);     // Tie knot bottom
    setPixel(buf, CX - 1, tieY + 1, PD_RED); // Collar left
    setPixel(buf, CX + 1, tieY + 1, PD_RED); // Collar right
    setPixel(buf, CX, tieY + 2, PD_RED);     // Tie body
    setPixel(buf, CX, tieY + 3, PD_RED);     // Tie tip
  }

  if (mood === "birthday") {
    drawRect(buf, CX - 1.5, CY - HR - 3, 3, 4, PD_RED);
    setPixel(buf, CX, CY - HR - 4, PD_RED);
    setPixel(buf, CX - 2.5, CY - HR - 1, 4);
    setPixel(buf, CX + 2.5, CY - HR - 1, 4);
    setPixel(buf, CX - 10, CY - 6, PD_RED);
    setPixel(buf, CX + 10, CY - 6, PD_RED);
    setPixel(buf, CX - 9, CY - 3, PD_GLOW1);
    setPixel(buf, CX + 9, CY - 3, PD_GLOW1);
  }

  if (mood === "sleep") {
    const zPh = (frame * 0.04) % 1;
    const z1y = Math.round(CY - HR - zPh * 10);
    const z2y = Math.round(CY - HR - ((zPh + 0.5) % 1) * 10);
    if (z1y > 0) {
      setPixel(buf, CX + 10, z1y, PD_GLOW1);
      setPixel(buf, CX + 11, z1y, PD_GLOW1);
      setPixel(buf, CX + 11, z1y + 1, PD_GLOW1);
      setPixel(buf, CX + 10, z1y + 2, PD_GLOW1);
      setPixel(buf, CX + 11, z1y + 2, PD_GLOW1);
    }
    if (z2y > 0 && z2y < GRID_H - 3) {
      setPixel(buf, CX + 8, z2y, PD_GLOW2);
      setPixel(buf, CX + 9, z2y, PD_GLOW2);
      setPixel(buf, CX + 9, z2y + 1, PD_GLOW2);
      setPixel(buf, CX + 8, z2y + 2, PD_GLOW2);
      setPixel(buf, CX + 9, z2y + 2, PD_GLOW2);
    }
  }

  if (mood === "happy" || mood === "birthday") {
    const hPh = (frame * 0.055) % 1;
    const hPh2 = (frame * 0.055 + 0.5) % 1;
    const h1y = Math.round(CY - HR - 2 - hPh * 9);
    const h2y = Math.round(CY - HR - 2 - hPh2 * 9);
    if (h1y > 0) {
      setPixel(buf, 3, h1y, PD_RED);
      setPixel(buf, 4, h1y - 1, PD_RED);
      setPixel(buf, 2, h1y - 1, PD_RED);
      setPixel(buf, 3, h1y - 2, PD_RED);
      setPixel(buf, 3, h1y + 1, PD_GLOW2);
      setPixel(buf, 1, h1y - 1, PD_GLOW2);
    }
    if (h2y > 0) {
      setPixel(buf, GRID_W - 4, h2y, PD_RED);
      setPixel(buf, GRID_W - 3, h2y - 1, PD_RED);
      setPixel(buf, GRID_W - 5, h2y - 1, PD_RED);
      setPixel(buf, GRID_W - 4, h2y - 2, PD_RED);
    }
  }

  if (mood === "music") {
    const hs = [4, 7, 11, 8, 13, 6, 10, 5, 9];
    hs.forEach((h, i) => {
      const dh = Math.max(1, Math.round(h * (0.35 + Math.random() * 0.65)));
      const bx = 1 + i * 3;
      for (let by = GRID_H - 1 - dh; by < GRID_H - 1; by++) {
        const intensity = by > GRID_H - 1 - dh + 2 ? PD_GLOW1 : PD_WHITE;
        if (by >= 0 && bx < GRID_W) buf[by][bx] = intensity;
        if (by >= 0 && bx + 1 < GRID_W) buf[by][bx + 1] = PD_GLOW2;
      }
    });
    const nPh = (frame * 0.065) % 1;
    const ny = Math.round(CY - HR - nPh * 9);
    if (ny > 0) {
      setPixel(buf, CX - 12, ny, PD_GLOW1);
      setPixel(buf, CX - 11, ny, PD_GLOW1);
      setPixel(buf, CX - 11, ny + 1, PD_GLOW1);
      setPixel(buf, CX - 11, ny + 2, PD_GLOW1);
      drawCircle(buf, CX - 12.5, ny + 3, 1.2, PD_GLOW2);
    }
  }

  if (mood === "starving") {
    if (Math.floor(frame * 0.1) % 2 === 0) {
      setPixel(buf, 0, CY - 4, PD_GLOW2);
      setPixel(buf, 0, CY - 3, PD_GLOW2);
      setPixel(buf, 0, CY - 2, PD_GLOW2);
      setPixel(buf, 0, CY, PD_GLOW2);
      setPixel(buf, GRID_W - 1, CY - 4, PD_GLOW2);
      setPixel(buf, GRID_W - 1, CY - 3, PD_GLOW2);
      setPixel(buf, GRID_W - 1, CY - 2, PD_GLOW2);
      setPixel(buf, GRID_W - 1, CY, PD_GLOW2);
    }
  }
};
// =============================================================================
// 4B. FROG RENDERER
// =============================================================================
const FROG_BODY = 10;
const FROG_DARK = 11;
const FROG_EYE = 12;
const FROG_BELL = 13;
const FROG_GLOW = 14;

const renderFrog = (buffer, state) => {
  const {
    mood,
    lookX,
    lookY,
    blinkOpen,
    mouthOpen,
    yOffset,
    xOffset,
    breathScale,
    frame,
    timePeriod,
    weather,
    hasCrown,
  } = state;

  const CX = GRID_W / 2 + xOffset;
  const CY = GRID_H / 2 - yOffset + 1;
  const br = breathScale * 0.5;

  if (weather === "Rainy") {
    drawClouds(buffer, frame, "high");
    drawRain(buffer, frame);
  } else if (weather === "Snowy") {
    drawClouds(buffer, frame, "low");
    drawSnow(buffer, frame);
  } else if (
    mood === "trip" ||
    weather === "Cloudy" ||
    (weather === "Clear" && frame % 200 < 100)
  )
    drawClouds(buffer, frame, "normal");

  if (weather !== "Rainy" && weather !== "Snowy") {
    if (timePeriod === "day") {
      drawRect(buffer, 27, 2, 3, 3, 4);
      if (frame % 8 < 4) {
        setPixel(buffer, 28, 1, 5);
        setPixel(buffer, 28, 5, 5);
        setPixel(buffer, 26, 3, 5);
        setPixel(buffer, 30, 3, 5);
      }
    } else {
      setPixel(buffer, 28, 1, 6);
      setPixel(buffer, 29, 1, 6);
      setPixel(buffer, 27, 2, 6);
      setPixel(buffer, 30, 2, 6);
    }
  }

  if (hasCrown) {
    drawRect(buffer, CX - 3, CY - 11, 7, 1, 4);
    setPixel(buffer, CX - 3, CY - 13, 4);
    setPixel(buffer, CX - 1, CY - 13, 4);
    setPixel(buffer, CX + 1, CY - 13, 4);
    setPixel(buffer, CX + 3, CY - 13, 4);
    setPixel(buffer, CX, CY - 14, 4);
  }

  drawCircle(buffer, CX - 5.5, CY - 8, 4.8 + br, FROG_BODY);
  drawCircle(buffer, CX + 5.5, CY - 8, 4.8 + br, FROG_BODY);
  for (let d = 0; d <= 360; d += 15) {
    const rad = (d * Math.PI) / 180;
    const r = 4.8 + br;
    setPixel(
      buffer,
      CX - 5.5 + r * Math.cos(rad),
      CY - 8 + r * Math.sin(rad),
      FROG_DARK,
    );
    setPixel(
      buffer,
      CX + 5.5 + r * Math.cos(rad),
      CY - 8 + r * Math.sin(rad),
      FROG_DARK,
    );
  }

  const bRX = 11.5 + br;
  const bRY = 9 + br;
  for (let y = 0; y < GRID_H; y++)
    for (let x = 0; x < GRID_W; x++) {
      const dx = (x - CX) / bRX,
        dy = (y - CY) / bRY;
      if (dx * dx + dy * dy <= 1) buffer[y][x] = FROG_BODY;
    }

  for (let d = 0; d <= 360; d += 6) {
    const rad = (d * Math.PI) / 180;
    setPixel(
      buffer,
      CX + (bRX + 0.5) * Math.cos(rad),
      CY + (bRY + 0.3) * Math.sin(rad),
      FROG_DARK,
    );
  }

  for (let y = 0; y < GRID_H; y++)
    for (let x = 0; x < GRID_W; x++) {
      const dx = (x - CX) / 5.5,
        dy = (y - (CY + 2)) / 4.5;
      if (dx * dx + dy * dy <= 1) buffer[y][x] = FROG_BELL;
    }

  drawRect(buffer, CX - 13, CY + 5, 4, 2, FROG_BODY);
  drawRect(buffer, CX - 14, CY + 6, 5, 2, FROG_BODY);
  setPixel(buffer, CX - 14, CY + 7, FROG_DARK);
  setPixel(buffer, CX - 12, CY + 7, FROG_DARK);
  setPixel(buffer, CX - 10, CY + 7, FROG_DARK);
  drawRect(buffer, CX + 9, CY + 5, 4, 2, FROG_BODY);
  drawRect(buffer, CX + 9, CY + 6, 5, 2, FROG_BODY);
  setPixel(buffer, CX + 9, CY + 7, FROG_DARK);
  setPixel(buffer, CX + 11, CY + 7, FROG_DARK);
  setPixel(buffer, CX + 13, CY + 7, FROG_DARK);

  drawCircle(buffer, CX - 9, CY + 7, 4.5, FROG_BODY);
  drawCircle(buffer, CX + 9, CY + 7, 4.5, FROG_BODY);
  for (let d = 0; d <= 360; d += 20) {
    const rad = (d * Math.PI) / 180;
    setPixel(
      buffer,
      CX - 9 + 4.5 * Math.cos(rad),
      CY + 7 + 4.5 * Math.sin(rad),
      FROG_DARK,
    );
    setPixel(
      buffer,
      CX + 9 + 4.5 * Math.cos(rad),
      CY + 7 + 4.5 * Math.sin(rad),
      FROG_DARK,
    );
  }

  drawCircle(buffer, CX - 5.5, CY - 8.5, 3.0, FROG_EYE);
  drawCircle(buffer, CX + 5.5, CY - 8.5, 3.0, FROG_EYE);

  const sleeping = mood === "sleep";
  const doBlink = !blinkOpen && !sleeping && mood !== "starving";
  const eyeLX = CX - 5.5,
    eyeRX = CX + 5.5,
    eyeY = CY - 8.5;

  if (sleeping) {
    for (let dx = -2; dx <= 2; dx++) {
      const dy = Math.round(Math.sqrt(Math.max(0, 4 - dx * dx)));
      setPixel(buffer, eyeLX + dx, eyeY + dy - 1, FROG_DARK);
      setPixel(buffer, eyeRX + dx, eyeY + dy - 1, FROG_DARK);
    }
  } else if (doBlink) {
    for (let dx = -2; dx <= 2; dx++) {
      setPixel(buffer, eyeLX + dx, eyeY, FROG_DARK);
      setPixel(buffer, eyeRX + dx, eyeY, FROG_DARK);
    }
  } else if (mood === "tired") {
    drawCircle(buffer, eyeLX, eyeY - 1.5, 2.5, FROG_DARK);
    drawCircle(buffer, eyeRX, eyeY - 1.5, 2.5, FROG_DARK);
    setPixel(buffer, eyeLX, eyeY + 0.5, 0);
    setPixel(buffer, eyeRX, eyeY + 0.5, 0);
  } else if (mood === "happy") {
    drawCircle(buffer, eyeLX, eyeY - 1, 2.6, FROG_BODY);
    drawCircle(buffer, eyeRX, eyeY - 1, 2.6, FROG_BODY);
    drawCircle(buffer, eyeLX, eyeY + 1.5, 1.4, FROG_DARK);
    drawCircle(buffer, eyeRX, eyeY + 1.5, 1.4, FROG_DARK);
    setPixel(buffer, eyeLX + 1, eyeY + 0.5, FROG_EYE);
    setPixel(buffer, eyeRX + 1, eyeY + 0.5, FROG_EYE);
  } else if (mood === "starving") {
    for (let i = -2; i <= 2; i++) {
      setPixel(buffer, eyeLX + i, eyeY + i, FROG_DARK);
      setPixel(buffer, eyeLX + i, eyeY - i, FROG_DARK);
      setPixel(buffer, eyeRX + i, eyeY + i, FROG_DARK);
      setPixel(buffer, eyeRX + i, eyeY - i, FROG_DARK);
    }
  } else if (mood === "music") {
    drawCircle(buffer, eyeLX, eyeY + 0.5, 2.2, FROG_DARK);
    drawCircle(buffer, eyeLX, eyeY - 1.8, 2.2, FROG_BODY);
    drawCircle(buffer, eyeRX, eyeY + 0.5, 2.2, FROG_DARK);
    drawCircle(buffer, eyeRX, eyeY - 1.8, 2.2, FROG_BODY);
  } else {
    const clx = Math.max(-1.5, Math.min(1.5, lookX));
    const cly = Math.max(-1.0, Math.min(1.0, lookY));
    drawCircle(buffer, eyeLX + clx, eyeY + cly, 1.8, FROG_DARK);
    drawCircle(buffer, eyeRX + clx, eyeY + cly, 1.8, FROG_DARK);
    setPixel(buffer, eyeLX + 1, eyeY - 1, FROG_EYE);
    setPixel(buffer, eyeRX + 1, eyeY - 1, FROG_EYE);
  }

  setPixel(buffer, CX - 1.5, CY - 3.5, FROG_DARK);
  setPixel(buffer, CX + 1.5, CY - 3.5, FROG_DARK);

  const MY = CY + 0;
  if (mood === "happy" || mood === "birthday") {
    setPixel(buffer, CX - 5, MY + 1, FROG_DARK);
    setPixel(buffer, CX - 4, MY + 2, FROG_DARK);
    setPixel(buffer, CX - 3, MY + 3, FROG_DARK);
    setPixel(buffer, CX - 2, MY + 3, FROG_DARK);
    setPixel(buffer, CX - 1, MY + 3, FROG_DARK);
    setPixel(buffer, CX, MY + 3, FROG_DARK);
    setPixel(buffer, CX + 1, MY + 3, FROG_DARK);
    setPixel(buffer, CX + 2, MY + 3, FROG_DARK);
    setPixel(buffer, CX + 3, MY + 3, FROG_DARK);
    setPixel(buffer, CX + 4, MY + 2, FROG_DARK);
    setPixel(buffer, CX + 5, MY + 1, FROG_DARK);
    setPixel(buffer, CX - 9, CY + 2, FROG_GLOW);
    setPixel(buffer, CX + 9, CY + 2, FROG_GLOW);
    setPixel(buffer, CX - 9, CY + 3, FROG_GLOW);
    setPixel(buffer, CX + 9, CY + 3, FROG_GLOW);
  } else if (mood === "starving") {
    setPixel(buffer, CX - 5, MY + 3, FROG_DARK);
    setPixel(buffer, CX - 4, MY + 2, FROG_DARK);
    setPixel(buffer, CX - 3, MY + 1, FROG_DARK);
    setPixel(buffer, CX - 2, MY + 1, FROG_DARK);
    setPixel(buffer, CX - 1, MY + 1, FROG_DARK);
    setPixel(buffer, CX, MY + 1, FROG_DARK);
    setPixel(buffer, CX + 1, MY + 1, FROG_DARK);
    setPixel(buffer, CX + 2, MY + 1, FROG_DARK);
    setPixel(buffer, CX + 3, MY + 1, FROG_DARK);
    setPixel(buffer, CX + 4, MY + 2, FROG_DARK);
    setPixel(buffer, CX + 5, MY + 3, FROG_DARK);
  } else if (mood === "sleep") {
    for (let dx = -3; dx <= 3; dx++)
      setPixel(buffer, CX + dx, MY + 2, FROG_DARK);
  } else if (mood === "tired") {
    setPixel(buffer, CX - 2, MY + 2, FROG_DARK);
    setPixel(buffer, CX - 1, MY + 2, FROG_DARK);
    setPixel(buffer, CX, MY + 3, FROG_DARK);
    setPixel(buffer, CX + 1, MY + 2, FROG_DARK);
    setPixel(buffer, CX + 2, MY + 2, FROG_DARK);
  } else if (mouthOpen) {
    drawCircle(buffer, CX, MY + 2, 2.5, FROG_DARK);
    setPixel(buffer, CX, MY + 2, FROG_BELL);
    setPixel(buffer, CX - 1, MY + 2, FROG_BELL);
    setPixel(buffer, CX + 1, MY + 2, FROG_BELL);
  } else {
    setPixel(buffer, CX - 4, MY + 1, FROG_DARK);
    setPixel(buffer, CX - 3, MY + 2, FROG_DARK);
    setPixel(buffer, CX - 2, MY + 2, FROG_DARK);
    setPixel(buffer, CX - 1, MY + 2, FROG_DARK);
    setPixel(buffer, CX, MY + 2, FROG_DARK);
    setPixel(buffer, CX + 1, MY + 2, FROG_DARK);
    setPixel(buffer, CX + 2, MY + 2, FROG_DARK);
    setPixel(buffer, CX + 3, MY + 2, FROG_DARK);
    setPixel(buffer, CX + 4, MY + 1, FROG_DARK);
  }

  if (mood === "birthday") {
    drawRect(buffer, CX - 1, CY - 12, 3, 4, 3);
    setPixel(buffer, CX, CY - 13, 3);
    setPixel(buffer, CX - 2, CY - 9, 4);
    setPixel(buffer, CX + 2, CY - 9, 4);
    setPixel(buffer, CX - 8, CY - 6, 3);
    setPixel(buffer, CX + 8, CY - 6, 3);
    setPixel(buffer, CX - 7, CY - 4, 4);
    setPixel(buffer, CX + 7, CY - 4, 4);
  }

  if (mood === "happy" || mood === "music") {
    const t = (frame * 0.08) % 1;
    const t2 = (frame * 0.08 + 0.5) % 1;
    const gy1 = Math.round(CY - 2 - t * 10);
    const gy2 = Math.round(CY - 2 - t2 * 10);
    if (gy1 >= 0) {
      setPixel(buffer, CX - 11, gy1, FROG_GLOW);
      setPixel(buffer, CX + 11, gy1 + 1, FROG_GLOW);
    }
    if (gy2 >= 0) {
      setPixel(buffer, CX - 10, gy2, FROG_GLOW);
      setPixel(buffer, CX + 10, gy2 - 1, FROG_GLOW);
    }
  }

  if (mood === "sleep") {
    const zPhase = (frame * 0.05) % 1;
    const z1y = Math.round(CY - 8 - zPhase * 8);
    const z2y = Math.round(CY - 6 - ((zPhase + 0.5) % 1) * 8);
    if (z1y >= 1) {
      setPixel(buffer, CX + 9, z1y, FROG_BELL);
      setPixel(buffer, CX + 10, z1y, FROG_BELL);
      setPixel(buffer, CX + 10, z1y + 1, FROG_BELL);
      setPixel(buffer, CX + 9, z1y + 2, FROG_BELL);
      setPixel(buffer, CX + 10, z1y + 2, FROG_BELL);
    }
    if (z2y >= 1 && z2y < GRID_H - 2) {
      setPixel(buffer, CX + 7, z2y, FROG_DARK);
      setPixel(buffer, CX + 8, z2y, FROG_DARK);
      setPixel(buffer, CX + 8, z2y + 1, FROG_DARK);
      setPixel(buffer, CX + 7, z2y + 2, FROG_DARK);
      setPixel(buffer, CX + 8, z2y + 2, FROG_DARK);
    }
  }

  if (mood === "music") {
    const heights = [3, 6, 9, 7, 11, 5, 8, 4, 7];
    heights.forEach((h, i) => {
      const dh = Math.max(1, Math.round(h * (0.4 + Math.random() * 0.6)));
      const bx = 1 + i * 3;
      for (let by = GRID_H - 1 - dh; by < GRID_H - 1; by++) {
        if (by >= 0 && bx < GRID_W) buffer[by][bx] = FROG_GLOW;
        if (by >= 0 && bx + 1 < GRID_W) buffer[by][bx + 1] = FROG_BODY;
      }
    });
  }
};

// =============================================================================
// 4C. RABBIT RENDERER
// =============================================================================
const RB_WHITE = 15;
const RB_GREY = 16;
const RB_PINK = 17;
const RB_DARK = 18;
const RB_EYE = 19;
const RB_CREAM = 20;

const fillEllipse = (buf, cx, cy, rx, ry, v) => {
  for (let y = Math.ceil(cy - ry - 1); y <= Math.floor(cy + ry + 1); y++)
    for (let x = Math.ceil(cx - rx - 1); x <= Math.floor(cx + rx + 1); x++)
      if (
        x >= 0 &&
        x < GRID_W &&
        y >= 0 &&
        y < GRID_H &&
        ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1
      )
        buf[y][x] = v;
};

const renderRabbit = (buf, state) => {
  const {
    mood,
    lookX,
    lookY,
    blinkOpen,
    mouthOpen,
    yOffset,
    xOffset,
    breathScale,
    frame,
    timePeriod,
    weather,
    hasCrown,
  } = state;

  const CX = GRID_W / 2 - 0.5 + xOffset;
  const CY = 15 - yOffset;
  const br = breathScale * 0.4;

  if (weather === "Rainy") {
    drawClouds(buf, frame, "high");
    drawRain(buf, frame);
  } else if (weather === "Snowy") {
    drawClouds(buf, frame, "low");
    drawSnow(buf, frame);
  } else if (
    mood === "trip" ||
    weather === "Cloudy" ||
    (weather === "Clear" && frame % 200 < 100)
  )
    drawClouds(buf, frame, "normal");

  if (weather !== "Rainy" && weather !== "Snowy") {
    if (timePeriod === "day") {
      drawRect(buf, 27, 2, 3, 3, 4);
      if (frame % 8 < 4) {
        setPixel(buf, 28, 1, 5);
        setPixel(buf, 28, 5, 5);
        setPixel(buf, 26, 3, 5);
        setPixel(buf, 30, 3, 5);
      }
    } else {
      setPixel(buf, 28, 1, 6);
      setPixel(buf, 29, 1, 6);
      setPixel(buf, 27, 2, 6);
      setPixel(buf, 30, 2, 6);
    }
  }

  if (hasCrown) {
    drawRect(buf, CX - 2, CY - 13, 5, 1, 4);
    setPixel(buf, CX - 2, CY - 15, 4);
    setPixel(buf, CX, CY - 15, 4);
    setPixel(buf, CX + 2, CY - 15, 4);
    setPixel(buf, CX + 1, CY - 16, 4);
  }

  fillEllipse(buf, CX - 5, CY - 9, 2.5 + br * 0.3, 7.5, RB_WHITE);
  fillEllipse(buf, CX + 5, CY - 9, 2.5 + br * 0.3, 7.5, RB_WHITE);
  fillEllipse(buf, CX - 5, CY - 13, 1.8, 3.0, RB_GREY);
  fillEllipse(buf, CX + 5, CY - 13, 1.8, 3.0, RB_GREY);
  fillEllipse(buf, CX - 5, CY - 9.5, 1.2, 5.5, RB_PINK);
  fillEllipse(buf, CX + 5, CY - 9.5, 1.2, 5.5, RB_PINK);

  const HR = 9.5 + br;
  drawCircle(buf, CX, CY - 2, HR, RB_WHITE);

  for (let d = 30; d <= 150; d += 12) {
    const rad = (d * Math.PI) / 180;
    setPixel(
      buf,
      CX + (HR - 0.8) * Math.cos(rad),
      CY - 2 + (HR - 0.8) * Math.sin(rad),
      RB_GREY,
    );
  }

  const muzzleCY = CY + 3;
  fillEllipse(buf, CX, muzzleCY, 4.5, 3.5, RB_CREAM);

  const eyeLX = CX - 4.5;
  const eyeRX = CX + 4.5;
  const eyeY = CY - 2.5;

  const sleeping = mood === "sleep";
  const doBlink = !blinkOpen && !sleeping && mood !== "starving";

  if (sleeping) {
    for (let dx = -2; dx <= 2; dx++) {
      const dy = dx === 0 ? 1 : dx === 1 || dx === -1 ? 0 : -1;
      setPixel(buf, eyeLX + dx, eyeY + dy, RB_EYE);
      setPixel(buf, eyeRX + dx, eyeY + dy, RB_EYE);
    }
  } else if (doBlink) {
    for (let dx = -2; dx <= 2; dx++) {
      setPixel(buf, eyeLX + dx, eyeY, RB_EYE);
      setPixel(buf, eyeRX + dx, eyeY, RB_EYE);
    }
  } else if (mood === "starving") {
    for (let i = -2; i <= 2; i++) {
      setPixel(buf, eyeLX + i, eyeY + i, RB_DARK);
      setPixel(buf, eyeLX + i, eyeY - i, RB_DARK);
      setPixel(buf, eyeRX + i, eyeY + i, RB_DARK);
      setPixel(buf, eyeRX + i, eyeY - i, RB_DARK);
    }
  } else if (mood === "tired") {
    fillEllipse(buf, eyeLX, eyeY - 1.5, 2.3, 2.0, RB_WHITE);
    fillEllipse(buf, eyeRX, eyeY - 1.5, 2.3, 2.0, RB_WHITE);
    setPixel(buf, eyeLX, eyeY + 1, RB_EYE);
    setPixel(buf, eyeRX, eyeY + 1, RB_EYE);
    for (let dx = -2; dx <= 2; dx++) {
      setPixel(buf, eyeLX + dx, eyeY - 0.5, RB_GREY);
      setPixel(buf, eyeRX + dx, eyeY - 0.5, RB_GREY);
    }
  } else if (mood === "happy" || mood === "birthday") {
    fillEllipse(buf, eyeLX, eyeY - 1, 2.2, 1.8, RB_WHITE);
    fillEllipse(buf, eyeRX, eyeY - 1, 2.2, 1.8, RB_WHITE);
    drawCircle(buf, eyeLX, eyeY + 1.2, 1.6, RB_EYE);
    drawCircle(buf, eyeRX, eyeY + 1.2, 1.6, RB_EYE);
    setPixel(buf, eyeLX + 1, eyeY + 0.2, RB_WHITE);
    setPixel(buf, eyeRX + 1, eyeY + 0.2, RB_WHITE);
  } else if (mood === "music") {
    drawCircle(buf, eyeLX, eyeY + 0.8, 2.0, RB_EYE);
    drawCircle(buf, eyeLX, eyeY - 1.6, 2.0, RB_WHITE);
    drawCircle(buf, eyeRX, eyeY + 0.8, 2.0, RB_EYE);
    drawCircle(buf, eyeRX, eyeY - 1.6, 2.0, RB_WHITE);
  } else {
    const clx = Math.max(-1.5, Math.min(1.5, lookX));
    const cly = Math.max(-1.0, Math.min(1.0, lookY));
    drawCircle(buf, eyeLX + clx, eyeY + cly, 2.0, RB_EYE);
    drawCircle(buf, eyeRX + clx, eyeY + cly, 2.0, RB_EYE);
    setPixel(buf, eyeLX + clx + 1, eyeY + cly - 1, RB_WHITE);
    setPixel(buf, eyeRX + clx + 1, eyeY + cly - 1, RB_WHITE);
    setPixel(buf, eyeLX + clx - 0.5, eyeY + cly + 0.5, RB_GREY);
    setPixel(buf, eyeRX + clx - 0.5, eyeY + cly + 0.5, RB_GREY);
  }

  const noseY = muzzleCY - 1.5;
  setPixel(buf, CX - 1, noseY, RB_PINK);
  setPixel(buf, CX, noseY - 1, RB_PINK);
  setPixel(buf, CX + 1, noseY, RB_PINK);
  setPixel(buf, CX, noseY, RB_PINK);

  const MY = muzzleCY + 0.5;
  if (mood === "happy" || mood === "birthday" || mood=="work") {
    setPixel(buf, CX - 4, MY, RB_EYE);
    setPixel(buf, CX - 3, MY + 1, RB_EYE);
    setPixel(buf, CX - 2, MY + 2, RB_EYE);
    setPixel(buf, CX - 1, MY + 1, RB_EYE);
    setPixel(buf, CX, MY + 2, RB_EYE);
    setPixel(buf, CX + 1, MY + 1, RB_EYE);
    setPixel(buf, CX + 2, MY + 2, RB_EYE);
    setPixel(buf, CX + 3, MY + 1, RB_EYE);
    setPixel(buf, CX + 4, MY, RB_EYE);
  } else if (mood === "starving") {
    setPixel(buf, CX - 3, MY + 2, RB_EYE);
    setPixel(buf, CX - 2, MY + 1, RB_EYE);
    setPixel(buf, CX - 1, MY, RB_EYE);
    setPixel(buf, CX, MY, RB_EYE);
    setPixel(buf, CX + 1, MY, RB_EYE);
    setPixel(buf, CX + 2, MY + 1, RB_EYE);
    setPixel(buf, CX + 3, MY + 2, RB_EYE);
  } else if (mood === "tired" || mood === "sleep") {
    setPixel(buf, CX - 1, MY, RB_EYE);
    setPixel(buf, CX, MY, RB_EYE);
    setPixel(buf, CX + 1, MY, RB_EYE);
  } else if (mouthOpen) {
    drawCircle(buf, CX, MY + 1, 1.8, RB_EYE);
    setPixel(buf, CX, MY + 1, RB_CREAM);
  } else {
    setPixel(buf, CX, MY, RB_EYE);
    setPixel(buf, CX, MY + 1, RB_EYE);
    setPixel(buf, CX - 1, MY + 1, RB_EYE);
    setPixel(buf, CX - 2, MY + 2, RB_EYE);
    setPixel(buf, CX + 1, MY + 1, RB_EYE);
    setPixel(buf, CX + 2, MY + 2, RB_EYE);
  }

  if (mood === "happy" || mood === "birthday") {
    drawCircle(buf, CX - 8, muzzleCY - 0.5, 2.2, RB_PINK);
    drawCircle(buf, CX + 8, muzzleCY - 0.5, 2.2, RB_PINK);
  } else if (mood !== "starving") {
    setPixel(buf, CX - 7, muzzleCY - 0.5, RB_PINK);
    setPixel(buf, CX + 7, muzzleCY - 0.5, RB_PINK);
  }

  const bodyCY = CY + 9 + br;
  fillEllipse(buf, CX, bodyCY, 8.5 + br, 5.0, RB_WHITE);
  for (let d = 20; d <= 160; d += 10) {
    const rad = (d * Math.PI) / 180;
    setPixel(
      buf,
      CX + (8.2 + br) * Math.cos(rad),
      bodyCY + 4.5 * Math.sin(rad),
      RB_GREY,
    );
  }
  fillEllipse(buf, CX, bodyCY, 4.5, 3.0, RB_CREAM);

  fillEllipse(buf, CX - 4.5, bodyCY + 3.5, 2.5, 1.8, RB_WHITE);
  fillEllipse(buf, CX + 4.5, bodyCY + 3.5, 2.5, 1.8, RB_WHITE);
  setPixel(buf, CX - 5.5, bodyCY + 4.5, RB_DARK);
  setPixel(buf, CX - 4.5, bodyCY + 4.5, RB_DARK);
  setPixel(buf, CX - 3.5, bodyCY + 4.5, RB_DARK);
  setPixel(buf, CX + 3.5, bodyCY + 4.5, RB_DARK);
  setPixel(buf, CX + 4.5, bodyCY + 4.5, RB_DARK);
  setPixel(buf, CX + 5.5, bodyCY + 4.5, RB_DARK);

  drawCircle(buf, CX + 9.5, bodyCY - 1, 3.0, RB_WHITE);
  drawCircle(buf, CX + 9.5, bodyCY - 1, 1.5, RB_CREAM);

  if (mood === "birthday") {
    drawRect(buf, CX - 1.5, CY - 15, 3, 4, 3);
    setPixel(buf, CX, CY - 16, 3);
    setPixel(buf, CX - 2.5, CY - 12, 4);
    setPixel(buf, CX + 2.5, CY - 12, 4);
    setPixel(buf, CX - 9, CY - 8, 3);
    setPixel(buf, CX + 9, CY - 8, 3);
    setPixel(buf, CX - 8, CY - 5, 4);
    setPixel(buf, CX + 8, CY - 5, 4);
  }

  if (mood === "sleep") {
    const zPhase = (frame * 0.04) % 1;
    const z1y = Math.round(CY - 10 - zPhase * 9);
    const z2y = Math.round(CY - 8 - ((zPhase + 0.5) % 1) * 9);
    if (z1y > 0) {
      setPixel(buf, CX + 10, z1y, RB_GREY);
      setPixel(buf, CX + 11, z1y, RB_GREY);
      setPixel(buf, CX + 11, z1y + 1, RB_GREY);
      setPixel(buf, CX + 10, z1y + 2, RB_GREY);
      setPixel(buf, CX + 11, z1y + 2, RB_GREY);
    }
    if (z2y > 0 && z2y < GRID_H - 3) {
      setPixel(buf, CX + 8, z2y, RB_DARK);
      setPixel(buf, CX + 9, z2y, RB_DARK);
      setPixel(buf, CX + 9, z2y + 1, RB_DARK);
      setPixel(buf, CX + 8, z2y + 2, RB_DARK);
      setPixel(buf, CX + 9, z2y + 2, RB_DARK);
    }
  }

  if (mood === "happy" || mood === "birthday") {
    const t = (frame * 0.06) % 1;
    const t2 = (frame * 0.06 + 0.5) % 1;
    const h1y = Math.round(CY - 9 - t * 10);
    const h2y = Math.round(CY - 9 - t2 * 10);
    if (h1y > 0) {
      setPixel(buf, 3, h1y, RB_PINK);
      setPixel(buf, 4, h1y - 1, RB_PINK);
      setPixel(buf, 2, h1y - 1, RB_PINK);
      setPixel(buf, 3, h1y - 2, RB_PINK);
    }
    if (h2y > 0) {
      setPixel(buf, 28, h2y, RB_PINK);
      setPixel(buf, 29, h2y - 1, RB_PINK);
      setPixel(buf, 27, h2y - 1, RB_PINK);
      setPixel(buf, 28, h2y - 2, RB_PINK);
    }
  }

  if (mood === "music") {
    const t = (frame * 0.07) % 1;
    const ny = Math.round(CY - 8 - t * 10);
    if (ny > 0) {
      setPixel(buf, 2, ny, RB_GREY);
      setPixel(buf, 3, ny, RB_GREY);
      setPixel(buf, 3, ny + 1, RB_GREY);
      setPixel(buf, 3, ny + 2, RB_GREY);
      drawCircle(buf, 1.5, ny + 3, 1.2, RB_GREY);
    }
    const hs = [3, 5, 8, 6, 10, 4, 7, 5, 9];
    hs.forEach((h, i) => {
      const dh = Math.max(1, Math.round(h * (0.35 + Math.random() * 0.65)));
      const bx = 1 + i * 3;
      for (let by = GRID_H - 1 - dh; by < GRID_H - 1; by++) {
        if (by >= 0 && bx < GRID_W)
          buf[by][bx] = i % 2 === 0 ? RB_PINK : RB_GREY;
        if (by >= 0 && bx + 1 < GRID_W) buf[by][bx + 1] = RB_WHITE;
      }
    });
  }

  if (mood === "starving") {
    if (Math.floor(frame * 0.1) % 2 === 0) {
      setPixel(buf, 1, CY - 5, RB_PINK);
      setPixel(buf, 1, CY - 4, RB_PINK);
      setPixel(buf, 1, CY - 3, RB_PINK);
      setPixel(buf, 1, CY - 1, RB_PINK);
      setPixel(buf, GRID_W - 2, CY - 5, RB_PINK);
      setPixel(buf, GRID_W - 2, CY - 4, RB_PINK);
      setPixel(buf, GRID_W - 2, CY - 3, RB_PINK);
      setPixel(buf, GRID_W - 2, CY - 1, RB_PINK);
    }
  }
};

// =============================================================================
// 4D. DOT COLOUR MAP
// =============================================================================
const getDotColor = (val, weatherCondition) => {
  switch (val) {
    case 1:
      return THEME.dotActive;
    case 2:
      return THEME.dotDim;
    case 3:
      return THEME.accent;
    case 4:
      return THEME.sunCore;
    case 5:
      return THEME.sunRay;
    case 6:
      return THEME.moonCore;
    case 7:
      return THEME.moonShadow;
    case 8:
      return THEME.dotDim;
    case 9:
      return weatherCondition === "Rainy" ? THEME.rain : THEME.snow;
    case 10:
      return THEME.frogLit;
    case 11:
      return THEME.frogDark;
    case 12:
      return THEME.frogEye;
    case 13:
      return THEME.frogBelly;
    case 14:
      return THEME.frogGlow;
    case 15:
      return THEME.rabWhite;
    case 16:
      return THEME.rabGrey;
    case 17:
      return THEME.rabPink;
    case 18:
      return THEME.rabDark;
    case 19:
      return THEME.rabEye;
    case 20:
      return THEME.rabCream;
    case 21:
      return THEME.pandaPatch;
    case 22:
      return THEME.pandaGlow1;
    case 23:
      return THEME.pandaGlow2;
    case 24:
      return THEME.pandaGlow3;
    default:
      return THEME.dotInactive;
  }
};

// =============================================================================
// 5. HABIT TRACKER COMPONENTS
// =============================================================================
function getWeekId() {
  const d = new Date(),
    jan1 = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-W${Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)}`;
}

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

function DotMatrix({
  value,
  dotSize = 4,
  gap = 1.5,
  color = T.dotLit,
  dimColor = T.dot,
}) {
  const chars = value.split("").map((c) => GLYPH[c] ?? GLYPH["0"]);
  return (
    <View style={{ flexDirection: "column", gap }}>
      {Array.from({ length: 5 }, (_, row) => (
        <View key={row} style={{ flexDirection: "row", gap }}>
          {chars.map((glyph, ci) => (
            <View key={ci} style={{ flexDirection: "row", gap }}>
              {glyph[row].map((lit, col) => (
                <View
                  key={col}
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: lit ? color : dimColor,
                  }}
                />
              ))}
              {ci < chars.length - 1 && <View style={{ width: dotSize }} />}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Ring({
  streak,
  total = 7,
  size = 80,
  strokeWidth = 8,
  checked,
  onPress,
  pulseAnim,
}) {
  const cx = size / 2,
    r = (size - strokeWidth) / 2,
    circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - streak / total);
  const tipAngle = (2 * Math.PI * streak) / total - Math.PI / 2;
  const tipX = cx + r * Math.cos(tipAngle),
    tipY = cx + r * Math.sin(tipAngle);
  const circlePath = `M ${cx} ${cx - r} A ${r} ${r} 0 0 1 ${cx} ${cx + r} A ${r} ${r} 0 0 1 ${cx} ${cx - r}`;
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
        <Svg width={size} height={size}>
          <Defs>
            <Pattern
              id="stipple"
              patternUnits="userSpaceOnUse"
              width="5"
              height="5"
            >
              <Rect width="5" height="5" fill="#000" />
              <Circle cx="1" cy="1" r="0.7" fill={T.dotLit} />
              <Circle
                cx="3.5"
                cy="3.5"
                r="0.5"
                fill={T.dotLit}
                opacity="0.35"
              />
            </Pattern>
            <Mask id="arcMask">
              <Path
                d={circlePath}
                stroke="white"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={offset}
                fill="none"
              />
            </Mask>
            <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <FeGaussianBlur stdDeviation="3" result="blur" />
              <FeMerge>
                <FeMergeNode in="blur" />
                <FeMergeNode in="SourceGraphic" />
              </FeMerge>
            </Filter>
          </Defs>
          <Path
            d={circlePath}
            stroke={T.dot}
            strokeWidth={strokeWidth}
            strokeDasharray="2 4"
            fill="none"
          />
          <Rect
            x={0}
            y={0}
            width={size}
            height={size}
            fill="url(#stipple)"
            mask="url(#arcMask)"
          />
          {streak > 0 && (
            <Circle
              cx={tipX}
              cy={tipY}
              r={strokeWidth / 2 - 1}
              fill={T.accent}
              filter="url(#glow)"
            />
          )}
        </Svg>
        <View
          style={[
            habitStyles.centerButton,
            {
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: (size * 0.4) / 2,
              top: size / 2 - (size * 0.4) / 2,
              left: size / 2 - (size * 0.4) / 2,
              borderColor: checked ? T.dotLit : T.accent,
            },
          ]}
        >
          {checked ? (
            <Svg width={16} height={16} viewBox="0 0 20 20">
              <Path
                d="M4 10.5L8.5 15L16 6"
                stroke={T.dotLit}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          ) : (
            <DotMatrix
              value={`${streak}/7`}
              dotSize={3}
              gap={1}
              color={T.accent}
              dimColor="#1a1a1a"
            />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function DayStrip({ days }) {
  const todayIdx = getTodayIndex();
  return (
    <View style={habitStyles.dayStrip}>
      {DAY_LABELS.map((label, i) => {
        const isToday = i === todayIdx;
        return (
          <View key={i} style={habitStyles.dayCol}>
            <View
              style={[
                habitStyles.dayBar,
                {
                  height: isToday ? 16 : 10,
                  backgroundColor: days[i]
                    ? T.dotLit
                    : isToday
                      ? T.accent
                      : T.dot,
                },
              ]}
            />
            <Text
              style={[
                habitStyles.dayLabel,
                { color: isToday ? T.textMid : T.textDim },
              ]}
            >
              {label[0]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}
function Scanlines() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 40 }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * 5,
            height: 1,
            backgroundColor: "rgba(0,0,0,0.12)",
          }}
        />
      ))}
    </View>
  );
}
function HabitTrackerWidget({ days, onCheckIn, rabbitUnlocked }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.delay(7000),
        Animated.timing(flickerAnim, {
          toValue: 0.85,
          duration: 60,
          useNativeDriver: true,
          easing: Easing.step0,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
          easing: Easing.step0,
        }),
        Animated.timing(flickerAnim, {
          toValue: 0.9,
          duration: 40,
          useNativeDriver: true,
          easing: Easing.step0,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
          easing: Easing.step0,
        }),
      ]),
    );
    flicker.start();
    return () => flicker.stop();
  }, []);
  const todayIdx = getTodayIndex(),
    streak = days.filter(Boolean).length;
  const todayDone = days[todayIdx],
    allDone = streak === 7;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.06,
        duration: 120,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
    ]).start();
    onCheckIn();
  };
  return (
    <Animated.View style={[habitStyles.container, { opacity: flickerAnim }]}>
      <Scanlines />
      <View style={habitStyles.header}>
        <View>
          <Text style={habitStyles.title}>DAYS SINCE INSTAGRAM</Text>
        </View>
        <View style={habitStyles.streakBlock}>
          <Text style={habitStyles.streakLabel}>STREAK</Text>
          <DotMatrix
            value={`${streak}/7`}
            dotSize={3.5}
            gap={1.2}
            color={allDone ? T.accent : T.dotLit}
            dimColor={T.dot}
          />
        </View>
      </View>
      <Ring
        streak={streak}
        checked={todayDone}
        onPress={handlePress}
        pulseAnim={pulseAnim}
      />
      <DayStrip days={days} />
      <View style={habitStyles.footer}>
        <View style={habitStyles.statusRow}>
          <View
            style={[
              habitStyles.statusDot,
              {
                backgroundColor: todayDone ? T.dotLit : T.accent,
                shadowColor: todayDone ? T.dotLit : T.accent,
              },
            ]}
          />
          <Text style={habitStyles.statusText}>
            {allDone
              ? "PERFECT WEEK"
              : todayDone
                ? "LOGGED TODAY"
                : "TAP TO LOG"}
          </Text>
        </View>
        <Text style={habitStyles.dowLabel}>
          {new Date()
            .toLocaleDateString("en", { weekday: "short" })
            .toUpperCase()}
        </Text>
      </View>
      <View style={habitStyles.cornerGlyph} pointerEvents="none">
        {Array.from({ length: 9 }, (_, i) => (
          <View key={i} style={habitStyles.cornerDot} />
        ))}
      </View>

      {/* ── RABBIT UNLOCK REWARD PANEL ─────────────────────────────────── */}
      <View style={habitStyles.rewardRow}>
        {/* 7 greyed/pink dots = progress toward rabbit */}
        <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
          {Array.from({ length: 7 }, (_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i < streak ? "#FFB7C5" : "#1A1A1A",
                borderWidth: i < streak ? 0 : 1,
                borderColor: "#2A2A2A",
              }}
            />
          ))}
        </View>
        <Text style={habitStyles.rewardLabel}>
          {rabbitUnlocked ? "🐇 BUNNY UNLOCKED ✓" : `🔒 BUNNY: ${streak}/7`}
        </Text>
      </View>
    </Animated.View>
  );
}
function NothingText({
  children,
  style,
  variant = "labelUppercasedSmall",
  ...props
}) {
  const textStyle = tokens.textStyles[variant];
  return (
    <Text {...props} style={[textStyle, { color: NOTHING_THEME.text }, style]}>
      {children}
    </Text>
  );
}
// =============================================================================
// MEDITATION TIMER
// =============================================================================
function MeditationTimer({ onComplete }) {
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(300);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopTimer();
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeRemaining]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const stopTimer = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
  };
  const setPresetDuration = (min) => {
    const s = 10;
    setDuration(s);
    setTimeRemaining(s);
    stopTimer();
  };
  const minutes = Math.floor(timeRemaining / 60),
    seconds = timeRemaining % 60;

  return (
    <View style={meditationStyles.section}>
      <NothingText
        variant="ndotHeadlineXSmall"
        style={{ marginBottom: tokens.spacing[2] }}
      >
        ZEN MODE
      </NothingText>
      <NothingText
        variant="ndotHeadlineMedium"
        style={{ marginBottom: tokens.spacing[3] }}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </NothingText>
      <View style={meditationStyles.presetsRow}>
        {[5, 10, 15, 25].map((min) => (
          <Pressable
            key={min}
            style={meditationStyles.presetBtn}
            onPress={() => setPresetDuration(min)}
            hitSlop={15}
          >
            <NothingText
              variant="labelUppercasedMedium"
              style={{ fontSize: 9 }}
            >
              {min}
            </NothingText>
          </Pressable>
        ))}
      </View>
      <View style={meditationStyles.controlsRow}>
        <Pressable
          style={meditationStyles.controlBtn}
          onPress={isRunning ? pauseTimer : startTimer}
          hitSlop={15}
        >
          <NothingText variant="labelUppercasedMedium">
            {isRunning ? "PAUSE" : "START"}
          </NothingText>
        </Pressable>
        <Pressable
          style={meditationStyles.controlBtn}
          onPress={stopTimer}
          hitSlop={15}
        >
          <NothingText variant="labelUppercasedMedium">RESET</NothingText>
        </Pressable>
      </View>
    </View>
  );
}
// =============================================================================
// 7. SPEECH TEXT
// =============================================================================
function FizzBuzz(n) {
  if (n % 15 === 0) return "fizzbuzz";
  if (n % 3 === 0) return "fizz";
  if (n % 2 === 0) return "buzz";
  return null;
}
let batteryConst = 10;

const getFrogSpeech = (mood, battery, event, weather) => {
  let result = "";
  if (weather === "Rainy") result += "RIBBIT! RAIN!\nMY FAVOURITE WEATHER.";
  else if (weather === "Snowy") result += "COLD FROG.\nNEED WARM LILY PAD.";
  else if (mood === "starving")
    result += "CRITICAL HUNGER.\nFLIES. NOW. PLEASE.";
  else if (mood === "birthday")
    result += "RIBBITING PARTY!\nHAPPY BIRTHDAY! 🎉";
  else if (mood === "work") result += "FOCUSED FROG.\nDO NOT DISTURB.";
  else if (mood === "trip") result += "HOPPING ADVENTURE!\nLEAP OF FAITH! 🐸";
  else if (mood === "happy") result += "RIBBIT!\nFEELING FANTASTIC!";
  else if (mood === "music") result += "FROG KARAOKE.\nVIBES: MAXIMUM.";
  else if (event)
    result +=
      `UPCOMING:\n${event.length > 15 ? event.substring(0, 14) + ".." : event}`.toUpperCase();
  else if (battery >= 50) result += "LILY PAD STATUS:\nALL SYSTEMS HOP.";
  else if (battery >= 20) result += "ENERGY LOW...\nNEED FLY SNACK.";
  else result += "HIBERNATING SOON.\nCHARGE THE PAD...";
  result += "\n";
  if (batteryConst !== battery) {
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const fb = FizzBuzz(battery);
    if (fb === "fizzbuzz") result += getRandom(RandomJokes);
    else if (fb === "fizz") result += getRandom(Quotes);
    else if (fb === "buzz") result += getRandom(Reminders);
    else result += `BATTERY: ${battery}%`;
    batteryConst = battery;
  }
  return result;
};

const getRabbitSpeech = (mood, battery, event, weather) => {
  let result = "";
  if (weather === "Rainy") result += "EARS ARE WET.\nNOT. HAPPY.";
  else if (weather === "Snowy") result += "SNOW DAY!\nHOPPING IN POWDER.";
  else if (mood === "disappointed")
    result += "LATE NIGHT AGAIN?\nEARS ARE DROOPING.";
  else if (mood === "starving") result += "WHERE ARE THE\nCARROTS?! CRITICAL.";
  else if (mood === "birthday")
    result += "BINKYING FOR JOY!\nHAPPY BIRTHDAY! 🎉";
  else if (mood === "work") result += "FOCUSED FLOOF.\nNO ZOOMIES NOW.";
  else if (mood === "trip") result += "BIG HOP INCOMING!\nEXPLORING THE WORLD.";
  else if (mood === "happy") result += "BINKIES DETECTED!\nMOOD: MAXIMUM.";
  else if (mood === "music") result += "EARS UP.\nBEAT DETECTED.";
  else if (event)
    result +=
      `UPCOMING:\n${event.length > 15 ? event.substring(0, 14) + ".." : event}`.toUpperCase();
  else if (battery >= 50) result += "FLOOF OPTIMAL.\nEARS: STANDING TALL.";
  else if (battery >= 20) result += "LOW ENERGY...\nNEED CARROT NOW.";
  else result += "BATTERY CRITICAL.\nNAPTIME FORCED. 🐇";
  result += "\n";
  if (batteryConst !== battery) {
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const fb = FizzBuzz(battery);
    if (fb === "fizzbuzz") result += getRandom(RandomJokes);
    else if (fb === "fizz") result += getRandom(Quotes);
    else if (fb === "buzz") result += getRandom(Reminders);
    else result += `BATTERY: ${battery}%`;
    batteryConst = battery;
  }
  return result;
};

const getPandaSpeech = (mood, battery, event, weather) => {
  let result = "";
  if (weather === "Rainy") result += "I HATE GETTING WET.";
  else if (weather === "Snowy") result += "SNOW!\nBUILD A SNOWMAN?";
  else if (mood === "disappointed")
    result += "PLEASE DON'T WATCH\nPHONE AT LATE NIGHT.";
  else if (mood === "starving") result += "CRITICAL ERROR.\nFEED ME POWER!";
  else if (mood === "birthday")
    result += "PARTY MODE ENGAGED!\nHAPPY BIRTHDAY! 🎉";
  else if (mood === "work") result += "DO NOT DISTURB.\nFOCUS MODE ACTIVE.";
  else if (mood === "trip") result += "ADVENTURE TIME!\nENJOY THE JOURNEY! ✈️";
  else if (mood === "happy") result += "YUM!\nENERGY RESTORED!";
  else if (mood === "music") result += "AUDIO DETECTED.\nVIBE CHECK: PASS.";
  else if (event)
    result +=
      `UPCOMING EVENT:\n${event.length > 15 ? event.substring(0, 14) + ".." : event}`.toUpperCase();
  else if (battery >= 50) result += "BATTERY OPTIMAL.\nSYSTEMS GREEN. 🎋";
  else if (battery >= 20) result += "LOW ENERGY...\nEYES HEAVY...";
  else result += "BATTERY CRITICAL.\nSHUTTING DOWN... 😴";
  result += "\n";
  if (batteryConst !== battery) {
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const fb = FizzBuzz(battery);
    if (fb === "fizzbuzz") result += getRandom(RandomJokes);
    else if (fb === "fizz") result += getRandom(Quotes);
    else if (fb === "buzz") result += getRandom(Reminders);
    else result += `CURRENT BATTERY: ${battery}%`;
    batteryConst = battery;
  }
  return result;
};

// =============================================================================
// 8. CHARACTER CAROUSEL  — < [PANDA] [FROG] [RABBIT🔒] >
//    • < > buttons cycle the selection
//    • Tap any card to select it directly
//    • Rabbit locked → faded preview + red lock overlay; tapping shakes + flashes
// =============================================================================
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

// Pixel-art padlock  (7×8 dot grid for a chunky, readable lock)
function PixelLock({ size = 3, color = "#D71921" }) {
  // 0 = off, 1 = shackle, 2 = body, 3 = keyhole
  const grid = [
    [0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2],
    [2, 3, 3, 2, 2],
    [2, 2, 2, 2, 2],
  ];
  const colors = { 0: "transparent", 1: color, 2: color, 3: "#000000" };
  return (
    <View style={{ flexDirection: "column", gap: 1, alignItems: "center" }}>
      {grid.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 1 }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={{
                width: size,
                height: size,
                borderRadius: size * 0.35,
                backgroundColor: colors[cell],
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// Single character card inside the carousel
function CharCard({ id, selected, locked, onPress, onLockedPress }) {
  const icon = CHAR_ICONS[id];
  const COLS = 6,
    ROWS = 5;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (locked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(lockPulse, {
            toValue: 1.15,
            duration: 900,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(lockPulse, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
      ).start();
    } else {
      lockPulse.setValue(1);
    }
  }, [locked]);

  const handlePress = () => {
    if (locked) {
      onLockedPress();
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -5,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 3,
          duration: 35,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -2,
          duration: 35,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 25,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    onPress(id);
  };

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          {
            width: 60,
            alignItems: "center",
            gap: 4,
            paddingVertical: 7,
            paddingHorizontal: 6,
            backgroundColor: selected ? CHAR_BG_ON[id] : "#0A0A0A",
            borderRadius: 10,
            borderWidth: selected ? 1.5 : 1,
            borderColor: selected ? CHAR_BORDER_ON[id] : CHAR_BORDER_OFF[id],
            opacity: pressed ? 0.75 : locked ? 0.45 : 1,
          },
        ]}
      >
        {/* Pixel icon grid */}
        <View style={{ flexDirection: "column", gap: 1.2 }}>
          {Array.from({ length: ROWS }, (_, row) => (
            <View key={row} style={{ flexDirection: "row", gap: 1.2 }}>
              {Array.from({ length: COLS }, (_, col) => (
                <View
                  key={col}
                  style={{
                    width: 3.5,
                    height: 3.5,
                    borderRadius: 1.8,
                    backgroundColor: icon.dots[row * COLS + col]
                      ? icon.color
                      : icon.dim,
                  }}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Name label */}
        <Text
          style={{
            fontFamily: MONO,
            fontSize: 6.5,
            letterSpacing: 0.8,
            fontWeight: "700",
            color: selected ? CHAR_ACCENT[id] : "#444",
          }}
        >
          {CHAR_EMOJI[id]} {CHAR_LABELS[id]}
        </Text>

        {/* Active dot indicator */}
        {selected && (
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: CHAR_ACCENT[id],
              shadowColor: CHAR_ACCENT[id],
              shadowRadius: 3,
              shadowOpacity: 0.9,
            }}
          />
        )}
      </Pressable>

      {/* Lock overlay — sits on top, centred, only when locked */}
      {locked && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: lockPulse }],
              backgroundColor: "#00000088",
              borderRadius: 8,
              padding: 4,
              alignItems: "center",
              gap: 2,
            }}
          >
            <PixelLock size={3.5} color="#D71921" />
            <Text
              style={{
                fontFamily: MONO,
                fontSize: 5.5,
                color: "#D71921",
                letterSpacing: 0.5,
                fontWeight: "700",
              }}
            >
              LOCKED
            </Text>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

// Main carousel: < [card] [card] [card] >
function CharacterCarousel({
  character,
  onSelect,
  rabbitUnlocked,
  onLockedPress,
}) {
  const streak = 0; // passed separately via prop below
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigate = (dir) => {
    const curr = CHAR_ORDER.indexOf(character);
    let next = (curr + dir + CHAR_ORDER.length) % CHAR_ORDER.length;
    // If navigating to locked rabbit, still allow preview — but if user tries to select, lock fires
    const targetId = CHAR_ORDER[next];
    if (targetId === "rabbit" && !rabbitUnlocked) {
      onLockedPress();
      // Light wobble on the whole carousel
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: dir * 4,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    onSelect(targetId);
  };

  return (
    <View style={carouselStyles.wrapper}>
      {/* ← button */}
      <Pressable
        onPress={() => navigate(-1)}
        style={({ pressed }) => [
          carouselStyles.navBtn,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <Text style={carouselStyles.navText}>{"‹"}</Text>
      </Pressable>

      {/* All 3 character cards */}
      <Animated.View
        style={{
          flexDirection: "row",
          gap: 5,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {CHAR_ORDER.map((id) => (
          <CharCard
            key={id}
            id={id}
            selected={character === id}
            locked={id === "rabbit" && !rabbitUnlocked}
            onPress={onSelect}
            onLockedPress={onLockedPress}
          />
        ))}
      </Animated.View>

      {/* → button */}
      <Pressable
        onPress={() => navigate(1)}
        style={({ pressed }) => [
          carouselStyles.navBtn,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <Text style={carouselStyles.navText}>{"›"}</Text>
      </Pressable>
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
  },
  navBtn: {
    width: 20,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  navText: {
    color: "#666",
    fontSize: 18,
    fontFamily: MONO,
    lineHeight: 20,
  },
});

// ── Small streak progress bar shown below carousel when rabbit locked ─────────
function RabbitLockProgress({ streak, unlocked }) {
  if (unlocked) {
    return (
      <View style={lockedStyles.progressRow}>
        {Array.from({ length: 7 }, (_, i) => (
          <View
            key={i}
            style={[lockedStyles.pip, { backgroundColor: "#FFB7C5" }]}
          />
        ))}
        <Text style={[lockedStyles.pipLabel, { color: "#FFB7C5" }]}>
          🐇 UNLOCKED!
        </Text>
      </View>
    );
  }
  const filled = Math.min(streak, 7);
  return (
    <View style={lockedStyles.progressRow}>
      {Array.from({ length: 7 }, (_, i) => (
        <View
          key={i}
          style={[
            lockedStyles.pip,
            {
              backgroundColor: i < filled ? "#FFB7C544" : "#1A1A1A",
              borderWidth: i < filled ? 0 : 1,
              borderColor: "#2A2A2A",
            },
          ]}
        />
      ))}
      <Text style={lockedStyles.pipLabel}>{filled}/7 🔒</Text>
    </View>
  );
}

// ── Lock modal: live preview hint + unlock requirements ────────────────────
function LockedCharacterModal({ visible, streak, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.4)),
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
    }
  }, [visible]);

  const filled = Math.min(streak, 7);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dim backdrop — tap to dismiss */}
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            modalStyles.panel,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          // Stop backdrop tap propagating through the panel
          onStartShouldSetResponder={() => true}
        >
          {/* ── HEADER ────────────────────────────────────────────────── */}
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <Text style={modalStyles.headerChip}>🔒 LOCKED CHARACTER</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={modalStyles.closeBtn}
              hitSlop={12}
            >
              <Text style={modalStyles.closeTxt}>✕</Text>
            </Pressable>
          </View>

          {/* ── LIVE PREVIEW INDICATOR ───────────────────────────────── */}
          <View style={modalStyles.livePreviewBanner}>
            <View style={modalStyles.liveDot} />
            <Text style={modalStyles.livePreviewText}>
              LIVE PREVIEW ACTIVE — SEE DISPLAY BEHIND
            </Text>
          </View>

          {/* ── UNLOCK REQUIREMENT TEXT ────────────────────────────────── */}
          <View style={modalStyles.infoBlock}>
            <Text style={modalStyles.charName}>🐇 BUNNY</Text>
            <Text style={modalStyles.lockTitle}>UNLOCK REQUIRED</Text>
            <Text style={modalStyles.lockBody}>
              Complete a{" "}
              <Text style={modalStyles.highlight}>7/7 perfect week</Text> on
              {"\n"}the Habit Tracker to unlock this character.
            </Text>
          </View>

          {/* ── PROGRESS BAR ──────────────────────────────────────────── */}
          <View style={modalStyles.progressSection}>
            <Text style={modalStyles.progressTitle}>YOUR PROGRESS</Text>
            <View style={modalStyles.pipRow}>
              {Array.from({ length: 7 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    modalStyles.pip,
                    i < filled
                      ? {
                          backgroundColor: "#FFB7C5",
                          shadowColor: "#FFB7C5",
                          shadowRadius: 4,
                          shadowOpacity: 0.7,
                        }
                      : {
                          backgroundColor: "#1A1A1A",
                          borderWidth: 1,
                          borderColor: "#2A2A2A",
                        },
                  ]}
                />
              ))}
            </View>
            <Text style={modalStyles.progressCount}>
              {filled === 7
                ? "✓ COMPLETE! Tap the 🐇 BUNNY card to play!"
                : `${filled} / 7 days — ${7 - filled} more to go`}
            </Text>
          </View>

          {/* ── HOW-TO HINT ───────────────────────────────────────────── */}
          <View style={modalStyles.hintBox}>
            <Text style={modalStyles.hintText}>
              → Swipe right to the{" "}
              <Text style={modalStyles.highlight}>HABITS</Text> page
              {"\n"}→ Tap the ring each day to check in
              {"\n"}→ 7 in a row = bunny unlocked! 🐾
            </Text>
          </View>

          {/* ── DISMISS BUTTON ────────────────────────────────────────── */}
          <Pressable
            style={({ pressed }) => [
              modalStyles.dismissBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onClose}
          >
            <Text style={modalStyles.dismissTxt}>GOT IT</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  panel: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#0D0D0D",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#2A1A1A",
    overflow: "hidden",
    paddingBottom: 18,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerChip: {
    fontFamily: MONO,
    fontSize: 9,
    color: "#D71921",
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  closeTxt: { color: "#666", fontSize: 11, fontFamily: MONO },

  // Live preview banner (replaces static ghost)
  livePreviewBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
    backgroundColor: "#0A1400",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#39FF1433",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39FF14",
    shadowColor: "#39FF14",
    shadowRadius: 4,
    shadowOpacity: 0.9,
  },
  livePreviewText: {
    fontFamily: MONO,
    fontSize: 7,
    color: "#39FF14",
    letterSpacing: 0.8,
    fontWeight: "700",
    flex: 1,
  },

  // Info block
  infoBlock: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 4,
    alignItems: "center",
  },
  charName: {
    fontFamily: MONO,
    fontSize: 13,
    color: "#FFB7C5",
    letterSpacing: 2,
    fontWeight: "700",
  },
  lockTitle: {
    fontFamily: MONO,
    fontSize: 8,
    color: "#D71921",
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: 2,
  },
  lockBody: {
    fontFamily: MONO,
    fontSize: 9,
    color: "#666",
    letterSpacing: 0.5,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 4,
  },
  highlight: {
    color: "#FFB7C5",
    fontWeight: "700",
  },

  // Progress
  progressSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 8,
    alignItems: "center",
  },
  progressTitle: {
    fontFamily: MONO,
    fontSize: 7,
    color: "#444",
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  pipRow: { flexDirection: "row", gap: 7 },
  pip: {
    width: 26,
    height: 10,
    borderRadius: 5,
  },
  progressCount: {
    fontFamily: MONO,
    fontSize: 8,
    color: "#555",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // How-to hint box
  hintBox: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },
  hintText: {
    fontFamily: MONO,
    fontSize: 8.5,
    color: "#555",
    letterSpacing: 0.4,
    lineHeight: 15,
  },

  // Dismiss button
  dismissBtn: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: "#1A0000",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D7192155",
  },
  dismissTxt: {
    fontFamily: MONO,
    fontSize: 11,
    color: "#D71921",
    letterSpacing: 2,
    fontWeight: "700",
  },
});

// =============================================================================
// 9. MAIN WIDGET
// =============================================================================
function PandaWidget() {
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [partyActive, setPartyActive] = useState(false);
  const [timePeriod, setTimePeriod] = useState("day");
  const [weatherData, setWeatherData] = useState(null);
  const [frame, setFrame] = useState(0);
  const [blink, setBlink] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [overrideMood, setOverrideMood] = useState(null);
  const animValue = useRef(new Animated.Value(0)).current;
  const [animFrameVal, setAnimFrameVal] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
const [habitDays, setHabitDays] = useState(() => {
    const todayIdx = getTodayIndex();
    // Creates an array where every day is true EXCEPT today
    return Array.from({ length: 7 }, (_, i) => i !== todayIdx);
  });
  const [meditationDone, setMeditationDone] = useState(false);
  const [character, setCharacter] = useState("panda");
  const [lockedFlash, setLockedFlash] = useState(false); // shake/flash feedback
  const [showLockedModal, setShowLockedModal] = useState(false); // locked-rabbit detail modal
  const [previewCharacter, setPreviewCharacter] = useState(null); // live preview of locked char in matrix

  // Rabbit is unlocked when all 7 days in the current week are checked
  const rabbitUnlocked = habitDays.filter(Boolean).length === 7;
// const rabbitUnlocked=true
  const getCalculatedMood = () => {
    if (timePeriod === "late-night") return "disappointed";
    if (batteryLevel < 20) return "starving";
    if (overrideMood) return overrideMood;
    if (currentEvent) {
      if (partyActive && /birthday|party/i.test(currentEvent))
        return "birthday";
      if (/trip|flight|travel|vacation/i.test(currentEvent)) return "trip";
      if (/meeting|work/i.test(currentEvent)) return "work";
    }
    if (batteryLevel < 40) return "tired";
    return "idle";
  };

  const currentMood = getCalculatedMood();
  const isHabitDoneToday = habitDays[getTodayIndex()];

  useEffect(() => {
    const init = async () => {
      const level = await DeviceInfo.getBatteryLevel();
      setBatteryLevel(100);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&current_weather=true`,
        );
        const data = await res.json();
        const code =  data.current_weather.weathercode;
        let cond = "Clear";
        if (code > 3) cond = "Cloudy";
        if (code >= 51 && code <= 67) cond = "Rainy";
        if (code >= 71) cond = "Snowy";
        setWeatherData({
          temp: Math.round(data.current_weather.temperature),
          condition: cond,
        });
      }
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { week, data } = JSON.parse(raw);
          if (week === getWeekId()) setHabitDays(data);
        }
      } catch (_) {}
      try {
        const savedDate = await AsyncStorage.getItem("last_meditation_date");
        if (savedDate === new Date().toDateString()) setMeditationDone(true);
      } catch (_) {}
    };
    init();
    const timeInterval = setInterval(() => {
      const h = new Date().getHours();
      setTimePeriod(
        h >= 22 || h < 6 ? "late-night" : h >= 18 ? "evening" : "day",
      );
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  const handleHabitCheckIn = async () => {
    const todayIdx = getTodayIndex();
    const next = [...habitDays];
    const isNowDone = !next[todayIdx];
    next[todayIdx] = isNowDone;
    setHabitDays(next);
    if (isNowDone) {
      setOverrideMood("happy");
      setTimeout(() => setOverrideMood(null), 3000);
    }
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ week: getWeekId(), data: next }),
      );
    } catch (_) {}
  };
  const handleMeditationComplete = async () => {
    setMeditationDone(true);
    setOverrideMood("happy");
    setTimeout(() => setOverrideMood(null), 3000);
    try {
      await AsyncStorage.setItem(
        "last_meditation_date",
        new Date().toDateString(),
      );
    } catch (_) {}
  };

  useEffect(() => {
    animValue.setValue(0);
    const isHappy = ["happy", "birthday"].includes(currentMood);
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: isHappy ? 200 : 1500,
          easing: isHappy ? Easing.out(Easing.quad) : Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: isHappy ? 200 : 1500,
          easing: isHappy ? Easing.in(Easing.quad) : Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        ...(isHappy ? [Animated.delay(100)] : []),
      ]),
    );
    bounce.start();
    const loop = setInterval(() => {
      setFrame((f) => f + 1);
      if (Math.random() > 0.96) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      }
      if (Math.random() > 0.92)
        setLook({
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 1.5,
        });
    }, 100);
    const listenerId = animValue.addListener(({ value }) =>
      setAnimFrameVal(value),
    );
    return () => {
      clearInterval(loop);
      animValue.removeListener(listenerId);
    };
  }, [currentMood]);

  const handleBoop = () => {
    if (currentMood === "starving" || currentMood === "disappointed") return;
    setOverrideMood("happy");
    setTimeout(() => setOverrideMood(null), 2500);
  };
  const toggleMusic = () => {
    if (currentMood === "disappointed") return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOverrideMood((m) => (m === "music" ? null : "music"));
  };
  const toggleSleep = () =>
    setOverrideMood((m) => (m === "sleep" ? null : "sleep"));

  // Called by carousel's < > nav (locked rabbit is handled inside CharacterCarousel)
  const toggleCharacter = () => {
    setCharacter((c) => {
      const curr = CHAR_ORDER.indexOf(c);
      let next = (curr + 1) % CHAR_ORDER.length;
      if (CHAR_ORDER[next] === "rabbit" && !rabbitUnlocked)
        next = (next + 1) % CHAR_ORDER.length;
      return CHAR_ORDER[next];
    });
  };

  // Called when user taps the locked rabbit card — opens the detail modal
  const handleLockedPress = () => {
    setPreviewCharacter("rabbit"); // ← show rabbit live in the dot matrix
    setShowLockedModal(true);
    setLockedFlash(true);
    setTimeout(() => setLockedFlash(false), 1200);
  };

  // Closes the locked modal and clears the live preview
  const handleModalClose = () => {
    setShowLockedModal(false);
    setPreviewCharacter(null);
  };

  // If the week resets and rabbit loses eligibility, fall back to panda
  useEffect(() => {
    if (!rabbitUnlocked && character === "rabbit") {
      setCharacter("panda");
    }
  }, [rabbitUnlocked]);

  let yOffset = animFrameVal * 1,
    breathScale = animFrameVal * 0.5,
    xOffset = 0;
  if (["happy", "birthday"].includes(currentMood)) {
    yOffset = animFrameVal * 2;
    breathScale = 0;
  } else if (currentMood === "sleep") {
    yOffset = 0;
    breathScale = animFrameVal * 0.5;
  } else if (currentMood === "tired") yOffset = animFrameVal * 0.5;
  else if (currentMood === "work") yOffset = animFrameVal * 0.3;
  else if (currentMood === "starving") {
    yOffset = 0;
    xOffset = animFrameVal * 0.8;
  } else if (currentMood === "disappointed") {
    yOffset = 0;
    breathScale = animFrameVal * 0.2;
  }
  if (currentMood === "trip") look.x = animFrameVal * 2.5;

  const buffer = createBuffer();
  // When previewing a locked character, render that instead of the active one
  const renderTarget = previewCharacter || character;
  const sharedState = {
    mood: previewCharacter ? "idle" : currentMood,
    lookX: look.x,
    lookY: look.y,
    blinkOpen: !blink && currentMood !== "sleep" && currentMood !== "starving",
    mouthOpen: currentMood === "music" && animFrameVal > 0.5,
    yOffset: previewCharacter ? animFrameVal * 0.8 : yOffset,
    xOffset,
    breathScale: previewCharacter ? animFrameVal * 0.4 : breathScale,
    frame,
    timePeriod,
    weather: previewCharacter ? null : weatherData?.condition,
    hasCrown: previewCharacter ? false : isHabitDoneToday,
    isZen: meditationDone,
  };

  if (renderTarget === "frog") renderFrog(buffer, sharedState);
  else if (renderTarget === "rabbit") renderRabbit(buffer, sharedState);
  else renderPanda(buffer, sharedState);

  const getScreenColor = () =>
    timePeriod === "late-night"
      ? THEME.bgLateNight
      : timePeriod === "evening"
        ? THEME.bgEvening
        : THEME.bgDay;

  const speechText =
    character === "frog"
      ? getFrogSpeech(
          currentMood,
          batteryLevel,
          currentEvent,
          weatherData?.condition,
        )
      : character === "rabbit"
        ? getRabbitSpeech(
            currentMood,
            batteryLevel,
            currentEvent,
            weatherData?.condition,
          )
        : getPandaSpeech(
            currentMood,
            batteryLevel,
            currentEvent,
            weatherData?.condition,
          );

  const screenLabel =
    character === "frog"
      ? "[FROG.SYS]"
      : character === "rabbit"
        ? "[BUNNY.OS]"
        : "[Playful Panda]";

  const charAccent =
    character === "frog"
      ? THEME.frogLit
      : character === "rabbit"
        ? THEME.rabPink
        : THEME.text;

  return (
    <View style={pandaStyles.container}>
      <View
        style={pandaStyles.deviceShell}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View style={{ flex: 1, overflow: "hidden", borderRadius: 16 }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {/* PAGE 1: CHARACTER + MEDITATION */}
            <View style={{ width: containerWidth, height: "100%" }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 0 }}
                nestedScrollEnabled
              >
                {/* ── TOP WIDGET ROW: matrix + info side-by-side ── */}
                <View style={pandaStyles.widgetRow}>
                  {/* DOT MATRIX — tight black screen */}
                  <View
                    style={[
                      pandaStyles.screenContainer,
                      { backgroundColor: getScreenColor() },
                    ]}
                  >
                    {/* Matrix dots — dimmed when showing a locked preview */}
                    <View style={{ opacity: previewCharacter ? 0.42 : 1 }}>
                      {buffer.map((row, y) => (
                        <View key={y} style={pandaStyles.row}>
                          {row.map((val, x) => (
                            <View
                              key={x}
                              style={[
                                pandaStyles.dot,
                                {
                                  backgroundColor: getDotColor(
                                    val,
                                    weatherData?.condition,
                                  ),
                                },
                              ]}
                            />
                          ))}
                        </View>
                      ))}
                    </View>

                    {/* Lock overlay — shown only when previewing locked rabbit */}
                    {previewCharacter && (
                      <View
                        style={pandaStyles.matrixLockOverlay}
                        pointerEvents="none"
                      >
                        {/* Top-right corner chip */}
                        <View style={pandaStyles.matrixLockChip}>
                          <PixelLock size={3} color="#D71921" />
                          <Text style={pandaStyles.matrixLockText}>
                            PREVIEW
                          </Text>
                        </View>
                        {/* Bottom banner */}
                        <View style={pandaStyles.matrixLockBanner}>
                          <Text style={pandaStyles.matrixLockBannerText}>
                            🔒 7/7 TO UNLOCK
                          </Text>
                        </View>
                      </View>
                    )}

                    <Pressable
                      style={StyleSheet.absoluteFill}
                      onPress={previewCharacter ? handleModalClose : handleBoop}
                    />
                  </View>

                  {/* RIGHT INFO COLUMN */}
                  <View style={pandaStyles.rightCol}>
                    {/* CHARACTER CAROUSEL */}
                    <CharacterCarousel
                      character={character}
                      onSelect={(id) => setCharacter(id)}
                      rabbitUnlocked={rabbitUnlocked}
                      onLockedPress={handleLockedPress}
                    />

                    {/* Lock progress bar under the carousel */}
                    <RabbitLockProgress
                      streak={habitDays.filter(Boolean).length}
                      unlocked={rabbitUnlocked}
                    />

                    {/* Locked flash message */}
                    {lockedFlash && (
                      <View style={lockedStyles.flashMsg}>
                        <Text style={lockedStyles.flashText}>
                          🔒 7/7 STREAK REQUIRED!
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        pandaStyles.speechBubble,
                        { borderColor: charAccent + "44" },
                      ]}
                    >
                      <Text style={pandaStyles.speechLabel}>{screenLabel}</Text>
                      <Text style={pandaStyles.speechValue} numberOfLines={4}>
                        {speechText}
                      </Text>
                    </View>

                    <Text
                      style={[
                        pandaStyles.batteryDisplay,
                        { color: charAccent },
                      ]}
                    >
                      {weatherData ? `${weatherData.temp}°C | ` : ""}
                      {batteryLevel}%
                    </Text>

                    {/* Inline micro-controls */}
                    <View style={pandaStyles.microControls}>
                      <Pressable
                        style={pandaStyles.microBtn}
                        onPress={toggleMusic}
                      >
                        <Text style={pandaStyles.microBtnText}>
                          {currentMood === "music" ? "⏹" : "🎵"}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={pandaStyles.microBtn}
                        onPress={handleBoop}
                      >
                        <Text style={pandaStyles.microBtnText}>
                          {character === "frog"
                            ? "🪰"
                            : character === "rabbit"
                              ? "🥕"
                              : "🎋"}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={pandaStyles.microBtn}
                        onPress={toggleSleep}
                      >
                        <Text style={pandaStyles.microBtnText}>
                          {currentMood === "sleep" ? "☀️" : "💤"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* STATUS BAR */}
                <View style={pandaStyles.statusBar}>
                  <Text style={pandaStyles.statusText}>
                    STATUS:{" "}
                    <Text style={{ color: "#fff" }}>
                      {currentMood.toUpperCase()}
                    </Text>
                  </Text>
                  <Text style={pandaStyles.scrollHint}>↓ SCROLL → HABITS</Text>
                </View>

                {/* MEDITATION */}
                <View style={{ marginTop: 8, paddingHorizontal: 8 }}>
                  <MeditationTimer onComplete={handleMeditationComplete} />
                </View>
              </ScrollView>
            </View>

            {/* PAGE 2: HABIT TRACKER */}
            <View
              style={{
                width: containerWidth,
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <HabitTrackerWidget
                days={habitDays}
                onCheckIn={handleHabitCheckIn}
                rabbitUnlocked={rabbitUnlocked}
              />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ── LOCKED RABBIT MODAL ─────────────────────────────────────── */}
      <LockedCharacterModal
        visible={showLockedModal}
        streak={habitDays.filter(Boolean).length}
        onClose={handleModalClose}
      />
    </View>
  );
}

// =============================================================================
// 10. STYLES — compact widget sizing
// =============================================================================
const pandaStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Outer shell: tight border, small padding ──────────────────────────────
  deviceShell: {
    width: "96%",
    maxWidth: 400,
    height: "96%",
    backgroundColor: "#000",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    padding: 4,
  },

  // ── Main top row: matrix + right info col ─────────────────────────────────
  widgetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 6,
    paddingTop: 8,
  },

  // ── The dot-matrix screen: no fixed height → sized by content ─────────────
  screenContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 3, // tight inner padding
    alignSelf: "flex-start", // shrink-wrap to matrix size
  },

  row: { flexDirection: "row" },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    margin: DOT_GAP / 2,
  },

  // ── Lock preview overlay on dot matrix ────────────────────────────────────
  matrixLockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D7192155",
    justifyContent: "space-between",
    padding: 4,
  },
  matrixLockChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-end",
    backgroundColor: "rgba(0,0,0,0.80)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D7192166",
  },
  matrixLockText: {
    fontFamily: MONO,
    fontSize: 5.5,
    color: "#D71921",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  matrixLockBanner: {
    alignSelf: "stretch",
    backgroundColor: "rgba(0,0,0,0.82)",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D7192144",
    alignItems: "center",
  },
  matrixLockBannerText: {
    fontFamily: MONO,
    fontSize: 6,
    color: "#D71921",
    letterSpacing: 1,
    fontWeight: "700",
  },

  // ── Right column: character info ──────────────────────────────────────────
  rightCol: {
    flex: 1,
    gap: 5,
    paddingTop: 2,
    minWidth: 0, // allow flex shrink
  },

  speechBubble: {
    backgroundColor: THEME.panel,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    minHeight: 80,
  },
  speechLabel: {
    color: THEME.textDim,
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: 0.8,
  },
  speechValue: {
    color: THEME.text,
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    lineHeight: 13,
    letterSpacing: 0.3,
  },

  batteryDisplay: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  // ── Micro control row (emoji buttons) ─────────────────────────────────────
  microControls: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  microBtn: {
    backgroundColor: "#1A1A1A",
    borderRadius: 6,
    padding: 5,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  microBtnText: { fontSize: 14 },

  // ── Status bar ─────────────────────────────────────────────────────────────
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  statusText: {
    color: "#444",
    fontSize: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 0.5,
  },
  scrollHint: {
    color: "#333",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
});

const habitStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: T.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sysLabel: {
    fontFamily: MONO,
    fontSize: 7,
    color: T.textDim,
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: {
    fontFamily: MONO,
    fontSize: 10,
    color: T.text,
    letterSpacing: 1.2,
    fontWeight: "700",
    lineHeight: 14,
  },
  streakBlock: { alignItems: "flex-end", gap: 3 },
  streakLabel: {
    fontFamily: MONO,
    fontSize: 6,
    color: T.textDim,
    letterSpacing: 1,
  },
  centerButton: {
    position: "absolute",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  dayStrip: { flexDirection: "row", gap: 5, alignItems: "flex-end" },
  dayCol: { alignItems: "center", gap: 3 },
  dayBar: { width: 5, borderRadius: 2.5 },
  dayLabel: { fontFamily: MONO, fontSize: 6, letterSpacing: 0.4 },
  footer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    fontFamily: MONO,
    fontSize: 7,
    color: T.textMid,
    letterSpacing: 1.2,
  },
  dowLabel: {
    fontFamily: MONO,
    fontSize: 6,
    color: T.textDim,
    letterSpacing: 1,
  },
  cornerGlyph: {
    position: "absolute",
    bottom: 8,
    right: 10,
    width: 11,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    opacity: 0.15,
  },
  cornerDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: T.dotLit,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    marginTop: 4,
  },
  rewardLabel: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 0.8,
    color: "#666",
  },
});

const meditationStyles = StyleSheet.create({
  section: {
    alignItems: "center",
    width: "100%",
    padding: tokens.spacing[3.5],
    backgroundColor: NOTHING_THEME.surface,
    borderRadius: tokens.borderRadius.xl,
    borderWidth: tokens.borderWidth[1],
    borderColor: NOTHING_THEME.border,
  },
  presetsRow: {
    flexDirection: "row",
    gap: tokens.spacing[1.5],
    marginBottom: tokens.spacing[3.5],
  },
  presetBtn: {
    backgroundColor: NOTHING_THEME.bg,
    width: 28,
    height: 28,
    borderRadius: tokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: tokens.borderWidth[1],
    borderColor: NOTHING_THEME.border,
  },
  controlsRow: {
    flexDirection: "row",
    gap: tokens.spacing[1.5],
  },
  controlBtn: {
    backgroundColor: NOTHING_THEME.bg,
    width: 70,
    height: 34,
    borderRadius: tokens.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: tokens.borderWidth[1],
    borderColor: NOTHING_THEME.border,
  },
});

// =============================================================================
// 10B. LOCK / CAROUSEL STYLES
// =============================================================================
const lockedStyles = StyleSheet.create({
  // Streak progress pip-row shown under carousel
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 2,
  },
  pip: {
    width: 7,
    height: 5,
    borderRadius: 2.5,
  },
  pipLabel: {
    fontFamily: MONO,
    fontSize: 6.5,
    color: "#3A3A3A",
    letterSpacing: 0.5,
    marginLeft: 2,
  },

  // Flash message when locked character is tapped
  flashMsg: {
    backgroundColor: "#1A0000",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#D7192166",
    alignItems: "center",
  },
  flashText: {
    fontFamily: MONO,
    fontSize: 7.5,
    color: "#D71921",
    letterSpacing: 0.8,
    fontWeight: "700",
    textAlign: "center",
  },

  // Habit tracker reward row (bottom of habit page)
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0A1A0A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FFB7C566",
  },
  unlockedText: {
    fontFamily: MONO,
    fontSize: 7,
    color: "#FFB7C5",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
});

// =============================================================================
// 11. ENTRY POINT
// =============================================================================
export default function App() {
  return (
    <WithCalendarReadPermission>
      <PandaWidget />
    </WithCalendarReadPermission>
  );
}
