# ECHO HUNT — Faculty expansion plan

Date: 11 September 2026
Status: DRAFT FOR REVIEW. Planning only; implementation has not started.

This document records the latest requested expansion. It supersedes conflicting proposals in conversation only after the unresolved decisions below are confirmed. Existing gameplay stays available during development.

## Boundaries

- Work in C:\Users\acer\cedmobile_app\Mini_Project\MiniProject.
- All authored game UI and dialogue remain English.
- Preserve Android package, Expo slug, EAS identity and Maps credentials.
- No APK, EAS Build, native build or prebuild without a new explicit user instruction.
- Read the Expo SDK 57 documentation required by AGENTS.md before implementation.
- Keep the original three-point expedition playable independently of the faculty expansion.

## Confirmed direction

### Starter and Pokédex

- A new game asks the player to choose ONE starter: Fire, Water or Grass. Do not grant all three.
- Every successfully captured creature is added to the persistent Pokédex immediately.
- Reuse and expand the existing Collection storage/UI; do not create a competing ownership store.
- Add a small ball icon near the lower-left movement controls on the map. Keep at least a 48dp touch target, clear of the joystick. Show the button in GPS and Demo modes.
- Show owned creatures, element, buff, and team-selection eligibility. Unowned entries may be silhouettes rather than selectable creatures.

### Wild encounters

- Replace the original three wild species with Friolera, Draem and Atrox, proposed as Ice, Psychic and Dark respectively. These are game-design assignments, not verified asset metadata.
- Preserve the three existing verified landmark coordinates and 40m encounter rule.
- Add other suitable supplied creatures as catchable map encounters after winning their battles.
- Do not assume every image/frame/alternate palette is a distinct species. Inventory and approve the roster before adding encounters.
- Additional encounter coordinates must be reviewed for actual campus placement; do not invent verified walkable locations.
- Proposed scope control: retain three mandatory expedition encounters and make the remaining roster optional encounters. Distribution remains a decision below.

### Faculty trainers

- Three separate trainers represent Soradech Krootjohn, Vatinee Nuipian and Panamet (English display spellings must be verified before publication).
- Each trainer is at a DIFFERENT campus location. Exact points are not yet selected.
- Unlock the faculty feature after completing the three required wild encounters, following the existing proposal; keep this rule explicit in the review.
- Show a short English introduction before battle and an information card afterward. Use verified faculty facts and clearly authored game dialogue; never present invented quotes or personality traits as factual.
- Player selects a limited team before starting. The trainer's species are hidden during selection.
- Randomly select the trainer's team once when the battle session begins. Do not reroll during rendering, QTE, background/resume or switching.
- Proposed randomization: sample without replacement from an approved pool; balance with fixed stats rather than unrestricted random difficulty. Retry behavior needs confirmation.
- Preserve tap attacks, Ultimate QTE and shields. This is not a conversion to turn-based command combat.
- Proposed voluntary-switch interpretation: one voluntary switch is available; after using it, another is locked until the currently active creature faints. Forced replacement uses a living bench creature. This interpretation is pending confirmation.
- Preserve each creature's HP and energy while benched; freeze battle timers during selection/transition. Switching does not heal or reset energy.
- One shield per SIDE across the entire trainer battle, not per creature. Retry restores the battle's initial resources.
- A side loses when all its selected creatures faint. Trainer creatures cannot be captured; no capture scene follows a faculty victory.
- Proposed reward: persist a faculty-met/victory record and unlock the information card. No currency, inventory or additional progression system.

### Battle presentation and QTE

- Use the supplied upper-screen pixel reference: player near lower left, opponent upper right, platform-style arena, compact team indicators and a dialogue panel.
- Trainer introduction precedes the creature battle. Keep controls outside creature silhouettes and safe areas.
- Use real rear sprites only when supplied. Mirroring a front sprite is not rear-view art.
- QTE orbs match the attacking creature's element; randomize their positions/paths for each Ultimate rather than repeating one arrangement.
- Preserve the existing short drag-to-collect interaction and damage scaling unless explicitly revised.
- Generate bounded layouts with reachable orbs, minimum spacing, adequate hit areas and no overlap with system/exit controls. Randomness must not create impossible patterns.
- Each orb scores once. Pause combat while QTE is active and pause QTE on app background. Use deterministic random inputs in tests.

### Audio and title/loading UI

- Title and map: Desktop/Asset/03. A New Beginning.mp3.
- Faculty battle: Desktop/Asset/trainer battle.mp3.
- Preserve existing wild-battle tracks unless revised; lower battle volume during capture.
- Retain separate Music and Sound Effects switches and background pause behavior.
- Compose a more polished creature-themed title/loading screen from approved supplied art. No specific Pokémon loading wallpaper has yet been verified in the library.
- Import only used assets, retain source/license credits, and keep archive files out of the app bundle.
- Pokémon SFX archives provide sound; visuals come from sprite/VFX packs.

