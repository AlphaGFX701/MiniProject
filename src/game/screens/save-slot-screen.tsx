import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { echoOrb } from "../assets";
import { Panel } from "../components/game-ui";
import { PanningMountainBackground } from "../components/panning-mountain-background";
import { coreCount } from "../data";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";

export function SaveSlotScreen() {
  const {
    saveSlots,
    selectSaveSlot,
    startNewSaveSlot,
    deleteSaveSlot,
    returnToTitle,
  } = useGame();

  const confirmDelete = (slot: number, playerName?: string) =>
    Alert.alert(
      "DELETE SAVE?",
      `Delete ${playerName ?? "this trainer"}'s expedition? This cannot be undone.`,
      [
        { text: "CANCEL", style: "cancel" },
        { text: "DELETE", style: "destructive", onPress: () => deleteSaveSlot(slot) },
      ],
    );

  return (
    <PanningMountainBackground scrimOpacity={0.7}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to start"
          onPress={returnToTitle}
          style={styles.headerBackButton}
        >
          <Text style={styles.headerBackText}>‹ START</Text>
        </Pressable>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Image source={echoOrb} style={styles.orb} />
            <Text style={styles.eyebrow}>TRAINER LOGIN</Text>
            <Text style={styles.title}>CHOOSE A SAVE</Text>
          </View>
          <Panel style={styles.panel}>
            <Text style={styles.body}>Choose a trainer to continue, or start a new expedition in an empty slot.</Text>
            <View style={styles.slotList}>
              {saveSlots.map((slot, index) => {
                const occupied = Boolean(slot);
                return (
                  <View key={index} style={[styles.slot, occupied ? styles.occupiedSlot : styles.emptySlot]}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={occupied ? `Continue ${slot?.playerName ?? "trainer"}` : `Create save slot ${index + 1}`}
                      onPress={() => occupied ? selectSaveSlot(index) : startNewSaveSlot(index)}
                      style={styles.slotMain}
                    >
                      <Text style={styles.slotNumber}>SLOT {index + 1}</Text>
                      {slot ? (
                      <View style={styles.slotCopy}>
                        <Text style={styles.name}>{slot.playerName?.toUpperCase() ?? "TRAINER"}</Text>
                        <Text style={styles.progress}>ECHOES FOUND {coreCount(slot.completedEncounterIds)}/3</Text>
                      </View>
                      ) : (
                        <Text style={styles.newSave}>+ NEW EXPEDITION</Text>
                      )}
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                    {slot ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${slot.playerName ?? "trainer"} save`}
                        hitSlop={8}
                        onPress={() => confirmDelete(index, slot.playerName)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteText}>×</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </Panel>
        </View>
      </SafeAreaView>
    </PanningMountainBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerBackButton: {
    alignItems: "center",
    flexDirection: "row",
    left: 18,
    minHeight: 48,
    paddingHorizontal: 8,
    position: "absolute",
    top: 24,
    zIndex: 1,
  },
  headerBackText: { color: palette.cream, fontFamily: fonts.pixelBold, fontSize: 9 },
  content: { flex: 1, justifyContent: "center", padding: 22 },
  hero: { alignItems: "center", gap: 9, marginBottom: 24 },
  orb: { height: 74, width: 74 },
  eyebrow: { color: palette.aqua, fontFamily: fonts.pixelBold, fontSize: 10, letterSpacing: 2 },
  title: { color: palette.white, fontFamily: fonts.pixelBold, fontSize: 19 },
  panel: { gap: 16 },
  body: { color: palette.ink, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  slotList: { gap: 10 },
  slot: { alignItems: "center", borderColor: palette.navy, borderRadius: 14, borderWidth: 3, flexDirection: "row", minHeight: 70, paddingLeft: 12 },
  slotMain: { alignItems: "center", flex: 1, flexDirection: "row", minHeight: 64 },
  occupiedSlot: { backgroundColor: "#E9FAF6" },
  emptySlot: { backgroundColor: palette.white, borderStyle: "dashed" },
  slotNumber: { color: palette.aquaDark, fontFamily: fonts.pixelBold, fontSize: 8, width: 49 },
  slotCopy: { flex: 1, gap: 6 },
  name: { color: palette.navy, fontFamily: fonts.pixelBold, fontSize: 12 },
  progress: { color: palette.muted, fontFamily: fonts.pixelBold, fontSize: 7 },
  newSave: { color: palette.navy, flex: 1, fontFamily: fonts.pixelBold, fontSize: 10 },
  chevron: { color: palette.aquaDark, fontFamily: fonts.pixelBold, fontSize: 28 },
  deleteButton: { alignItems: "center", backgroundColor: palette.danger, borderBottomRightRadius: 10, borderLeftColor: palette.navy, borderLeftWidth: 2, borderTopRightRadius: 10, height: 64, justifyContent: "center", width: 46 },
  deleteText: { color: palette.white, fontFamily: fonts.pixelBold, fontSize: 24 },
});
