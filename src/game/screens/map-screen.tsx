import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppState,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import {
  CampusWebMap,
  type CampusMapHandle,
} from "../components/campus-web-map";
import * as Location from "expo-location";
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { creatureArt, playerFrames, echoOrb } from "../assets";
import {
  CAMPUS_CENTER,
  CREATURES,
  DEMO_SPEED_METERS_PER_SECOND,
  ENCOUNTER_LIST,
  ENCOUNTERS,
  coreComplete,
  coreCount,
  WEAK_GPS_ACCURACY_METERS,
} from "../data";
import { FACULTY } from "./trainer-screen";
import { availableEncounters } from "../save-rules";
import { ElementBadge, GameButton, Panel } from "../components/game-ui";
import { Joystick } from "../components/joystick";
import { useGame } from "../game-context";
import { distanceMeters, moveCoordinate, typeMultiplier } from "../logic";
import { elementColors, fonts, palette } from "../theme";
import type { Coordinate, CreatureId, EncounterId, LandmarkId } from "../types";

type Direction = keyof typeof playerFrames;
type PermissionState = "checking" | "granted" | "denied" | "services-off";

const INITIAL_REGION: Region = {
  ...CAMPUS_CENTER,
  latitudeDelta: 0.0028,
  longitudeDelta: 0.0026,
};

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#17283D" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#C3D6E8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#17283D" }] },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#243D43" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#62768C" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#163F60" }],
  },
];

