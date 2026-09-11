import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { SafeAreaView } from "react-native-safe-area-context";

import { gameAudio } from "../assets";
import { GameButton, Panel } from "../components/game-ui";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";

export function SettingsScreen() {
  const { save, toggleSound, toggleMusic, resetProgress, returnToMap } =
    useGame();
  const soundCheckPlayer = useAudioPlayer(gameAudio.soundCheck, {
    downloadFirst: true,
    updateInterval: 50,
  });
  const soundCheckStatus = useAudioPlayerStatus(soundCheckPlayer);

  const playSoundCheck = () => {
    if (!save.soundEnabled) toggleSound();
    void soundCheckPlayer.seekTo(0).catch(() => undefined);
    soundCheckPlayer.play();
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset expedition?",
      "All captured Echoes and completed landmarks will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetProgress },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>EXPEDITION MENU</Text>
        <Text style={styles.title}>SETTINGS & CREDITS</Text>

        <Panel style={styles.panel}>
          <View style={styles.settingRow}>
            <Text style={styles.sectionTitle}>MUSIC</Text>
            <Switch
              accessibilityLabel="Music"
              value={save.musicEnabled}
              onValueChange={toggleMusic}
              trackColor={{ false: palette.line, true: palette.aqua }}
            />
          </View>
          <Text style={styles.body}>
            Kanoko Town · alternating encounter themes
          </Text>
        </Panel>

        <Panel style={styles.panel}>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.sectionTitle}>SOUND EFFECTS</Text>
              <Text style={styles.body}>
                Attack, capture, and interface effects.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Game sound"
              value={save.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: palette.line, true: palette.aqua }}
              thumbColor={palette.cream}
            />
          </View>
          <GameButton
            label={
              soundCheckStatus.playing
                ? "SOUND CHECK PLAYING"
                : "PLAY SOUND CHECK"
            }
            variant="secondary"
            onPress={playSoundCheck}
          />
          <Text
            style={[
              styles.soundStatus,
              soundCheckStatus.error ? styles.soundError : null,
            ]}
          >
            {soundCheckStatus.error
              ? `AUDIO ERROR: ${soundCheckStatus.error}`
              : soundCheckStatus.isLoaded
                ? "AUDIO READY · USE MEDIA VOLUME"
                : "LOADING AUDIO..."}
          </Text>
        </Panel>

        <Panel style={styles.panel}>
          <Text style={styles.sectionTitle}>HOW TO PLAY</Text>
          <Text style={styles.body}>
            Walk within 40 meters of a landmark or use Demo Walk. Pick a
            companion that counters the wild Echo, tap to attack, charge your
            Ultimate, then swipe the Echo Orb toward the moving target.
          </Text>
        </Panel>

        <Panel style={styles.panel}>
          <Text style={styles.sectionTitle}>ASSET CREDITS</Text>
          <Text style={styles.credit}>
            Creature art, UI and fonts — MPWSP01 / scarloxy (CC BY 4.0)
          </Text>
          <Text style={styles.credit}>
            Pixel effects — Will Tice / unTied Games
          </Text>
          <Text style={styles.credit}>Mountain Dusk — Ansimuz (CC0)</Text>
          <Text style={styles.credit}>
            Selected classroom audio — Pokémon game sound effects
          </Text>
          <Text style={styles.credit}>
            Battle environment — (c) Yanako RPGs LLC 2022
          </Text>
          <Text style={styles.credit}>
            Trainer portraits — Screensmith, Townspeople
          </Text>
          <Text style={styles.legal}>
            This student project is a non-commercial classroom demonstration.
            ECHO HUNT, its interface, and Echo Orb are original project
            elements.
          </Text>
        </Panel>

        <GameButton
          label="RESET EXPEDITION"
          variant="danger"
          onPress={confirmReset}
        />
        <GameButton label="BACK TO MAP" onPress={returnToMap} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.navy, flex: 1 },
  content: { gap: 16, padding: 20, paddingBottom: 34 },
  eyebrow: { color: palette.aqua, fontFamily: fonts.pixelBold, fontSize: 9 },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 20,
    lineHeight: 28,
  },
  panel: { gap: 10 },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  settingCopy: { flex: 1, paddingRight: 12 },
  sectionTitle: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 12,
  },
  body: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  credit: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  legal: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  soundStatus: {
    color: palette.aquaDark,
    fontFamily: fonts.pixelBold,
    fontSize: 7,
    textAlign: "center",
  },
  soundError: { color: palette.danger },
});
