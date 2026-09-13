import { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCombatAudio } from "../use-combat-audio";
import { useGame } from "../game-context";
import { CREATURES, PLAYER_IDS } from "../data";
import { creatureArt, playerFrames } from "../assets";
import { AnimatedFacultyPortrait } from "../components/animated-faculty-portrait";
import { AnimatedCreature } from "../components/animated-creature";
import { ChargeChallenge } from "../components/charge-challenge";
import { ElementImpact } from "../components/element-impact";
import { UltimateEffect } from "../components/ultimate-effect";
import { GameButton, Panel, ProgressBar } from "../components/game-ui";
import { PanningMountainBackground } from "../components/panning-mountain-background";
import {
  createTeamBattle,
  bossTeamWithCounter,
  teamBattleReducer,
  TRAINER_RULES,
  trainerAttackDelay,
  validTeam,
  type BattleEvent,
  type TeamBattle,
} from "../team-battle";
import { maxHpFor, typeMultiplier } from "../logic";
import { elementColors, fonts, palette } from "../theme";
import type { CreatureId, LandmarkId } from "../types";

export const FACULTY: Record<
  LandmarkId,
  { name: string; dialogue: string[]; closing: string; portrait: number }
> = {
  faculty: {
    name: "Soradong",
    closing: "Good teamwork turns small steps into progress.",
    dialogue: [
      "Welcome to Computer Education. Let us discover what your team can do together!",
      "A great trainer watches carefully, then makes each move with purpose.",
      "Your companions each bring a different strength. Trust them and learn from every turn.",
    ],
    portrait: require("../../../assets/game/faculty/trainer-0.png"),
  },
  building44: {
    name: "Veetina",
    closing: "Keep experimenting. Every challenge can teach you something.",
    dialogue: [
      "Every challenge is a chance to learn. Show me how you adapt!",
      "Look closely at the elements in play. A small advantage can change the whole battle.",
      "If a plan does not work at first, try a new companion and keep experimenting.",
    ],
    portrait: require("../../../assets/game/faculty/trainer-1.png"),
  },
  plaza: {
    name: "Mr. Kingpin",
    closing: "Small companions, big courage. Keep exploring!",
    dialogue: [
      "Small companions can achieve great things. Ready for a friendly challenge?",
      "Courage is not about never feeling nervous. It is about standing beside your team anyway.",
      "Explore, learn, and have fun. The strongest team is one that never stops growing.",
    ],
    portrait: require("../../../assets/game/faculty/trainer-2.png"),
  },
};
export function TrainerScreen() {
  const { trainerId, save, returnToMap, winTrainer, setVictoryMusic } =
    useGame();
  const id = trainerId ?? "faculty",
    trainer = FACULTY[id];
  const [step, setStep] = useState<"intro" | "select" | "battle">("intro");
  const [dialogPage, setDialogPage] = useState(0);
  const [veetinaEasterEgg, setVeetinaEasterEgg] = useState(false);
  const lastPortraitTap = useRef(0);
  const [feedback, setFeedback] = useState("");
  const feedbackTime = useRef(0);
  const resultTime = useRef(0);
  const pendingBattle = useRef<TeamBattle | null>(null);
  const [resultReady, setResultReady] = useState(false);
  const [battleTransition, setBattleTransition] = useState(false);
  const [battleFade] = useState(() => new Animated.Value(0));
  const [selected, setSelected] = useState<CreatureId[]>([]);
  const [battle, setBattle] = useState<TeamBattle | null>(null);
  const battleRef = useRef<TeamBattle | null>(null);
  const [active, setActive] = useState(AppState.currentState === "active");
  const [switching, setSwitching] = useState(false);
  const [impact, setImpact] = useState<{
    key: number;
    side: "player" | "enemy";
  } | null>(null);
  const [action, setAction] = useState<"player" | "enemy" | null>(null);
  const [ultimateImpact, setUltimateImpact] = useState<{
    key: number;
    side: "player" | "enemy";
  } | null>(null);
  const actionTime = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shieldElapsed = useRef(0);
  const rewarded = useRef(false);
  const playSound = useCombatAudio(save.soundEnabled);
  const dispatch = (event: BattleEvent) => {
    const current = battleRef.current;
    if (!current || !active || feedbackTime.current > 0) return;
    const next = teamBattleReducer(current, event);
    if (next === current) return;
    battleRef.current = next;
    const transition =
      event.type === "charge" ||
      event.type === "defend" ||
      current.enemyIndex !== next.enemyIndex ||
      current.playerIndex !== next.playerIndex ||
      next.phase === "replace";
    if (transition) pendingBattle.current = next;
    else setBattle(next);
    if (
      event.type === "charge" ||
      event.type === "defend" ||
      current.enemyIndex !== next.enemyIndex ||
      current.playerIndex !== next.playerIndex ||
      next.phase === "replace"
    ) {
      feedbackTime.current = 1000;
      setFeedback(
        (event.type === "charge" && current.enemyShield) ||
          (event.type === "defend" && event.shield && current.playerShield)
          ? "Blocked!"
          : next.phase === "replace"
            ? "Your companion fainted"
            : current.enemyIndex !== next.enemyIndex
              ? "Opponent fainted · Next companion!"
              : "Ready for the next move",
      );
    }
    if (event.type === "charge" || event.type === "defend") {
      setUltimateImpact({
        key: Date.now(),
        side: event.type === "charge" ? "enemy" : "player",
      });
    }
    if (
      event.type === "tap" ||
      event.type === "enemy" ||
      event.type === "charge"
    ) {
      const side = event.type === "enemy" ? "enemy" : "player";
      setAction(side);
      setImpact({ key: Date.now(), side });
      if (actionTime.current) clearTimeout(actionTime.current);
      actionTime.current = setTimeout(() => setAction(null), 300);
      if (event.type !== "enemy" || next.phase !== "shield")
        playSound(
          CREATURES[
            side === "player"
              ? current.player[current.playerIndex].id
              : current.enemy[current.enemyIndex].id
          ].element,
          event.type === "charge",
        );
    }
    if (event.type === "defend")
      playSound(CREATURES[current.enemy[current.enemyIndex].id].element, true);
  };
  const dispatchRef = useRef(dispatch);
  useEffect(() => {
    dispatchRef.current = dispatch;
  });
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) =>
      setActive(s === "active"),
    );
    return () => {
      sub.remove();
      if (actionTime.current) clearTimeout(actionTime.current);
    };
  }, []);
  useEffect(() => {
    if (!active || feedback || switching || battle?.phase !== "fight") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleAttack = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        dispatchRef.current({ type: "enemy" });
        scheduleAttack();
      }, trainerAttackDelay());
    };
    scheduleAttack();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    active,
    switching,
    feedback,
    battle?.phase,
    battle?.playerIndex,
    battle?.enemyIndex,
  ]);
  useEffect(() => {
    if (battle?.phase === "shield") shieldElapsed.current = 0;
  }, [battle?.phase]);
  useEffect(() => {
    if (!active || feedback || battle?.phase !== "shield") return;
    const timer = setInterval(() => {
      shieldElapsed.current += 50;
      if (shieldElapsed.current >= 3000)
        dispatchRef.current({ type: "defend", shield: false });
    }, 50);
    return () => clearInterval(timer);
  }, [active, feedback, battle?.phase]);
  useEffect(() => {
    if (battle?.phase === "won" && !rewarded.current) {
      rewarded.current = true;
      winTrainer(id);
      setVictoryMusic(true);
    }
  }, [battle?.phase, id, winTrainer, setVictoryMusic]);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      if (feedbackTime.current > 0) {
        feedbackTime.current = Math.max(0, feedbackTime.current - 50);
        if (!feedbackTime.current) {
          setFeedback("");
          if (pendingBattle.current) {
            setBattle(pendingBattle.current);
            pendingBattle.current = null;
          }
        }
      }
      if (battle?.phase === "won" || battle?.phase === "lost") {
        resultTime.current += 50;
        if (resultTime.current >= 1500) setResultReady(true);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [active, battle?.phase]);
  const begin = () => {
    if (!validTeam(selected, save.ownedCreatureIds)) return;
    const next = createTeamBattle(
      selected,
      battle
        ? battle.enemy.map((slot) => slot.id)
        : bossTeamWithCounter(selected[0]),
    );
    battleFade.setValue(0);
    setBattleTransition(true);
    Animated.timing(battleFade, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      battleRef.current = next;
      setBattle(next);
      setStep("battle");
      rewarded.current = false;
      resultTime.current = 0;
      setResultReady(false);
      setVictoryMusic(false);
      Animated.timing(battleFade, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start(() => setBattleTransition(false));
    });
  };
  const choose = (creature: CreatureId) =>
    setSelected((current) =>
      current.includes(creature)
        ? current.filter((c) => c !== creature)
        : current.length < 3 &&
            !current.some(
              (c) => CREATURES[c].element === CREATURES[creature].element,
            )
          ? [...current, creature]
          : current,
    );
  const retry = () => {
    if (!battle) return;
    const next = createTeamBattle(
      selected,
      battle.enemy.map((s) => s.id),
    );
    battleRef.current = next;
    setBattle(next);
    rewarded.current = false;
    setSwitching(false);
    resultTime.current = 0;
    setResultReady(false);
    setVictoryMusic(false);
  };
  const player = battle?.player[battle.playerIndex],
    enemy = battle?.enemy[battle.enemyIndex];
  const cutscenePages = [
    ...trainer.dialogue,
    "Choose three companions with different elements. Trainers use tougher Echoes and charge Ultimates quickly, so make every switch count.",
  ];
  const isLastCutscenePage = dialogPage === cutscenePages.length - 1;
  const handleTrainerPortraitPress = () => {
    if (id !== "building44" || step !== "intro") return;
    const now = Date.now();
    if (now - lastPortraitTap.current <= 350) {
      setVeetinaEasterEgg((current) => !current);
      lastPortraitTap.current = 0;
      return;
    }
    lastPortraitTap.current = now;
  };
  const matchup =
    player && enemy
      ? typeMultiplier(CREATURES[player.id].element, CREATURES[enemy.id].element)
      : 1;
  const matchupLabel =
    matchup > 1
      ? "ELEMENT ADVANTAGE"
      : matchup < 1
        ? "ELEMENT DISADVANTAGE"
        : "ELEMENT EVEN";
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          onPress={returnToMap}
          style={s.back}
        >
          <Text style={s.backText}>‹ MAP</Text>
        </Pressable>
        <Text style={s.title}>{trainer.name.toUpperCase()}</Text>
      </View>
      {step === "intro" ? (
        <>
          <Text style={s.eyebrow}>MEET THE FACULTY</Text>
          <ImageBackground
            source={require("../../../assets/game/backgrounds/faculty-backs.png")}
            style={s.introArena}
            imageStyle={{ resizeMode: "cover" }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                id === "building44" ? "Veetina portrait" : undefined
              }
              disabled={id !== "building44"}
              onPress={handleTrainerPortraitPress}
              style={s.trainer}
            >
              <AnimatedFacultyPortrait
                key={veetinaEasterEgg ? "easter-egg" : "standard"}
                trainerId={id}
                easterEgg={veetinaEasterEgg}
                style={s.trainerImage}
              />
            </Pressable>
            <Image source={playerFrames.up[0]} style={s.avatar} />
          </ImageBackground>
          <Panel style={s.dialog}>
            <Text style={s.dialogTitle}>
              {trainer.name} would like to battle!
            </Text>
            <Text style={s.body}>
              {cutscenePages[dialogPage]}
            </Text>
            <Text style={s.pageIndicator}>
              {dialogPage + 1} / {cutscenePages.length}
            </Text>
            <Text style={s.note}>
              A fictional friendly challenge inspired by the CED faculty.
            </Text>
            <GameButton
              label={isLastCutscenePage ? "CHOOSE YOUR TEAM" : "NEXT"}
              onPress={() =>
                isLastCutscenePage
                  ? setStep("select")
                  : setDialogPage((page) => page + 1)
              }
            />
          </Panel>
        </>
      ) : step === "select" ? (
        <PanningMountainBackground scrimOpacity={0.76}>
          <Text style={s.eyebrow}>
            THREE COMPANIONS · THREE DIFFERENT ELEMENTS
          </Text>
          <View style={s.slots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={s.slot}>
                <Text style={s.text}>{i + 1}</Text>
                {selected[i] ? (
                  <Image
                    source={creatureArt[selected[i]].icon}
                    style={{ width: 55, height: 55 }}
                  />
                ) : (
                  <Text style={s.text}>—</Text>
                )}
              </View>
            ))}
          </View>
          <Text style={s.note}>Opponent team: ? / ? / ?</Text>
          {new Set(
            save.ownedCreatureIds
              .filter((c) => CREATURES[c].role !== "boss")
              .map((c) => CREATURES[c].element),
          ).size < 3 ? (
            <Text style={s.note}>
              Catch creatures of three different elements to challenge a
              Trainer.
            </Text>
          ) : null}
          <ScrollView contentContainerStyle={s.list}>
            {PLAYER_IDS.filter((c) => save.ownedCreatureIds.includes(c)).map(
              (c) => {
                const creature = CREATURES[c],
                  index = selected.indexOf(c),
                  same = selected.some(
                    (x) => CREATURES[x].element === creature.element,
                  ),
                  disabled = index < 0 && (same || selected.length === 3);
                return (
                  <Pressable
                    key={c}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${creature.name}`}
                    accessibilityState={{ selected: index >= 0, disabled }}
                    disabled={disabled}
                    onPress={() => choose(c)}
                    style={[
                      s.card,
                      index >= 0 && s.chosen,
                      disabled && { opacity: 0.45 },
                    ]}
                  >
                    <View style={{ flex: 1, gap: 7 }}>
                      <Text style={s.cardName}>
                        {index >= 0 ? `${index + 1}. ` : ""}
                        {creature.name}
                      </Text>
                      <Text style={{ color: elementColors[creature.element] }}>
                        {creature.element.toUpperCase()} · {creature.buff.label}
                      </Text>
                      {disabled && same ? (
                        <Text style={s.note}>Element already selected</Text>
                      ) : null}
                    </View>
                    <Image source={creatureArt[c].icon} style={s.icon} />
                  </Pressable>
                );
              },
            )}
          </ScrollView>
          <View style={s.footer}>
            <Text style={s.text}>
              Selected {selected.length}/3 · Tap again to remove
            </Text>
            <GameButton
              label="CONFIRM TEAM"
              disabled={!validTeam(selected, save.ownedCreatureIds)}
              onPress={begin}
            />
          </View>
        </PanningMountainBackground>
      ) : battle && player && enemy ? (
        <>
          <View style={s.teamLine}>
            <Text style={s.text}>
              YOU {battle.player.map((p) => (p.hp > 0 ? "●" : "○")).join(" ")} ·
              SHIELD {battle.playerShield ? 1 : 0}
            </Text>
            <Text style={s.text}>
              RIVAL{" "}
              {battle.enemy
                .map((e, i) =>
                  e.hp <= 0 ? "○" : i <= battle.enemyIndex ? "●" : "?",
                )
                .join(" ")}{" "}
              · {battle.enemyShield ? "⬡" : "○"}
            </Text>
          </View>
          <View style={s.enemyStats}>
            <Text style={s.cardName}>
              {CREATURES[enemy.id].name} ·{" "}
              {CREATURES[enemy.id].element.toUpperCase()}
            </Text>
            <ProgressBar
              value={enemy.hp}
              maximum={maxHpFor(enemy.id, TRAINER_RULES.enemyHp)}
              color={elementColors[CREATURES[enemy.id].element]}
            />
            <Text style={s.text}>{enemy.hp} HP</Text>
          </View>
          <View
            style={[
              s.matchup,
              matchup > 1 ? s.matchupStrong : matchup < 1 ? s.matchupWeak : null,
            ]}
          >
            <Text style={s.matchupText}>{matchupLabel}</Text>
          </View>
          <ImageBackground
            source={require("../../../assets/game/backgrounds/faculty-backs.png")}
            style={s.arena}
          >
            <View style={s.enemy}>
              <View style={s.platform} />
              {ultimateImpact?.side === "enemy" ? (
                <UltimateEffect key={"ultimate-" + ultimateImpact.key} />
              ) : null}
              <AnimatedCreature
                grounded
                creatureId={enemy.id}
                receivingHit={action === "player"}
                size={160}
                action={action === "enemy" ? "attack" : "idle"}
              />
              {impact?.side === "player" ? (
                <ElementImpact
                  key={"basic-" + impact.key}
                  element={CREATURES[player.id].element}
                />
              ) : null}
            </View>
            <View style={s.player}>
              <View style={s.platform} />
              {ultimateImpact?.side === "player" ? (
                <UltimateEffect key={"ultimate-" + ultimateImpact.key} />
              ) : null}
              <AnimatedCreature
                grounded
                creatureId={player.id}
                receivingHit={action === "enemy"}
                size={170}
                action={action === "player" ? "attack" : "idle"}
                flipped
              />
              {impact?.side === "enemy" ? (
                <ElementImpact
                  key={"basic-" + impact.key}
                  element={CREATURES[enemy.id].element}
                />
              ) : null}
            </View>
          </ImageBackground>
          <View style={s.footer}>
            <Text style={s.cardName}>
              {CREATURES[player.id].name} · {player.hp} HP
            </Text>
            <ProgressBar
              value={player.hp}
              maximum={maxHpFor(player.id)}
              color={palette.success}
            />
            <Text style={s.text}>ENERGY {player.energy}%</Text>
            <ProgressBar
              value={player.energy}
              maximum={100}
              color={palette.yellow}
            />
            <View style={s.buttons}>
              <GameButton
                label="TAP ATTACK"
                style={{ flex: 1 }}
                disabled={
                  !!feedback || battle.phase !== "fight" || switching || !active
                }
                onPress={() => dispatch({ type: "tap", now: Date.now() })}
              />
              <GameButton
                label="ULTIMATE"
                style={{ flex: 1 }}
                disabled={
                  !!feedback ||
                  battle.phase !== "fight" ||
                  player.energy < 100 ||
                  switching ||
                  !active
                }
                onPress={() => dispatch({ type: "ultimate" })}
              />
            </View>
            <GameButton
              label={
                battle.switchReady
                  ? "SWITCH COMPANION"
                  : "SWITCH LOCKED UNTIL FAINT"
              }
              variant="secondary"
              disabled={
                !!feedback ||
                !battle.switchReady ||
                battle.phase !== "fight" ||
                !battle.player.some(
                  (p, i) => i !== battle.playerIndex && p.hp > 0,
                )
              }
              onPress={() => setSwitching(true)}
            />
          </View>
          {feedback ? (
            <View
              pointerEvents="auto"
              style={[s.overlay, { zIndex: 45, backgroundColor: "#10233E66" }]}
            >
              <Panel style={s.dialog}>
                <>
                  {feedback === "Blocked!" ? (
                    <Text
                      style={{
                        fontSize: 52,
                        textAlign: "center",
                        color: "#319AAA",
                      }}
                    >
                      ⬡ ⬡ ⬡
                    </Text>
                  ) : null}
                  <Text style={s.dialogTitle}>{feedback}</Text>
                </>
              </Panel>
            </View>
          ) : null}
          {battle.phase === "charge" && !feedback ? (
            <ChargeChallenge
              element={CREATURES[player.id].element}
              active={active}
              onComplete={(hits) => dispatch({ type: "charge", hits })}
            />
          ) : null}
          {battle.phase === "shield" && !feedback ? (
            <View style={s.overlay}>
              <Panel style={s.dialog}>
                <Text style={s.dialogTitle}>INCOMING ULTIMATE!</Text>
                <Text style={s.body}>
                  Three seconds to react. Shield blocks 80%.
                </Text>
                <GameButton
                  label="USE SHIELD"
                  disabled={!battle.playerShield || !active}
                  onPress={() => dispatch({ type: "defend", shield: true })}
                />
                <GameButton
                  label="TAKE HIT"
                  disabled={!active}
                  onPress={() => dispatch({ type: "defend", shield: false })}
                />
              </Panel>
            </View>
          ) : null}
          {switching || battle.phase === "replace" ? (
            <View style={s.overlay}>
              <Panel style={s.dialog}>
                <Text style={s.dialogTitle}>
                  {battle.phase === "replace"
                    ? "CHOOSE YOUR NEXT ECHO"
                    : "SWITCH COMPANION"}
                </Text>
                {battle.player.map((p, i) => (
                  <GameButton
                    key={i}
                    label={`${CREATURES[p.id].name} · ${p.hp} HP · ${p.energy}%`}
                    disabled={p.hp <= 0 || i === battle.playerIndex || !active}
                    onPress={() => {
                      dispatch({ type: "switch", index: i });
                      setSwitching(false);
                    }}
                  />
                ))}
                {battle.phase !== "replace" ? (
                  <GameButton
                    label="CANCEL"
                    variant="ghost"
                    onPress={() => setSwitching(false)}
                  />
                ) : null}
              </Panel>
            </View>
          ) : null}
          {battle.phase === "won" || battle.phase === "lost" ? (
            <View style={s.overlay}>
              <Panel style={s.dialog}>
                <AnimatedFacultyPortrait
                  trainerId={id}
                  style={{ width: 100, height: 100, alignSelf: "center" }}
                />
                <Text style={s.dialogTitle}>
                  {battle.phase === "won"
                    ? "FACULTY CHALLENGE COMPLETE"
                    : "YOUR TEAM FAINTED"}
                </Text>
                <Text style={s.body}>
                  {battle.phase === "won"
                    ? `${trainer.name}: ${trainer.closing}`
                    : "Try different elements and save your shield for an Ultimate."}
                </Text>
                {battle.phase === "lost" ? (
                  <>
                    <GameButton
                      label="TRY AGAIN"
                      disabled={!resultReady || !active}
                      onPress={retry}
                    />
                    <GameButton
                      label="CHANGE TEAM"
                      disabled={!resultReady || !active}
                      onPress={() => setStep("select")}
                    />
                  </>
                ) : null}
                <GameButton
                  label="CONTINUE"
                  disabled={!resultReady || !active}
                  onPress={returnToMap}
                />
              </Panel>
            </View>
          ) : null}
        </>
      ) : null}
      {battleTransition ? (
        <Animated.View
          pointerEvents="auto"
          style={[s.battleFade, { opacity: battleFade }]}
        />
      ) : null}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.navy },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: palette.navyLight,
    borderBottomWidth: 2,
    borderBottomColor: palette.navy,
  },
  back: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: palette.navy,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.aqua,
  },
  backText: {
    color: palette.aqua,
    fontFamily: fonts.pixelBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  text: {
    color: palette.cream,
    fontFamily: fonts.pixel,
    fontSize: 12,
  },
  title: {
    color: palette.yellow,
    fontFamily: fonts.pixelBold,
    fontSize: 14,
    flex: 1,
    letterSpacing: 0.5,
  },
  eyebrow: {
    color: palette.yellow,
    fontFamily: fonts.pixelBold,
    textAlign: "center",
    fontSize: 11,
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  introArena: {
    height: 280,
    marginTop: 8,
    borderBottomWidth: 3,
    borderBottomColor: palette.navyLight,
  },
  trainer: {
    position: "absolute",
    width: 160,
    height: 160,
    right: 20,
    top: 5,
  },
  trainerImage: { height: "100%", width: "100%" },
  avatar: {
    position: "absolute",
    width: 145,
    height: 145,
    left: 15,
    bottom: 0,
  },
  dialog: {
    margin: 16,
    gap: 12,
  },
  dialogTitle: {
    fontFamily: fonts.pixelBold,
    color: palette.navy,
    fontSize: 15,
    lineHeight: 23,
  },
  pageIndicator: {
    alignSelf: "flex-end",
    color: palette.aquaDark,
    fontFamily: fonts.pixelBold,
    fontSize: 8,
  },
  body: {
    fontFamily: fonts.body,
    color: palette.ink,
    fontSize: 13,
    lineHeight: 20,
  },
  note: {
    fontFamily: fonts.body,
    color: palette.muted,
    fontSize: 11,
    textAlign: "center",
    padding: 4,
  },
  slots: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    padding: 10,
  },
  slot: {
    width: 86,
    height: 88,
    borderWidth: 2,
    borderColor: palette.aquaDark,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    backgroundColor: palette.navyLight,
  },
  list: {
    padding: 14,
    gap: 10,
  },
  card: {
    backgroundColor: palette.navyLight,
    borderColor: palette.navy,
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 92,
  },
  chosen: {
    backgroundColor: "#1D3E5D",
    borderColor: palette.yellow,
    borderWidth: 2,
  },
  cardName: {
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 14,
  },
  icon: {
    width: 64,
    height: 64,
  },
  footer: {
    padding: 14,
    gap: 10,
    backgroundColor: palette.navyLight,
    borderTopWidth: 2,
    borderTopColor: palette.navy,
  },
  teamLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.navyLight,
    borderBottomWidth: 1,
    borderBottomColor: palette.navy,
  },
  enemyStats: {
    padding: 12,
    gap: 6,
    alignSelf: "flex-end",
    width: "82%",
    backgroundColor: "rgba(16, 38, 62, 0.85)",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: palette.navyLight,
  },
  matchup: {
    alignSelf: "center",
    backgroundColor: palette.navyLight,
    borderColor: palette.navy,
    borderRadius: 999,
    borderWidth: 2,
    marginVertical: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  matchupStrong: {
    backgroundColor: "#73D690",
  },
  matchupWeak: {
    backgroundColor: "#FF899D",
  },
  matchupText: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 8,
  },
  arena: {
    flex: 1,
    minHeight: 240,
  },
  enemy: {
    position: "absolute",
    right: 8,
    top: "24%",
    alignItems: "center",
  },
  player: {
    position: "absolute",
    left: 0,
    bottom: 0,
    alignItems: "center",
  },
  platform: {
    position: "absolute",
    bottom: -10,
    width: 150,
    height: 100,
    borderRadius: 75,
    transform: [{ scaleY: 0.3 }],
    backgroundColor: "#62844EE6",
    borderWidth: 2,
    borderColor: "#8EBE6388",
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.scrim,
    justifyContent: "center",
    zIndex: 30,
  },
  battleFade: {
    backgroundColor: "#000000",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 100,
  },
});
