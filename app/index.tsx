import { PandaWidget, WithCalendarReadPermission } from "@/App";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

// --- Helper Component for the Nothing OS Styled Cards ---
const GuideCard = ({ number, title, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.redDot} />
      <Text style={styles.sectionTitle}>
        [{number}] {title}
      </Text>
    </View>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

const Highlight = ({ children }) => (
  <Text style={{ color: "#fff", fontWeight: "800" }}>{children}</Text>
);

export default function App() {
  return (
    <WithCalendarReadPermission>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* --- TOP: The Widget (60%) --- */}
        <View
          style={{ flex: 0.6, justifyContent: "center", alignItems: "center" }}
        >
          <PandaWidget />
        </View>

        {/* --- BOTTOM: The Evaluation & Features Guide (40%) --- */}
        <View style={styles.sheetContainer}>
          {/* Subtle drag handle for aesthetic */}
          <View style={styles.dragHandle} />

          <Text style={styles.mainTitle}>ZEN ZOO: KEY FEATURES & GUIDE</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <GuideCard number="1" title="ENGINE & NAVIGATION">
              <Text style={styles.bullet}>
                • <Highlight>CUSTOM 2D ENGINE:</Highlight> Procedurally
                generated dot-matrix pixel art powered by React Native SVG and
                math-based layout animations for a butter-smooth experience.
              </Text>
              <Text style={styles.bullet}>
                • <Highlight>SWIPE</Highlight> down or right anywhere on the
                widget to switch between the Virtual Pet and the Habit Tracker.
              </Text>
            </GuideCard>

            <GuideCard number="2" title="HEALTH & CONTEXT AWARENESS">
              <Text style={styles.bullet}>
                • <Highlight>SYSTEM-SYNCED HEALTH:</Highlight> Energy is linked
                to your device's metabolism. Battery drops = tired pet. Plug it
                in for a real-time healing animation!
              </Text>
              <Text style={styles.bullet}>
                • <Highlight>CONTEXT COMPANION:</Highlight> Syncs with your
                schedule. Raining outside? They grab an umbrella. Calendar
                meeting? They automatically suit up in a tie.
              </Text>
            </GuideCard>

            <GuideCard number="3" title="DIGITAL WELLBEING & ZEN">
              <Text style={styles.bullet}>
                • <Highlight>NIGHTTIME NUDGE:</Highlight> Doom-scrolling at 2
                AM? Your pet gets visibly disappointed to gently nudge you
                offline.
              </Text>
              <Text style={styles.bullet}>
                • <Highlight>MEDITATION TIMER:</Highlight> Need a break? Tap a
                preset (5, 10, 15m) and hit START to find focus. Completing it
                triggers a 'Happy' mood override!
              </Text>
            </GuideCard>

            <GuideCard number="4" title="HABITS & CHARACTER ZOO">
              <Text style={styles.bullet}>
                • <Highlight>GAMIFIED TRACKER:</Highlight> Reclaim time tracking
                your social media detox. Tap the large central ring to log
                progress and award your pet a victory crown.
              </Text>
              <Text style={styles.bullet}>
                • <Highlight>THE CHARACTER ZOO:</Highlight> Use ‹ and › to swap
                between the Playful Panda and To-Do Frog. Hit a perfect 7-day
                streak to break the virtual lock and earn the elusive Habit
                Rabbit!
              </Text>
            </GuideCard>
          </ScrollView>
        </View>
      </View>
    </WithCalendarReadPermission>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 0.4,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderColor: "#222",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  mainTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2.5,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 30,
    gap: 12, // React Native gap for clean spacing between cards
  },
  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D71921", // Nothing Red
    marginRight: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  cardBody: {
    paddingLeft: 14, // Indent bullets to align with text
  },
  bullet: {
    color: "#888",
    fontSize: 10,
    lineHeight: 16,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
