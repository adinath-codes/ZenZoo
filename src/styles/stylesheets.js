import {
    DOT_GAP,
    DOT_SIZE,
    MONO,
    NOTHING_THEME,
    T,
    THEME,
} from "../../constants/consts";
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

export {
    carouselStyles, habitStyles, lockedStyles, meditationStyles, modalStyles,
    pandaStyles
};

