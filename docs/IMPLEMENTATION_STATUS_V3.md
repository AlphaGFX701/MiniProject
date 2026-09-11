# ECHO HUNT — V3 implementation and verification

Updated 11 September 2026. Implements `IMPLEMENTATION_PLAN_V3_UX.md` and the user's approved fictional faculty closing dialogue. No APK, EAS Build, or native build was run.

## Implemented

- Map details stay hidden until a marker is tapped. Empty-map taps and the close button dismiss details. Compact controls, demo joystick, silhouette/check encounter markers and faculty portraits/locks remain visible. Entry rechecks range and GPS conditions.
- Persisted first-use map/QTE hints and a one-time faculty unlock notice preserve existing save ownership and completion.
- All three faculty have manual Talk → Next → Choose Team entry. Existing 3v3 rules, distinct team elements, hidden opponent selection and same-opponent retries remain. Dr. Vatinee and Panamet use their own existing records rather than duplicates.
- Animated side-facing creatures use alpha-bound foot anchors and separate elliptical grass platforms, attack movement and hit reactions. These are existing side sprites, not new rear-view artwork.
- QTE: 1 second preparation, 5 seconds collection, 0.8 seconds result. Ten randomized orbs appear two at a time, with each orb scored only once. Combat and QTE clocks pause in the background.
- Shields are trainer-only, one per side across the match, reducing ultimate damage by 80%. Decision time is 3 seconds; visible Blocked feedback lasts 1 second. Faint/replacement transitions also pause combat.
- Wild battles have no shields. Enemy ultimate warns for 1 second. Wild base damage is 4 per normal attack and 15 per ultimate before elemental multipliers. The previous 7/20 tuning failed the Cleaf/Friolera opening simulation; 4/15 passes all nine starter/core combinations at two player taps per second with six QTE hits.
- Wild music always uses Pokemon Battle music; faculty battles use trainer battle; exploration keeps A New Beginning. Elemental SFX duck music. Successful capture/faculty victory selects the supplied Victory recording.
- Victory remains visible for at least 1.5 seconds before Continue enables. Capture rewards and trainer completion are committed independently of Continue. The capture result and button share one panel, fixing an overlap found during emulator QA.

## Approved fictional closing lines

- Dr. Soradech: “Good teamwork turns small steps into progress.”
- Dr. Vatinee: “Keep experimenting. Every challenge can teach you something.”
- Panamet: “Small companions, big courage. Keep exploring!”

These are game dialogue approved by the user, not factual quotations from the faculty.

## Verification

- TypeScript and ESLint pass after the final capture-layout change.
- 51 logic tests across 6 files pass, including 12 presentation/balance/save tests added in V3.
- Expo Doctor: 20/21 checks pass. The remaining check reports newer compatible patch versions for 16 Expo SDK 57 packages; this task did not mass-upgrade unrelated dependencies.
- Android Pixel 7 emulator, Expo Go SDK 57: verified clean map, marker selection, close action, Demo movement/range, all three faculty Talk routes, manual team selection, gradual QTE, background pause, shield feedback and shield consumption across replacements.
- Completed Panamet's 3v3 battle through the final result and Continue. Completed a wild Finiette battle without shields, observed misses without hit increments, then a successful capture.
- Reloaded from the capture success screen before Continue: Pokédex retained Finiette (5/9, previously 4/9). Existing progress was not reset. The QA match also records Panamet's win in the current save.
- The emulator's media volume was 0/15 and was set to 6/15. Music routing and playback integration are implemented; final listening quality on the user's physical device still needs their check.

## Evidence

- `v3-map.png`: closed default map, Demo controls.
- `v3-trainer-talk.png`, `v3-panamet.png`, `v3-soradech-team.png`: faculty entry/selection.
- `v3-arena.png`, `v3-wild-battle.png`: creature placement.
- `v3-qte.png`, `v3-charge-result.png`, `v3-shield.png`: readable combat phases.
- `v3-trainer-victory.png`: approved Panamet closing and Continue.
- `v3-capture-result.png`: corrected capture result panel.
- `v3-save-pokedex.png`: collection after reload.

## Remaining device validation

Expo Go uses the existing Leaflet/OpenStreetMap preview; native standalone Android still retains the existing Google Maps setup. A standalone Google Maps credential check, real campus GPS walk, physical-device audio check and APK installation are not claimed as verified here. APK generation remains blocked by the user's standing instruction until explicitly requested.

To resume: open the project, run `npm start`, start the Android emulator in Android Studio Device Manager, then press `a` in the Metro terminal. The current session is left on the Demo map with Metro running. Do not run `eas build` or `expo run:android` under this scope.