## Asset evidence

- Found new local files: Townspeople.zip, ForestNpcs.zip, Openmon-Set-5.png.
- Found Fakemon Starter VFX Free.zip and Super Pixel Effects Gigapack (Free Version) v2.9.0.zip.
- Openmon-Wolf-Line.png was located in Desktop/Asset/Legacy Collection. Its 320×192 sheet contains 15 single front/three-quarter creature sprites, not animation frames.
- Openmon-Set-5.png is a 384×384 sheet with 36 single creature sprites in a 6×6 grid; do not treat all stages/variants as separate approved species automatically.
- Townspeople_Trainers.png and ForestNpcs_Trainers.png each supply 16 front/three-quarter 64×64 Trainer sprites (32 choices total), with matching overworld sheets. These fit the pixel introduction reference. Rear Trainer sprites were not identified.
- Trainer candidates include Townspeople row 2 column 3 (brown-haired, blue jacket), row 3 column 1 (dark-haired, dark red outfit), and ForestNpcs row 3 columns 1–2 (white lab coats). Actual professor likeness matching remains unreviewed.
- Neither new NPC ZIP includes a license/readme; retain the original source-page links and verify usage terms before importing.
- Earlier graphics.zip inventory found 16 named creatures. Friolera, Draem and Atrox have same-orientation idle/attack frames; rear art was not identified.
- New trainer sheets have been visually reviewed; selection of three professor representations and likeness matching remain pending.
- Both requested new music files are present, but this plan does not import them.

## Decisions required before implementation

1. TEAM SIZE: latest message says three selected creatures and three randomized opponents, but also says "2 vs 2" near the shield rule. Proposed resolution: 3 vs 3, exactly three distinct owned creatures per team.
2. SWITCH LOCK: confirm whether a voluntary switch becomes available again only when the newly active creature faints, or whether there is only one voluntary switch for the entire match.
3. EXTRA WILD PLACEMENT: optional species at the existing three landmarks via a selectable list, or extra fixed campus points? Proposed first implementation: rotate/select optional encounters at existing landmarks, avoiding many new coordinates.
4. FACULTY POINTS: select/verify three distinct campus locations; can reuse the existing three landmark coordinates if the user accepts them.
5. RANDOM RETRY: proposed Retry keeps the same opposing team; leave and start a new challenge generates a new team.
6. ELEMENT BALANCE: define and review the full interaction table after approving the roster. Do not silently assume six types form the original three-type cycle.
7. SAVE UPGRADE: preserve existing owned creatures/progress; apply single-starter choice to new/reset saves. Do not remove previously earned/owned creatures silently.

## Implementation sequence after agreement

1. Check Git, repository instructions and existing changes; record a baseline run of current gameplay.
2. Finish asset inventory, contact sheets, roster and English faculty content; document credits and missing art.
3. Introduce extensible species/element/encounter/trainer definitions, versioned save migration and team validation.
4. Implement single-starter onboarding and updated Pokédex/map button.
5. Add approved wild species, full type table, corresponding SFX/VFX and reviewed placement.
6. Add randomized bounded QTE layouts and verify pause/scoring behavior independently.
7. Complete one faculty vertical slice: reach location → introduction → choose team → hidden random opponent roster → battle/switch/faint → result → save.
8. Add the remaining faculty trainers and their separate locations using the same tested flow.
9. Apply pixel battle layout, approved trainer art, title/loading polish and new music routing.
10. Run TypeScript, lint, logic tests, Expo Doctor and emulator/manual gameplay checks. Record what was actually observed.
11. Present screenshots and remaining limitations. Stop before any APK/EAS/native build.

## Acceptance checks

- New save owns exactly one chosen starter; old saves migrate without losing progress; corrupt saves fail safely.
- Successful capture updates ownership and encounter progress atomically; duplicate rewards are blocked.
- Pokédex button works with GPS and Demo modes without obstructing movement.
- Team selection rejects duplicates, unowned creatures and incorrect team size.
- Opponent roster stays hidden before battle and remains stable within the session.
- Switching preserves benched HP/energy; switch locks, forced replacements and all-fainted results resolve once.
- Side-wide shield cannot reset by switching; QTE never allows background combat damage.
- Random QTE layouts are reachable, vary between uses and score each orb only once.
- Faculty access checks location, unlock state and team readiness with clear English messages.
- Faculty fights never enter the wild capture flow; victory records survive restart.
- Music switches by context without overlapping loops and both audio toggles persist.
- Test denied/off GPS, Demo/GPS separation, pause/resume, loss/retry, capture miss/escape/success and restart.
- Expo Go's OSM preview does not prove standalone Google Maps authentication. Verify Google Maps on the signed Android app only after an authorized build.

## Fallback

If the trainer expansion cannot be completed and tested in time, retain the fully playable original expedition and hide unfinished faculty entry points. Do not cut save correctness, location testing or final APK verification to fit extra content.
