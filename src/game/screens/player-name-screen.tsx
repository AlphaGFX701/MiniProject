import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { echoOrb } from "../assets";
import { GameButton, Panel } from "../components/game-ui";
import { PanningMountainBackground } from "../components/panning-mountain-background";
import { useGame } from "../game-context";
import { fonts, palette } from "../theme";

export function PlayerNameScreen() {
  const { setPlayerName, continueFromTitle } = useGame();
  const [name, setName] = useState("");
  const playerName = name.trim();

  return (
    <PanningMountainBackground scrimOpacity={0.68}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to trainer login"
          onPress={continueFromTitle}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ TRAINER LOGIN</Text>
        </Pressable>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.content}
        >
          <View style={styles.hero}>
            <Image source={echoOrb} style={styles.orb} />
            <Text style={styles.eyebrow}>ECHO HUNT</Text>
            <Text style={styles.title}>TRAINER LOGIN</Text>
          </View>
          <Panel style={styles.panel}>
            <Text style={styles.heading}>WHAT SHOULD WE CALL YOU?</Text>
            <Text style={styles.body}>
              Your name stays on this device. No password or online account is
              needed.
            </Text>
            <TextInput
              accessibilityLabel="Player name"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={20}
              onChangeText={setName}
              onSubmitEditing={() => setPlayerName(playerName)}
              placeholder="ENTER YOUR NAME"
              placeholderTextColor={palette.muted}
              returnKeyType="done"
              style={styles.input}
              value={name}
            />
            <GameButton
              disabled={!playerName}
              label="START ADVENTURE"
              onPress={() => setPlayerName(playerName)}
            />
          </Panel>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PanningMountainBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    left: 18,
    minHeight: 48,
    paddingHorizontal: 8,
    position: "absolute",
    top: 24,
    zIndex: 1,
  },
  backText: { color: palette.cream, fontFamily: fonts.pixelBold, fontSize: 9 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  hero: { alignItems: "center", gap: 10, marginBottom: 28 },
  orb: { height: 96, width: 96 },
  eyebrow: {
    color: palette.aqua,
    fontFamily: fonts.pixelBold,
    fontSize: 11,
    letterSpacing: 3,
  },
  title: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 22,
    textAlign: "center",
  },
  panel: { gap: 16 },
  heading: { color: palette.navy, fontFamily: fonts.pixelBold, fontSize: 13 },
  body: { color: palette.ink, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  input: {
    backgroundColor: palette.white,
    borderColor: palette.navy,
    borderRadius: 12,
    borderWidth: 2,
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
});
