# ECHO HUNT — Faculty expansion implementation status

Updated 11 September 2026. Implementation authorized by the user's `implement plan` message. EAS Build and APK generation remain prohibited until separately requested.

## Implemented

- One starter for new games; the two unchosen starters become catchable after all three core landmarks.
- Nine player species, six separate boss species. Pouch replaces Atrox as the player's Dark encounter; Atrox belongs to the boss pool.
- Three core encounters, three extra encounters and starter unlocks at the existing three campus landmarks.
- Pokédex button above the Demo joystick; ownership, starter/caught labels and active companion selection.
- Faculty intros and three location-gated challenges; hidden randomized three-creature boss roster, fixed for Retry.
- Purple row-card team selection: exactly three owned species with three different elements. Duplicate-element and fourth selections are disabled.
- 3v3 battle with preserved bench HP/energy, voluntary switch lock, forced selection after fainting, side-wide shields, terminal victory/defeat and victory records.
- QTE selects ten of sixteen possible positions, changes layout each time, uses element-specific symbols and pauses while the app is backgrounded.
- Six-element basic/Ultimate SFX, a separate trainer music track, updated exploration music, shield flash and Ultimate effects.
- Free Sample forest arena with transparent padding removed; the supplied mockup containing baked-in UI is not used.
- Version-2 save payload, legacy migration, atomic capture records and serialized storage writes. Existing players keep legacy starters; Cindrill ownership migrates to Draem because Cindrill now belongs to bosses. Core completion is preserved.
- Dynamic map controls stay above the encounter panel; GPS subscriptions and Demo movement stop when backgrounded.

## Adapted animation mapping

All fifteen current production visual sets use existing four-frame idle and four-frame attack sequences. IDs/names are stable game labels; visual families are adapted from graphics.zip to make companions smaller than bosses. These are gameplay assignments, not claims about the source pack's species taxonomy.

| Game name | Role / element | Source sheet |
|---|---|---|
| Charmadillo | Starter / Fire | Sparchu |
| Gulfin | Starter / Water | Gulfin |
| Cleaf | Starter / Grass | Larvea |
| Friolera | Core / Ice | Friolera |
| Draem | Core / Psychic | Draem |
| Pouch | Core / Dark | Pouch |
| Larvea | Extra / Grass | Cleaf |
| Finiette | Extra / Water | Finsta |
| Pluma | Extra / Psychic | Jacana |
| Cindrill | Boss / Fire | Charmadillo |
| Atrox | Boss / Dark | Atrox |
| Finsta | Boss / Water | Finiette |
| Ivieron | Boss / Ice | Ivieron |
| Jacana | Boss / Grass | Pluma |
| Sparchu | Boss / Psychic | Cindrill |

See `roster-review.png`. Trainer images are selected Townspeople sprites and are fictional representations; likenesses and full English names still need user review.

## Balance used for testing

Wild enemy HP remains 160, basic damage 10. Faculty enemies use base HP 120 plus their fixed buffs and basic damage 8. Player base HP remains 100 plus buffs, basic damage 5, 250 ms tap interval, +8 energy, Ultimate at 100 energy. Enemy Ultimate follows six basic attacks, with a two-second shield prompt. Shields block 80%, once per side per match. QTE damage retains the existing refined range 15–50 before type/buff multipliers.

Rows attack columns. This deliberately small custom chart is not the complete Pokémon chart.

| Attack / defend | Fire | Water | Grass | Ice | Psychic | Dark |
|---|---:|---:|---:|---:|---:|---:|
| Fire | 1 | .75 | 1.5 | 1.5 | 1 | 1 |
| Water | 1.5 | 1 | .75 | 1 | 1 | 1 |
| Grass | .75 | 1.5 | 1 | .75 | 1 | 1 |
| Ice | .75 | 1 | 1.5 | 1 | .75 | 1 |
| Psychic | 1 | 1 | 1 | 1.5 | 1 | .75 |
| Dark | 1 | 1 | 1 | 1 | 1.5 | 1 |

## Validation

- TypeScript passed.
- Automated tests: 39 passed, including save corruption, write ordering/failure recovery, nine-species collection progression, type rules, team restrictions, switching, shields, QTE bounds and duplicate rewards.
- Expo Doctor: 21/21 passed.
- Android Expo Go visual checks: campus Demo map/player, wild battle layout, trainer intro, duplicate-element rejection, team confirmation, QTE swiping to 10/10, pause/resume, shielding, forced replacement, voluntary switch lock and complete 3v3 victory.
- The full faculty match used a temporary in-memory fixture with persistence disabled. The process was stopped before removing the fixture. After removal, a cold start returned to the user's original 0/3 progress. No test unlocks were saved.
- An emulator rendering failure produced a black screen despite live UI nodes/audio; rebooting the emulator restored rendering. Cold-start loading was also reduced by removing the blocking preload of every creature frame.

Screenshots: `qa-campus-map.png`, `qa-team-selection.png`, `qa-faculty-battle.png`, `qa-qte.png`, `qa-faculty-victory.png`.

## Remaining review and device checks

- **Production back-view animations are not finished.** Existing sprites face each other using a horizontal flip; this is not a true rear view. The approved plan requires reviewing one front/back sample before generating the rest.
- `pouch-animation-sample.png` contains the generated sample: front/back, two idle and three attack frames for each view. `pouch-battle-art-review.png` is an art composition for review, clearly labelled as not an in-game screenshot. It has not replaced the production Pouch animation.
- Roster appearance, teacher portraits and introductory text require user review. The latter is game-written dialogue, not quotations from real faculty.
- Real campus GPS walking, small/physical Android devices, final native Google Maps authentication and offline/Metro-free launch remain unverified. Expo Go uses the existing Leaflet/OpenStreetMap preview; standalone Google Maps config is preserved.
- No EAS Build, prebuild, native compilation or APK was run.

## Image generation record

Tool: built-in image generation. Reference: existing Pouch idle frame. Output copied to `docs/pouch-animation-sample.png`.

Prompt: Create a production pixel-art animation SAMPLE sprite sheet for this exact cute small tan pouch creature in the reference. Preserve its brown ears, cream belly, little feet, rounded body, dark pixel outlines and low-resolution game style. Transparent background. Precisely two rows and five evenly spaced columns, ten total frames with equal-size cells. Top row front three-quarter view facing right: two idle breathing frames then three attack frames (anticipation, lunge, recovery). Bottom row same creature viewed from behind facing upper right: two idle breathing frames then three attack frames. Consistent scale, baseline, identity, enough transparent margins. No text, no grid lines, no scenery. This is a review sample for a 2D mobile creature game, not 3D.

## Run manually

Open this project in a terminal. Start an Android emulator from Android Studio Device Manager, then run `npm start` and press `a`. The emulator needs Metro running. Use Demo Walk for campus testing away from KMUTNB. Use `npm run typecheck`, `npm run lint`, and `npm test` for local checks. Do not choose a native build command until the user approves APK creation.
