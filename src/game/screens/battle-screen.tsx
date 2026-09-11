import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAudioPlayer, type AudioPlayer } from "expo-audio";
import { SafeAreaView } from "react-native-safe-area-context";

import { ElementImpact } from "../components/element-impact";
import { ChargeChallenge } from "../components/charge-challenge";
import { WILD_BASIC_DAMAGE, WILD_ULTIMATE_DAMAGE } from "../presentation-rules";
import { chargedDamage } from "../combat-rules";
import { battleBackgrounds, gameAudio } from "../assets";
import { AnimatedCreature } from "../components/animated-creature";
import {
  ElementBadge,
  GameButton,
  Panel,
  ProgressBar,
} from "../components/game-ui";
import { UltimateEffect } from "../components/ultimate-effect";
import { CREATURES, ENCOUNTERS } from "../data";
import { useGame } from "../game-context";
import {
  canRegisterAttack,
  damageFor,
  maxHpFor,
  typeMultiplier,
} from "../logic";
import { elementColors, fonts, palette } from "../theme";
import type { BattleState } from "../types";
import { useCombatAudio } from "../use-combat-audio";

export function BattleScreen() {
  const {
    activeEncounterId,
    selectedCompanionId,
    save,
    completeBattle,
    returnToMap,
  } = useGame();
  const encounter = activeEncounterId ? ENCOUNTERS[activeEncounterId] : null;
  const enemyId = encounter?.creatureId ?? "larvea";
  const companion = CREATURES[selectedCompanionId];
  const enemy = CREATURES[enemyId];
  const playerMaxHp = maxHpFor(selectedCompanionId);
  const enemyMaxHp = 160;
  const initialState = useMemo<BattleState>(
    () => ({
      playerHp: playerMaxHp,
      enemyHp: enemyMaxHp,
      energy: 0,
      status: "active",
    }),
    [playerMaxHp],
  );
  const [battle, setBattle] = useState(initialState);
  const [playerAction, setPlayerAction] = useState<"idle" | "attack">("idle");
  const [enemyAction, setEnemyAction] = useState<"idle" | "attack">("idle");
  const [ultimateKey, setUltimateKey] = useState(0);
  const [impactKey, setImpactKey] = useState(0);
  const [appActive, setAppActive] = useState(true);
  const [phase, setPhase] = useState<"fight" | "charge" | "warning">("fight");
  const [notice, setNotice] = useState("");
  const enemyAttacks = useRef(0);
  const phaseLock = useRef(false);
  const shieldTime = useRef(0);
  const lastTapRef = useRef(0);

  const audioOptions = { downloadFirst: true };
  const faint = useAudioPlayer(gameAudio.faint, audioOptions);
  const playCombat = useCombatAudio(save.soundEnabled);

  const play = useCallback(
    (player: AudioPlayer) => {
      if (!save.soundEnabled) return;
      player.volume = 1;
      void player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => undefined);
    },
    [save.soundEnabled],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setAppActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (battle.status !== "active" || !appActive || phase !== "fight") return;
    const timer = setInterval(() => {
      enemyAttacks.current += 1;
      if (enemyAttacks.current >= 7) {
        enemyAttacks.current = 0;
        shieldTime.current = 0;
        phaseLock.current = false;
        setPhase("warning");
        return;
      }
      setEnemyAction("attack");
      setTimeout(() => setEnemyAction("idle"), 300);
      playCombat(enemy.element);
      setBattle((current) => {
        if (current.status !== "active") return current;
        const damage = damageFor(
          enemyId,
          selectedCompanionId,
          WILD_BASIC_DAMAGE,
        );
        const playerHp = Math.max(0, current.playerHp - damage);
        return {
          ...current,
          playerHp,
          status: playerHp === 0 ? "lost" : "active",
        };
      });
    }, 1_200);
    return () => clearInterval(timer);
  }, [
    appActive,
    battle.status,
    enemyId,
    enemy.element,
    playCombat,
    selectedCompanionId,
    phase,
  ]);

  useEffect(() => {
    if (battle.status === "won" && appActive) {
      const timer = setTimeout(completeBattle, 1500);
      return () => clearTimeout(timer);
    }
    if (battle.status === "lost") play(faint);
  }, [appActive, battle.status, completeBattle, play, faint]);

  const attack = () => {
    const now = Date.now();
    if (
      phaseLock.current ||
      phase !== "fight" ||
      !appActive ||
      battle.status !== "active" ||
      !canRegisterAttack(lastTapRef.current, now)
    )
      return;
    lastTapRef.current = now;
    setPlayerAction("attack");
    setImpactKey((n) => n + 1);
    setTimeout(() => setPlayerAction("idle"), 260);
    playCombat(companion.element);
    setBattle((current) => {
      if (current.status !== "active") return current;
      const enemyHp = Math.max(
        0,
        current.enemyHp - damageFor(selectedCompanionId, enemyId, 5),
      );
      return {
        ...current,
        enemyHp,
        energy: Math.min(100, current.energy + 8),
        status: enemyHp === 0 ? "won" : "active",
      };
    });
  };

  const ultimate = () => {
    if (
      !appActive ||
      phase !== "fight" ||
      phaseLock.current ||
      battle.status !== "active" ||
      battle.energy < 100
    )
      return;
    phaseLock.current = true;
    setBattle((current) => ({ ...current, energy: 0 }));
    setPhase("charge");
  };
  const finishCharge = (count: number) => {
    setUltimateKey((n) => n + 1);
    setImpactKey((n) => n + 1);
    setPlayerAction("attack");
    setTimeout(() => setPlayerAction("idle"), 500);
    playCombat(companion.element, true);
    setNotice(count >= 9 ? "EXCELLENT!" : count >= 6 ? "GREAT!" : "NICE!");
    setBattle((current) => {
      const enemyHp = Math.max(
        0,
        current.enemyHp -
          damageFor(selectedCompanionId, enemyId, chargedDamage(count)),
      );
      return { ...current, enemyHp, status: enemyHp === 0 ? "won" : "active" };
    });
    phaseLock.current = false;
    setPhase("fight");
  };
  const defend = useCallback(() => {
    if (phaseLock.current || !appActive) return;
    phaseLock.current = true;
    setNotice("ENEMY ULTIMATE!");
    playCombat(enemy.element, true);
    setBattle((current) => {
      const playerHp = Math.max(
        0,
        current.playerHp -
          damageFor(enemyId, selectedCompanionId, WILD_ULTIMATE_DAMAGE),
      );
      return {
        ...current,
        playerHp,
        status: playerHp === 0 ? "lost" : "active",
      };
    });
    setPhase("fight");
  }, [appActive, playCombat, enemy.element, enemyId, selectedCompanionId]);
  useEffect(() => {
    if (phase === "fight") phaseLock.current = false;
  }, [phase]);
  useEffect(() => {
    if (phase !== "warning" || !appActive) return;
    const timer = setInterval(() => {
      shieldTime.current += 50;
      if (shieldTime.current >= 1000) defend();
    }, 50);
    return () => clearInterval(timer);
  }, [phase, appActive, defend]);

  const retry = () => {
    lastTapRef.current = 0;
    setPlayerAction("idle");
    setEnemyAction("idle");
    setBattle(initialState);
    setUltimateKey(0);
    setImpactKey(0);
    setPhase("fight");
    setNotice("");
    enemyAttacks.current = 0;
    phaseLock.current = false;
  };

  const matchup = typeMultiplier(companion.element, enemy.element);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Leave battle"
            onPress={returnToMap}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={styles.eyebrow}>CAMPUS ENCOUNTER</Text>
            <Text style={styles.location}>
              {encounter?.shortName.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.matchupPill,
              matchup > 1
                ? styles.strongPill
                : matchup < 1
                  ? styles.weakPill
                  : null,
            ]}
          >
            <Text style={styles.matchupText}>
              {matchup > 1
                ? "ADVANTAGE"
                : matchup < 1
                  ? "DISADVANTAGE"
                  : "EVEN"}
            </Text>
          </View>
        </View>

        <Panel style={styles.enemyPanel}>
          <View style={styles.statHeader}>
            <View>
              <Text style={styles.creatureName}>
                {enemy.name.toUpperCase()}
              </Text>
              <Text style={styles.wildText}>WILD ECHO</Text>
            </View>
            <ElementBadge element={enemy.element} />
          </View>
          <ProgressBar
            value={battle.enemyHp}
            maximum={enemyMaxHp}
            color={elementColors[enemy.element]}
          />
          <Text style={styles.hpText}>
            {battle.enemyHp} / {enemyMaxHp} HP
          </Text>
        </Panel>

        <ImageBackground
          source={battleBackgrounds[enemy.element]}
          style={styles.arena}
          resizeMode="stretch"
        >
          <Text
            style={{
              color: palette.yellow,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {notice}
          </Text>
          <View style={styles.enemyCreature}>
            <View style={styles.platform} />
            {ultimateKey > 0 ? (
              <UltimateEffect key={"ultimate-" + ultimateKey} />
            ) : null}
            <AnimatedCreature
              grounded
              creatureId={enemyId}
              receivingHit={playerAction === "attack"}
              action={enemyAction}
              size={174}
            />
            {impactKey > 0 ? (
              <ElementImpact
                key={"basic-" + impactKey}
                element={companion.element}
              />
            ) : null}
          </View>
          <View style={styles.playerCreature}>
            <View style={styles.platform} />
            {enemyAction === "attack" ? (
              <ElementImpact element={enemy.element} />
            ) : null}
            <AnimatedCreature
              grounded
              creatureId={selectedCompanionId}
              receivingHit={enemyAction === "attack"}
              action={playerAction}
              size={170}
              flipped
            />
          </View>
        </ImageBackground>

        <Panel style={styles.playerPanel}>
          <View style={styles.statHeader}>
            <View>
              <Text style={styles.creatureName}>
                {companion.name.toUpperCase()}
              </Text>
              <Text style={styles.buffText}>{companion.buff.label}</Text>
            </View>
            <ElementBadge element={companion.element} />
          </View>
          <ProgressBar
            value={battle.playerHp}
            maximum={playerMaxHp}
            color={palette.success}
          />
          <View style={styles.valueRow}>
            <Text style={styles.hpText}>
              {battle.playerHp} / {playerMaxHp} HP
            </Text>
            <Text style={styles.energyText}>ENERGY {battle.energy}%</Text>
          </View>
          <ProgressBar
            value={battle.energy}
            maximum={100}
            color={palette.yellow}
            height={10}
          />
          <View style={styles.controls}>
            <GameButton
              label="TAP ATTACK"
              onPress={attack}
              disabled={phase !== "fight" || battle.status !== "active"}
              style={styles.attackButton}
            />
            <GameButton
              label={
                battle.energy >= 100
                  ? "ULTIMATE READY"
                  : `ULTIMATE ${battle.energy}%`
              }
              variant="secondary"
              disabled={
                phase !== "fight" ||
                battle.energy < 100 ||
                battle.status !== "active"
              }
              onPress={ultimate}
              style={styles.ultimateButton}
            />
          </View>
        </Panel>

        {phase === "charge" ? (
          <ChargeChallenge
            element={companion.element}
            active={appActive}
            onComplete={finishCharge}
          />
        ) : null}
        {phase === "warning" ? (
          <View style={styles.resultScrim}>
            <Panel style={styles.resultPanel}>
              <Text style={styles.resultTitle}>INCOMING ULTIMATE!</Text>
              <Text style={styles.resultBody}>Get ready for the impact.</Text>
            </Panel>
          </View>
        ) : null}
        {battle.status === "lost" ? (
          <View style={styles.resultScrim}>
            <Panel style={styles.resultPanel}>
              <Text style={styles.resultTitle}>YOUR ECHO FAINTED</Text>
              <Text style={styles.resultBody}>
                Choose the elemental advantage and try the encounter again with
                full health.
              </Text>
              <GameButton label="RETRY BATTLE" onPress={retry} />
              <GameButton
                label="RETURN TO MAP"
                variant="ghost"
                onPress={returnToMap}
              />
            </Panel>
          </View>
        ) : null}
        {battle.status === "won" ? (
          <View style={styles.winBanner}>
            <Text style={styles.winText}>BATTLE WON · CAPTURE READY</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: palette.navy },
  scrim: {
    backgroundColor: "rgba(7, 22, 39, 0.20)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  safeArea: { flex: 1, padding: 12 },
  header: { alignItems: "center", flexDirection: "row", gap: 10 },
  backButton: {
    alignItems: "center",
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 13,
    borderWidth: 3,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  backText: { color: palette.navy, fontSize: 36, lineHeight: 38 },
  headerTitle: { flex: 1 },
  eyebrow: { color: palette.yellow, fontFamily: fonts.pixelBold, fontSize: 8 },
  location: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 11,
    marginTop: 6,
  },
  matchupPill: {
    backgroundColor: palette.yellow,
    borderColor: palette.navy,
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  strongPill: { backgroundColor: "#73D690" },
  weakPill: { backgroundColor: "#FF899D" },
  matchupText: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 7,
  },
  enemyPanel: {
    alignSelf: "flex-end",
    gap: 7,
    marginTop: 14,
    padding: 12,
    width: "78%",
  },
  playerPanel: { gap: 7, padding: 13 },
  statHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  creatureName: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 12,
  },
  wildText: {
    color: palette.muted,
    fontFamily: fonts.pixelBold,
    fontSize: 7,
    marginTop: 4,
  },
  buffText: {
    color: palette.aquaDark,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 4,
  },
  hpText: { color: palette.muted, fontFamily: fonts.pixelBold, fontSize: 8 },
  energyText: {
    color: palette.aquaDark,
    fontFamily: fonts.pixelBold,
    fontSize: 8,
  },
  valueRow: { flexDirection: "row", justifyContent: "space-between" },
  arena: { flex: 1, marginVertical: 10, borderRadius: 18, overflow: "hidden" },
  enemyCreature: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 10,
    top: 20,
  },
  playerCreature: { bottom: 20, left: 0, position: "absolute" },
  platform: {
    position: "absolute",
    bottom: -10,
    width: 150,
    height: 100,
    borderRadius: 75,
    transform: [{ scaleY: 0.3 }],
    backgroundColor: "#789B54",
    borderWidth: 4,
    borderColor: "#ACC878",
    alignSelf: "center",
  },
  controls: { flexDirection: "row", gap: 10, marginTop: 7 },
  attackButton: { flex: 1 },
  ultimateButton: { flex: 1 },
  resultScrim: {
    alignItems: "center",
    backgroundColor: palette.scrim,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    padding: 24,
    position: "absolute",
    right: 0,
    top: 0,
  },
  resultPanel: { gap: 13, width: "100%" },
  resultTitle: {
    color: palette.danger,
    fontFamily: fonts.pixelBold,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  resultBody: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  winBanner: {
    alignSelf: "center",
    backgroundColor: palette.yellow,
    borderColor: palette.navy,
    borderRadius: 999,
    borderWidth: 3,
    paddingHorizontal: 18,
    paddingVertical: 12,
    position: "absolute",
    top: "48%",
  },
  winText: { color: palette.navy, fontFamily: fonts.pixelBold, fontSize: 9 },
});
