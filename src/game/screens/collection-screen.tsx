import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { creatureArt } from "../assets";
import { CREATURES, PLAYER_IDS, ENCOUNTERS } from "../data";
import { ElementBadge, GameButton, Panel } from "../components/game-ui";
import { useGame } from "../game-context";
import { elementColors, elementGlows, fonts, palette } from "../theme";
import type { CreatureId } from "../types";

const CREATURE_ORDER: CreatureId[] = PLAYER_IDS;

export function CollectionScreen() {
  const { save, setActiveCompanion, returnToMap } = useGame();
  const ownedCount = PLAYER_IDS.filter((id) => save.ownedCreatureIds.includes(id)).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>FIELD GUIDE</Text>
          <Text style={styles.title}>ECHÓDEX</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countNum}>{ownedCount}</Text>
          <Text style={styles.countDivider}>/9</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.overallProgress}>
        <View style={[styles.overallFill, { width: `${(ownedCount / 9) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {CREATURE_ORDER.map((id) => {
          const creature = CREATURES[id];
          const owned = save.ownedCreatureIds.includes(id);
          const active = save.activeCompanionId === id;
          const elColor = elementColors[creature.element];
          const elGlow = elementGlows[creature.element];
          return (
            <Panel
              key={id}
              style={[
                styles.card,
                !owned ? styles.locked : undefined,
                active
                  ? {
                      borderColor: elColor,
                      shadowColor: elGlow,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 16,
                      elevation: 12,
                    }
                  : undefined,
              ]}
            >
              <View
                style={[
                  styles.portrait,
                  { opacity: owned ? 1 : 0.18 },
                  owned ? { backgroundColor: `${elColor}22` } : undefined,
                ]}
              >
                {active && (
                  <View style={[styles.activeDot, { backgroundColor: elColor }]} />
                )}
                <Image
                  source={creatureArt[id].icon}
                  resizeMode="contain"
                  style={styles.icon}
                />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>
                    {owned ? creature.name : "UNKNOWN ECHO"}
                  </Text>
                  {owned ? <ElementBadge element={creature.element} /> : null}
                </View>
                <Text style={styles.description}>
                  {owned
                    ? creature.description
                    : "Explore the campus to reveal this legend."}
                </Text>
                {owned ? (
                  <Text style={[styles.buff, { color: elColor }]}>
                    {save.starterId === id
                      ? "STARTER"
                      : save.completedEncounterIds.some(
                            (e) => ENCOUNTERS[e].creatureId === id,
                          )
                        ? "CAUGHT"
                        : "COMPANION"}{" "}
                    · {creature.buff.label}
                  </Text>
                ) : null}
                {owned ? (
                  <GameButton
                    label={active ? "✓ ACTIVE COMPANION" : "SET AS ACTIVE"}
                    variant={active ? "secondary" : "ghost"}
                    disabled={active}
                    onPress={() => setActiveCompanion(id)}
                    style={styles.selectButton}
                  />
                ) : null}
              </View>
            </Panel>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <GameButton label="BACK TO MAP" onPress={returnToMap} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.navy, flex: 1 },
  header: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  eyebrow: { color: palette.aqua, fontFamily: fonts.pixelBold, fontSize: 9, letterSpacing: 1 },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 22,
    marginTop: 7,
  },
  countBadge: { flexDirection: "row", alignItems: "flex-end" },
  countNum: { color: palette.yellow, fontFamily: fonts.pixelBold, fontSize: 28 },
  countDivider: { color: palette.muted, fontFamily: fonts.pixelBold, fontSize: 18, marginBottom: 2 },
  overallProgress: {
    backgroundColor: "rgba(255,255,255,0.1)",
    height: 4,
    marginHorizontal: 20,
    borderRadius: 99,
    marginBottom: 14,
    overflow: "hidden",
  },
  overallFill: {
    height: "100%",
    backgroundColor: palette.aqua,
    borderRadius: 99,
  },
  list: { gap: 14, paddingBottom: 108, paddingHorizontal: 16 },
  card: { flexDirection: "row", gap: 14, padding: 13 },
  locked: { backgroundColor: "#D7DDE1" },
  portrait: {
    alignItems: "center",
    backgroundColor: "#E6F3ED",
    borderColor: palette.navy,
    borderRadius: 16,
    borderWidth: 2,
    height: 102,
    justifyContent: "center",
    width: 102,
    overflow: "hidden",
  },
  activeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: palette.white,
  },
  icon: { height: 84, width: 84 },
  cardBody: { flex: 1, gap: 7 },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  name: { color: palette.navy, fontFamily: fonts.pixelBold, fontSize: 12 },
  description: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  buff: { fontFamily: fonts.pixelBold, fontSize: 9 },
  selectButton: { minHeight: 42, paddingVertical: 7 },
  footer: { bottom: 0, left: 0, padding: 16, position: "absolute", right: 0 },
});
