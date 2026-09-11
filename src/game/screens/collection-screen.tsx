import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { creatureArt } from "../assets";
import { CREATURES, PLAYER_IDS, ENCOUNTERS } from "../data";
import { ElementBadge, GameButton, Panel } from "../components/game-ui";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";
import type { CreatureId } from "../types";

const CREATURE_ORDER: CreatureId[] = PLAYER_IDS;

export function CollectionScreen() {
  const { save, setActiveCompanion, returnToMap } = useGame();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>FIELD GUIDE</Text>
          <Text style={styles.title}>POKÉDEX</Text>
        </View>
        <Text style={styles.count}>
          {PLAYER_IDS.filter((id) => save.ownedCreatureIds.includes(id)).length}
          /9
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {CREATURE_ORDER.map((id) => {
          const creature = CREATURES[id];
          const owned = save.ownedCreatureIds.includes(id);
          const active = save.activeCompanionId === id;
          return (
            <Panel
              key={id}
              style={[styles.card, !owned ? styles.locked : undefined]}
            >
              <View style={[styles.portrait, { opacity: owned ? 1 : 0.18 }]}>
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
                  <Text style={styles.buff}>
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
                    label={active ? "ACTIVE COMPANION" : "SET AS ACTIVE"}
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
    padding: 20,
  },
  eyebrow: { color: palette.aqua, fontFamily: fonts.pixelBold, fontSize: 9 },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 20,
    marginTop: 7,
  },
  count: { color: palette.yellow, fontFamily: fonts.pixelBold, fontSize: 20 },
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
  buff: { color: palette.aquaDark, fontFamily: fonts.pixelBold, fontSize: 9 },
  selectButton: { minHeight: 42, paddingVertical: 7 },
  footer: { bottom: 0, left: 0, padding: 16, position: "absolute", right: 0 },
});