export function MapScreen() {
  const {
    save,
    markHint,
    locationMode,
    demoCoordinate,
    setLocationMode,
    setDemoCoordinate,
    startBattle,
    openCollection,
    openSettings,
    openTrainer,
  } = useGame();
  const webMapRef = useRef<CampusMapHandle>(null);
  const usePreviewMap = Constants.executionEnvironment === "storeClient";
  const camera = useCallback(
    (
      c: { center: Coordinate; zoom?: number },
      options?: { duration: number },
    ) => {
      if (usePreviewMap) webMapRef.current?.animateCamera(c, options);
      else mapRef.current?.animateCamera(c, options);
    },
    [usePreviewMap],
  );
  const mapRef = useRef<MapView>(null);
  const demoCoordinateRef = useRef(demoCoordinate);
  const movementRef = useRef({ x: 0, y: 0 });
  const previousGpsRef = useRef<Coordinate | null>(null);
  const [gpsCoordinate, setGpsCoordinate] = useState<Coordinate | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("checking");
  const [retryToken, setRetryToken] = useState(0);
  const [selectedEncounterId, setSelectedEncounterId] = useState<EncounterId>(
    () =>
      ENCOUNTER_LIST.find(
        (item) => !save.completedEncounterIds.includes(item.id),
      )?.id ?? "faculty",
  );
  const [showCompanions, setShowCompanions] = useState(false);
  const [chosenCompanion, setChosenCompanion] = useState<CreatureId>(
    save.activeCompanionId,
  );
  const [direction, setDirection] = useState<Direction>("down");
  const [moving, setMoving] = useState(false);
  const [playerFrame, setPlayerFrame] = useState(0);
  const [measuredPanelHeight, setPanelHeight] = useState(300);
  const [panelKind, setPanelKind] = useState<"encounter" | "trainer">(
    "encounter",
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const panelHeight = detailsOpen ? measuredPanelHeight : 20;
  const selectMarker = (id: EncounterId) => {
    setPanelKind("encounter");
    setSelectedEncounterId(id);
    setDetailsOpen(true);
    markHint("mapHintSeen");
  };
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active",
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setAppActive(state === "active");
      if (state !== "active") {
        movementRef.current = { x: 0, y: 0 };
        setMoving(false);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    demoCoordinateRef.current = demoCoordinate;
  }, [demoCoordinate]);

  useEffect(() => {
    if (!moving) return;
    const timer = setInterval(
      () => setPlayerFrame((frame) => (frame + 1) % 4),
      150,
    );
    return () => clearInterval(timer);
  }, [moving]);

  useEffect(() => {
    if (locationMode !== "gps" || !appActive) return;
    let active = true;
    let subscription: Location.LocationSubscription | null = null;
    let movementTimer: ReturnType<typeof setTimeout> | undefined;

    async function startGps() {
      setPermissionState("checking");
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!active) return;
      if (!servicesEnabled) {
        setPermissionState("services-off");
        return;
      }
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== "granted" && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (!active) return;
      if (permission.status !== "granted") {
        setPermissionState("denied");
        return;
      }
      setPermissionState("granted");

      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 30_000,
        requiredAccuracy: 100,
      });
      if (active && lastKnown) updateGps(lastKnown);
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 2,
          timeInterval: 1_000,
        },
        updateGps,
      );
      if (!active) subscription.remove();
    }

    function updateGps(location: Location.LocationObject) {
      if (!active) return;
      clearTimeout(movementTimer);
      movementTimer = setTimeout(() => setMoving(false), 1500);
      const next = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      const previous = previousGpsRef.current;
      if (previous) {
        const latitudeDelta = next.latitude - previous.latitude;
        const longitudeDelta = next.longitude - previous.longitude;
        const travelled = distanceMeters(previous, next);
        setMoving(travelled > 0.7);
        if (travelled > 0.7) {
          if (Math.abs(longitudeDelta) > Math.abs(latitudeDelta))
            setDirection(longitudeDelta > 0 ? "right" : "left");
          else setDirection(latitudeDelta > 0 ? "up" : "down");
        }
      }
      previousGpsRef.current = next;
      setGpsCoordinate(next);
      setGpsAccuracy(location.coords.accuracy ?? null);
    }

    void startGps().catch(() => {
      if (active) setPermissionState("denied");
    });
    return () => {
      active = false;
      clearTimeout(movementTimer);
      subscription?.remove();
    };
  }, [locationMode, retryToken, appActive]);

  useEffect(() => {
    if (locationMode !== "demo" || !appActive) return;
    const timer = setInterval(() => {
      const vector = movementRef.current;
      const magnitude = Math.min(1, Math.hypot(vector.x, vector.y));
      if (magnitude < 0.05) return;
      const next = moveCoordinate(
        demoCoordinateRef.current,
        vector,
        DEMO_SPEED_METERS_PER_SECOND * 0.05 * magnitude,
      );
      demoCoordinateRef.current = next;
      setDemoCoordinate(next);
      camera({ center: next }, { duration: 60 });
    }, 50);
    return () => clearInterval(timer);
  }, [locationMode, setDemoCoordinate, camera, appActive]);

  const playerCoordinate =
    locationMode === "demo" ? demoCoordinate : (gpsCoordinate ?? CAMPUS_CENTER);
  const selectedEncounter = ENCOUNTERS[selectedEncounterId];
  const landmark =
    ENCOUNTER_LIST.find(
      (item) =>
        item.coordinate.latitude === selectedEncounter.coordinate.latitude,
    ) ?? ENCOUNTER_LIST[0];
  const unlocked = coreComplete(save.completedEncounterIds);
  const nearbyOptions = availableEncounters(save, landmark.id as LandmarkId);
  const selectedCreature = CREATURES[selectedEncounter.creatureId];
  const selectedDistance = distanceMeters(
    playerCoordinate,
    selectedEncounter.coordinate,
  );
  const selectedComplete = save.completedEncounterIds.includes(
    selectedEncounter.id,
  );
  const weakGps =
    locationMode === "gps" &&
    gpsAccuracy !== null &&
    gpsAccuracy > WEAK_GPS_ACCURACY_METERS;
  const canEnter =
    selectedDistance <= selectedEncounter.radiusMeters &&
    !selectedComplete &&
    !weakGps &&
    (locationMode === "demo" || permissionState === "granted");

  const orderedOwned = useMemo(
    () =>
      save.ownedCreatureIds.filter(
        (id) =>
          CREATURES[id].role === "starter" ||
          save.completedEncounterIds.length > 0,
      ),
    [save.completedEncounterIds.length, save.ownedCreatureIds],
  );

  const handleJoystick = useCallback((vector: { x: number; y: number }) => {
    movementRef.current = vector;
    const active = Math.hypot(vector.x, vector.y) > 0.08;
    setMoving(active);
    if (!active) return;
    if (Math.abs(vector.x) > Math.abs(vector.y))
      setDirection(vector.x > 0 ? "right" : "left");
    else setDirection(vector.y > 0 ? "down" : "up");
  }, []);

  const enterDemoMode = useCallback(() => {
    const start =
      gpsCoordinate && distanceMeters(gpsCoordinate, CAMPUS_CENTER) <= 1_000
        ? gpsCoordinate
        : CAMPUS_CENTER;
    demoCoordinateRef.current = start;
    setLocationMode("demo", start);
    setPermissionState((current) => current);
    setTimeout(
      () => camera({ center: start, zoom: 18 }, { duration: 500 }),
      50,
    );
  }, [gpsCoordinate, setLocationMode, camera]);

  const recenter = () =>
    camera({ center: playerCoordinate, zoom: 18 }, { duration: 450 });

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.webFallback}>
        <Panel style={styles.webPanel}>
          <Text style={styles.panelTitle}>ANDROID EXPEDITION</Text>
          <Text style={styles.body}>
            Open ECHO HUNT in Expo Go or an Android emulator to use Google Maps
            and GPS.
          </Text>
        </Panel>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {usePreviewMap ? (
        <CampusWebMap
          ref={webMapRef}
          coordinate={playerCoordinate}
          direction={direction}
          frame={moving ? playerFrame : 0}
          onSelect={selectMarker}
          onDismiss={() => setDetailsOpen(false)}
          completedIds={save.completedEncounterIds}
          facultyUnlocked={coreComplete(save.completedEncounterIds)}
          onTrainer={(id) => {
            selectMarker(id);
            setPanelKind("trainer");
          }}
        />
      ) : (
        <MapView
          ref={mapRef}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFill}
          initialRegion={INITIAL_REGION}
          customMapStyle={MAP_STYLE}
          mapPadding={{ top: 90, right: 16, bottom: 170, left: 16 }}
          onPress={(event) => {
            if (event.nativeEvent.action !== "marker-press")
              setDetailsOpen(false);
          }}
          toolbarEnabled={false}
          showsCompass={false}
          showsMyLocationButton={false}
        >
          {ENCOUNTER_LIST.map((point) => (
            <Marker
              key={"trainer-" + point.id}
              coordinate={{
                latitude: point.coordinate.latitude + 0.00016,
                longitude: point.coordinate.longitude + 0.00022,
              }}
              onPress={() => {
                selectMarker(point.id);
                setPanelKind("trainer");
              }}
            >
              <View style={styles.encounterMarker}>
                <Image
                  source={FACULTY[point.id as LandmarkId].portrait}
                  style={styles.markerCreature}
                />
                <Text style={styles.markerCheck}>
                  {coreComplete(save.completedEncounterIds) ? "!" : "🔒"}
                </Text>
              </View>
            </Marker>
          ))}
          {ENCOUNTER_LIST.map((encounter) => {
            const creature = CREATURES[encounter.creatureId];
            const completed = save.completedEncounterIds.includes(encounter.id);
            return (
              <Fragment key={encounter.id}>
                <Circle
                  center={encounter.coordinate}
                  radius={encounter.radiusMeters}
                  fillColor={`${elementColors[creature.element]}22`}
                  strokeColor={
                    completed ? palette.muted : elementColors[creature.element]
                  }
                  strokeWidth={2}
                />
                <Marker
                  coordinate={encounter.coordinate}
                  onPress={() => selectMarker(encounter.id)}
                  zIndex={2}
                >
                  <View
                    style={[
                      styles.encounterMarker,
                      { borderColor: elementColors[creature.element] },
                      completed ? styles.completedMarker : null,
                    ]}
                  >
                    <Image
                      source={creatureArt[encounter.creatureId].icon}
                      style={[
                        styles.markerCreature,
                        !completed && { tintColor: palette.navy },
                      ]}
                      resizeMode="contain"
                    />
                    {completed ? (
                      <Text style={styles.markerCheck}>✓</Text>
                    ) : null}
                  </View>
                </Marker>
              </Fragment>
            );
          })}
          <Circle
            center={playerCoordinate}
            radius={40}
            strokeColor="#66E8D1"
            strokeWidth={2}
            fillColor="#66E8D115"
          />
          <Marker
            coordinate={playerCoordinate}
            anchor={{ x: 0.5, y: 0.78 }}
            zIndex={10}
            tracksViewChanges={true}
          >
            <View style={styles.playerMarker}>
              <View style={styles.playerPulse} />
              <Image
                source={playerFrames[direction][moving ? playerFrame : 0]}
                style={styles.playerSprite}
                resizeMode="contain"
              />
            </View>
          </Marker>
        </MapView>
      )}

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.topRow}>
          <Panel style={styles.progressPanel}>
            <Text style={styles.smallLabel}>CAMPUS FIELD GUIDE</Text>
            <Text style={styles.progressText}>
              ECHOES FOUND {coreCount(save.completedEncounterIds)}/3
            </Text>
          </Panel>
          <View style={styles.topButtons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={openSettings}
              style={styles.squareButton}
            >
              <Text style={styles.squareIcon}>⚙</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.modePill,
            locationMode === "demo" ? styles.demoPill : styles.gpsPill,
          ]}
        >
          <Text style={styles.modeText}>
            {locationMode === "demo"
              ? "DEMO LOCATION"
              : weakGps
                ? "WEAK GPS SIGNAL"
                : "LIVE GPS"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Pokedex"
          onPress={openCollection}
          style={{
            position: "absolute",
            left: 18,
            bottom: panelHeight + 148,
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: palette.cream,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image source={echoOrb} style={{ width: 36, height: 36 }} />
        </Pressable>
        {locationMode === "demo" ? (
          <View style={[styles.joystickArea, { bottom: panelHeight + 24 }]}>
            <Joystick onVectorChange={handleJoystick} />
          </View>
        ) : null}

        <View style={[styles.floatingButtons, { bottom: panelHeight + 24 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Recenter map"
            onPress={recenter}
            style={styles.roundButton}
          >
            <Text style={styles.roundIcon}>⌖</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              locationMode === "demo" ? "Return to GPS" : "Enter Demo Walk"
            }
            onPress={() => {
              if (locationMode === "demo") {
                movementRef.current = { x: 0, y: 0 };
                setMoving(false);
                setLocationMode("gps");
              } else enterDemoMode();
            }}
            style={styles.modeButton}
          >
            <Text style={styles.modeButtonText}>
              {locationMode === "demo" ? "RETURN TO GPS" : "DEMO WALK"}
            </Text>
          </Pressable>
        </View>

        {!save.mapHintSeen && !detailsOpen ? (
          <Text
            style={{
              position: "absolute",
              top: 155,
              alignSelf: "center",
              color: palette.cream,
              backgroundColor: palette.navy,
              padding: 12,
              borderRadius: 16,
            }}
          >
            Tap a marker to explore
          </Text>
        ) : null}
        {detailsOpen ? (
          <View
            onLayout={(event) =>
              setPanelHeight(event.nativeEvent.layout.height)
            }
            style={styles.encounterPanel}
          >
            <Panel style={{ padding: 12, gap: 6 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close details"
                onPress={() => setDetailsOpen(false)}
                style={{
                  alignSelf: "flex-end",
                  minHeight: 48,
                  minWidth: 48,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>×</Text>
              </Pressable>
              <View style={styles.encounterHeader}>
                <View style={styles.encounterTitleBlock}>
                  <Text style={styles.encounterName}>
                    {panelKind === "trainer"
                      ? FACULTY[landmark.id as LandmarkId].name.toUpperCase()
                      : selectedEncounter.shortName.toUpperCase()}
                  </Text>
                  <Text style={styles.distance}>
                    {Math.round(selectedDistance)} M AWAY ·{" "}
                    {panelKind === "trainer"
                      ? selectedDistance <= 40
                        ? "IN RANGE"
                        : "MOVE CLOSER"
                      : selectedComplete
                        ? "COMPLETED"
                        : canEnter
                          ? "IN RANGE"
                          : "MOVE CLOSER"}
                  </Text>
                </View>
                {panelKind === "encounter" ? (
                  <ElementBadge element={selectedCreature.element} />
                ) : null}
              </View>
              {panelKind === "encounter" ? (
                <View style={styles.encounterActions}>
                  <View style={styles.wildCreatureWrap}>
                    <Image
                      source={creatureArt[selectedCreature.id].icon}
                      style={styles.wildCreature}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.actionCopy}>
                    <Text style={styles.wildLabel}>
                      {selectedComplete
                        ? "ECHO RECORDED"
                        : `WILD ${selectedCreature.name.toUpperCase()}`}
                    </Text>
                  </View>
                </View>
              ) : null}
              {panelKind === "encounter" ? (
                <ScrollView
                  horizontal
                  style={{ maxHeight: 52 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {nearbyOptions.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      onPress={() => setSelectedEncounterId(item.id)}
                      style={{
                        padding: 10,
                        minHeight: 48,
                        justifyContent: "center",
                        backgroundColor:
                          item.id === selectedEncounterId
                            ? palette.yellow
                            : palette.line,
                        borderRadius: 8,
                      }}
                    >
                      <Text>
                        {save.ownedCreatureIds.includes(item.creatureId)
                          ? "✓ "
                          : ""}
                        {CREATURES[item.creatureId].name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
              {panelKind === "trainer" ? (
                unlocked ? (
                  <GameButton
                    label={`${save.facultyVictories?.includes(landmark.id as LandmarkId) ? "TALK AGAIN TO" : "TALK TO"} ${FACULTY[landmark.id as LandmarkId].name.toUpperCase()}`}
                    variant="secondary"
                    disabled={
                      selectedDistance > 40 ||
                      weakGps ||
                      (locationMode === "gps" && permissionState !== "granted")
                    }
                    onPress={() => openTrainer(landmark.id as LandmarkId)}
                  />
                ) : (
                  <Text style={styles.body}>
                    Faculty challenges unlock after all 3 landmarks.
                  </Text>
                )
              ) : null}
              {panelKind === "encounter" ? (
                <GameButton
                  label={
                    selectedComplete
                      ? "LANDMARK COMPLETE"
                      : canEnter
                        ? "ENTER ENCOUNTER"
                        : `GET WITHIN ${selectedEncounter.radiusMeters} M`
                  }
                  disabled={!canEnter}
                  onPress={() => {
                    setChosenCompanion(save.activeCompanionId);
                    setShowCompanions(true);
                  }}
                />
              ) : null}
            </Panel>
          </View>
        ) : null}

        {locationMode === "gps" && permissionState !== "granted" ? (
          <View style={styles.permissionWrap}>
            <Panel style={styles.permissionPanel}>
              <Text style={styles.panelTitle}>
                {permissionState === "services-off"
                  ? "LOCATION IS OFF"
                  : permissionState === "checking"
                    ? "FINDING YOUR LOCATION"
                    : "LOCATION ACCESS NEEDED"}
              </Text>
              <Text style={styles.body}>
                {permissionState === "checking"
                  ? "ECHO HUNT is connecting to the campus map."
                  : "Use foreground location to walk on the map, or enter Demo Walk for your presentation."}
              </Text>
              {permissionState !== "checking" ? (
                <View style={styles.permissionActions}>
                  <GameButton
                    label="TRY AGAIN"
                    onPress={() => setRetryToken((value) => value + 1)}
                    style={styles.permissionButton}
                  />
                  <GameButton
                    label="OPEN SETTINGS"
                    variant="ghost"
                    onPress={() => void Linking.openSettings()}
                    style={styles.permissionButton}
                  />
                  <GameButton
                    label="USE DEMO WALK"
                    variant="secondary"
                    onPress={enterDemoMode}
                    style={styles.permissionButton}
                  />
                </View>
              ) : null}
            </Panel>
          </View>
        ) : null}
      </SafeAreaView>

      <Modal
        visible={showCompanions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanions(false)}
      >
        <View style={styles.modalScrim}>
          <Panel style={styles.companionModal}>
            <Text style={styles.smallLabel}>CHOOSE YOUR COMPANION</Text>
            <Text style={styles.panelTitle}>
              COUNTER {selectedCreature.name.toUpperCase()}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.companionList}
            >
              {orderedOwned.map((id) => {
                const creature = CREATURES[id];
                const selected = chosenCompanion === id;
                const multiplier = typeMultiplier(
                  creature.element,
                  selectedCreature.element,
                );
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    onPress={() => setChosenCompanion(id)}
                    style={[
                      styles.companionCard,
                      selected ? styles.companionSelected : null,
                    ]}
                  >
                    <Image
                      source={creatureArt[id].icon}
                      style={styles.companionIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.companionName}>
                      {creature.name.toUpperCase()}
                    </Text>
                    <ElementBadge element={creature.element} />
                    <Text
                      style={[
                        styles.matchup,
                        multiplier > 1
                          ? styles.strong
                          : multiplier < 1
                            ? styles.weak
                            : null,
                      ]}
                    >
                      {multiplier > 1
                        ? "STRONG MATCH"
                        : multiplier < 1
                          ? "WEAK MATCH"
                          : "EVEN MATCH"}
                    </Text>
                    <Text style={styles.buff}>{creature.buff.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <GameButton
              label={`BATTLE WITH ${CREATURES[chosenCompanion].name.toUpperCase()}`}
              disabled={!canEnter}
              onPress={() => {
                setShowCompanions(false);
                startBattle(selectedEncounter.id, chosenCompanion);
              }}
            />
            <GameButton
              label="CANCEL"
              variant="ghost"
              onPress={() => setShowCompanions(false)}
            />
          </Panel>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    bottom: 0,
    justifyContent: "space-between",
    left: 0,
    padding: 12,
    position: "absolute",
    right: 0,
    top: 0,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  progressPanel: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallLabel: {
    color: palette.aquaDark,
    fontFamily: fonts.pixelBold,
    fontSize: 8,
  },
  progressText: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 9,
    marginTop: 7,
  },
  topButtons: { flexDirection: "row", gap: 8, marginRight: 44 },
  squareButton: {
    alignItems: "center",
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 14,
    borderWidth: 3,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  squareIcon: { color: palette.navy, fontSize: 22 },
  modePill: {
    alignSelf: "center",
    borderColor: palette.navy,
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 13,
    paddingVertical: 7,
    position: "absolute",
    top: 106,
  },
  gpsPill: { backgroundColor: palette.success },
  demoPill: { backgroundColor: palette.yellow },
  modeText: { color: palette.navy, fontFamily: fonts.pixelBold, fontSize: 8 },
  joystickArea: { bottom: 275, left: 14, position: "absolute" },
  floatingButtons: {
    alignItems: "flex-end",
    bottom: 275,
    gap: 8,
    position: "absolute",
    right: 14,
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: palette.cream,
    borderColor: palette.navy,
    borderRadius: 28,
    borderWidth: 3,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  roundIcon: { color: palette.navy, fontSize: 28 },
  modeButton: {
    alignItems: "center",
    backgroundColor: palette.yellow,
    borderColor: palette.navy,
    borderRadius: 12,
    borderWidth: 3,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  modeButtonText: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 8,
  },
  encounterPanel: { bottom: 18, left: 12, position: "absolute", right: 12 },
  encounterHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  encounterTitleBlock: { flex: 1 },
  encounterName: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 11,
    lineHeight: 16,
  },
  distance: {
    color: palette.aquaDark,
    fontFamily: fonts.pixelBold,
    fontSize: 8,
    marginTop: 5,
  },
  encounterActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginVertical: 9,
  },
  wildCreatureWrap: {
    alignItems: "center",
    backgroundColor: "#E6F3ED",
    borderColor: palette.navy,
    borderRadius: 12,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  wildCreature: { height: 30, width: 30 },
  actionCopy: { flex: 1 },
  wildLabel: { color: palette.navy, fontFamily: fonts.pixelBold, fontSize: 9 },
  landmarkPicker: {
    alignItems: "center",
    borderColor: palette.line,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  landmarkPickerText: {
    color: palette.aquaDark,
    fontFamily: fonts.pixelBold,
    fontSize: 7,
  },
  body: {
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  encounterMarker: {
    alignItems: "center",
    backgroundColor: palette.cream,
    borderRadius: 28,
    borderWidth: 4,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  completedMarker: { opacity: 0.7 },
  markerCreature: { height: 46, width: 46 },
  markerCheck: {
    backgroundColor: palette.success,
    borderRadius: 10,
    color: palette.white,
    fontFamily: fonts.pixelBold,
    fontSize: 10,
    padding: 3,
    position: "absolute",
    right: -5,
    top: -5,
  },
  playerMarker: {
    alignItems: "center",
    height: 62,
    justifyContent: "flex-end",
    width: 62,
  },
  playerPulse: {
    backgroundColor: "rgba(33,182,168,0.25)",
    borderColor: palette.aqua,
    borderRadius: 28,
    borderWidth: 2,
    bottom: 1,
    height: 42,
    position: "absolute",
    width: 42,
  },
  playerSprite: { height: 58, width: 58 },
  permissionWrap: {
    alignItems: "center",
    backgroundColor: palette.scrim,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    padding: 22,
    position: "absolute",
    right: 0,
    top: 0,
  },
  permissionPanel: { gap: 12, width: "100%" },
  panelTitle: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 15,
    lineHeight: 22,
  },
  permissionActions: { gap: 9 },
  permissionButton: { minHeight: 48 },
  modalScrim: {
    backgroundColor: palette.scrim,
    flex: 1,
    justifyContent: "flex-end",
  },
  companionModal: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: 12,
    maxHeight: "78%",
    paddingBottom: 26,
  },
  companionList: { gap: 12, paddingVertical: 4 },
  companionCard: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 3,
    gap: 7,
    padding: 11,
    width: 150,
  },
  companionSelected: { backgroundColor: "#E9FAF6", borderColor: palette.aqua },
  companionIcon: { alignSelf: "center", height: 82, width: 82 },
  companionName: {
    color: palette.navy,
    fontFamily: fonts.pixelBold,
    fontSize: 9,
  },
  matchup: { color: palette.muted, fontFamily: fonts.pixelBold, fontSize: 7 },
  strong: { color: palette.success },
  weak: { color: palette.danger },
  buff: { color: palette.aquaDark, fontFamily: fonts.body, fontSize: 10 },
  webFallback: {
    alignItems: "center",
    backgroundColor: palette.navy,
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  webPanel: { gap: 10, maxWidth: 460 },
});
