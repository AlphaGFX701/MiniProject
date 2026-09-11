import { useEffect, useRef, useState } from "react";
import {
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
import { AnimatedCreature } from "../components/animated-creature";
import { ChargeChallenge } from "../components/charge-challenge";
import { ElementImpact } from "../components/element-impact";
import { UltimateEffect } from "../components/ultimate-effect";
import { GameButton, Panel, ProgressBar } from "../components/game-ui";
import {
  createTeamBattle,
  randomBossTeam,
  teamBattleReducer,
  validTeam,
  type BattleEvent,
  type TeamBattle,
} from "../team-battle";
import { maxHpFor } from "../logic";
import { elementColors, fonts, palette } from "../theme";
import type { CreatureId, LandmarkId } from "../types";

export const FACULTY: Record<
  LandmarkId,
  { name: string; intro: string; closing: string; portrait: number }
> = {
  faculty: {
    name: "Dr. Soradech",
    closing: "Good teamwork turns small steps into progress.",
    intro:
      "Welcome to Computer Education. Let us discover what your team can do together!",
    portrait: require("../../../assets/game/faculty/trainer-0.png"),
  },
  building44: {
    name: "Dr. Vatinee",
    closing: "Keep experimenting. Every challenge can teach you something.",
    intro: "Every challenge is a chance to learn. Show me how you adapt!",
    portrait: require("../../../assets/game/faculty/trainer-1.png"),
  },
  plaza: {
    name: "Panamet",
    closing: "Small companions, big courage. Keep exploring!",
    intro:
      "Small companions can achieve great things. Ready for a friendly challenge?",
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
  const [feedback, setFeedback] = useState("");
  const feedbackTime = useRef(0);
  const resultTime = useRef(0);
  const pendingBattle = useRef<TeamBattle | null>(null);
  const [resultReady, setResultReady] = useState(false);
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
    const timer = setInterval(
      () => dispatchRef.current({ type: "enemy" }),
      1200,
    );
    return () => clearInterval(timer);
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
      battle ? battle.enemy.map((slot) => slot.id) : randomBossTeam(),
    );
    battleRef.current = next;
    setBattle(next);
    setStep("battle");
    rewarded.current = false;
    resultTime.current = 0;
    setResultReady(false);
    setVictoryMusic(false);
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
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          onPress={returnToMap}
          style={s.back}
        >
          <Text style={s.text}>‹ MAP</Text>
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
            <Image source={trainer.portrait} style={s.trainer} />
            <Image source={playerFrames.up[0]} style={s.avatar} />
            <Text style={s.mystery}>? ? ?</Text>
          </ImageBackground>
          <Panel style={s.dialog}>
            <Text style={s.dialogTitle}>
              {trainer.name} would like to battle!
            </Text>
            <Text style={s.body}>
              {dialogPage === 0
                ? trainer.intro
                : "Choose three companions with different elements. Your opponent will reveal their team during the battle."}
            </Text>
            <Text style={s.note}>
              A fictional friendly challenge inspired by the CED faculty.
            </Text>
            <GameButton
              label={dialogPage === 0 ? "NEXT" : "CHOOSE YOUR TEAM"}
              onPress={() =>
                dialogPage === 0 ? setDialogPage(1) : setStep("select")
              }
            />
          </Panel>
        </>
      ) : step === "select" ? (
        <>
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
        </>
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
              maximum={maxHpFor(enemy.id, 120)}
              color={elementColors[CREATURES[enemy.id].element]}
            />
            <Text style={s.text}>{enemy.hp} HP</Text>
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
                <Image
                  source={trainer.portrait}
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
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#17152F" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  back: { minHeight: 48, justifyContent: "center", padding: 10 },
  text: { color: palette.cream, fontSize: 12 },
  title: {
    color: palette.cream,
    fontFamily: fonts.pixelBold,
    fontSize: 13,
    flex: 1,
  },
  eyebrow: {
    color: palette.yellow,
    textAlign: "center",
    fontSize: 11,
    padding: 10,
  },
  introArena: { height: 280, marginTop: 18 },
  trainer: { position: "absolute", width: 160, height: 160, right: 20, top: 5 },
  avatar: {
    position: "absolute",
    width: 145,
    height: 145,
    left: 15,
    bottom: 0,
  },
  mystery: {
    position: "absolute",
    right: 30,
    bottom: 20,
    color: "white",
    fontSize: 24,
  },
  dialog: { margin: 16, gap: 14 },
  dialogTitle: {
    fontFamily: fonts.pixelBold,
    color: palette.navy,
    fontSize: 15,
    lineHeight: 23,
  },
  body: { color: palette.ink, fontSize: 15, lineHeight: 23 },
  note: { color: "#B7ABCB", fontSize: 11, textAlign: "center", padding: 4 },
  slots: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    padding: 10,
  },
  slot: {
    width: 82,
    height: 84,
    borderWidth: 2,
    borderColor: "#9E8DFC",
    borderRadius: 12,
    alignItems: "center",
    padding: 4,
  },
  list: { padding: 14, gap: 10 },
  card: {
    backgroundColor: "#43388B",
    borderColor: "#9B8DEE",
    borderWidth: 2,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 94,
  },
  chosen: { backgroundColor: "#6651BA", borderColor: palette.yellow },
  cardName: { color: "white", fontSize: 16, fontWeight: "bold" },
  icon: { width: 66, height: 66 },
  footer: { padding: 14, gap: 8, backgroundColor: "#211C3F" },
  teamLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  enemyStats: { padding: 12, gap: 6, alignSelf: "flex-end", width: "82%" },
  arena: { flex: 1, minHeight: 240 },
  enemy: { position: "absolute", right: 8, top: "24%", alignItems: "center" },
  player: { position: "absolute", left: 0, bottom: 0, alignItems: "center" },
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
  buttons: { flexDirection: "row", gap: 8 },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0A092BCC",
    justifyContent: "center",
    zIndex: 30,
  },
});
