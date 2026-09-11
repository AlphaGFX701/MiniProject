# ECHO HUNT — Clean UI and readable combat

## Scope and precedence

Confirmed design, 11 September 2026. This document consolidates the latest discussion and supersedes conflicting timing, music and shield rules in older plans. It records planned work, not completed implementation. Preserve existing progress, package name, Expo/EAS identity and Maps configuration. All game-authored text remains English. Do not create APKs or run native/EAS builds without a separate explicit user request.

## Map and discovery

- Default to a full-screen map with player, markers, small edge controls and a demo-only joystick. Keep the location mode visible.
- No encounter or trainer detail panel opens automatically, including when entering the 40m radius.
- Tap a marker to open a compact panel with distance and available Encounter/Talk actions. Close using X or tapping empty map space. Selecting a marker never starts a battle.
- Preserve distance, permission and GPS accuracy checks at entry. Explain unavailable actions briefly inside the selected panel.
- First map visit: show “Tap a marker to explore”; dismiss after the first marker selection and persist completion.
- Main uncaught encounters use silhouette markers; completed encounters use a check. Trainer markers use portrait/lock status. Before unlock, a locked marker opens only a short unlock explanation. After unlock, the marker becomes actionable.
- After the three core captures, show “Faculty Challenges Unlocked” once with “Back to Map”. Do not force a trainer encounter; optional captures remain available.
- Add persisted tutorial/unlock-notice flags with safe defaults for existing saves; never reset ownership or progress during migration.

## Faculty and team selection

- Verify Dr. Soradech, Dr. Vatinee and Panamet individually through their existing landmark routes. Do not duplicate teacher records already present.
- Flow: marker → Talk → manually advanced dialogue/Next → Choose Team. No automatic dialogue page advance.
- Show “Choose 3 companions • Different elements”, numbered selection order 1–3, and a short explanation on duplicate-element selection. Preserve distinct species and elements in the battle team; the Pokédex retains all owned species.
- Keep the opponent team hidden before battle. Randomize once for a new challenge; retry or Change Team within that challenge keeps the same opponents.
- Defeat offers Try Again and Change Team, plus a brief actionable hint. Start retries with full battle resources.
- Give each faculty member a short individual closing dialogue. Draft English dialogue for user review before presenting it as teacher-specific content; do not invent factual biography or quotations.

## Arena and feedback

- Use existing animated side-facing sprites: companion lower left facing the enemy, enemy upper right facing the companion. Mirroring is not rear-view artwork.
- Anchor visible feet at the center of each grass platform, accounting for transparent sprite margins and differing creature sizes.
- Keep HP and controls outside the creature area; use the same arena layout principles for wild and trainer battles.
- Include attack movement and hit reactions. Keep basic taps and menu controls immediately responsive.
- Allow a readable faint/replacement transition before combat resumes. Lock conflicting input during transitions; never allow hidden enemy attacks.

## QTE and shields

- Ultimate: Get Ready 1s → drag collection 5s → score label 0.8s → attack resolution.
- Retain 10 collectible orbs, spawned in readable groups with randomized, reachable positions and slow movement. Each orb scores once. Show “Drag through the orbs” for the first QTE.
- Preserve existing score-to-damage rules. Pause both combatants during QTE and result presentation.
- Trainer battles only: one shield per side for the entire 3v3 match; retain 80% reduction. Player decision window 3s, timeout means take hit. A used shield displays armor and “Blocked!” for 1s before combat resumes.
- Wild battles: remove shields for both sides. Retain enemy Ultimate with “Incoming Ultimate!” for 1s before it lands; reduce its damage and validate the opening encounters using every starter. Document the chosen tuning after tests rather than assuming it is balanced.
- All gameplay countdowns and transition sequences pause in the background. Returning to the app must not cause catch-up damage or duplicated actions.

## Music and victory

- Wild battle uses Pokemon Battle music.mp3 every time; remove alternating wild tracks.
- Trainer battle retains trainer battle.mp3. Keep current exploration music.
- Preserve elemental SFX and independent Music/Sound Effects settings; duck background music during effects without stacking playback.
- On successful capture or trainer victory, play the supplied “1-10. Victory!(afterfinish catch pokemon and finish trainer) (Wild Pokémon).mp3”. Wild battle victory before capture does not trigger this track.
- Keep the result visible for at least 1.5s, then enable Continue. No forced return while the player is reading.
- Resolve and persist rewards once independently of the Continue button. Closing or backgrounding during a result must not lose or duplicate the reward.
- Follow completion with the applicable faculty closing dialogue or one-time faculty unlock notice. Resume exploration music when returning to the map.

## Implementation order

1. Inspect current code and preserve existing uncommitted changes/configuration.
2. Implement map panel selection/closing and discovery states.
3. Add safe save migration for tutorial and faculty unlock notices.
4. Refine faculty dialogue, selection hints and same-team retries.
5. Consolidate arena placement and readable combat transitions.
6. Implement staged QTE, trainer-only shields and wild Ultimate tuning.
7. Add music routing, victory presentation and exactly-once reward handling.
8. Review teacher closing dialogue with the user; validate UI on the emulator and record screenshots.
9. Run TypeScript, lint, logic tests and Expo Doctor. Record any untested physical-device behavior. No APK build.

## Acceptance checks

- Opening the map or entering range never opens details; selecting/closing markers never accidentally starts encounters.
- Core and optional captures, faculty unlock and all three teacher entry points remain reachable in Demo Mode.
- Team selection explains rejected duplicates; retry and Change Team preserve the current opponent roster.
- All sprites stand on their platforms without overlapping controls on compact portrait screens.
- QTE spawn count, single collection, timing, score and background pause are correct.
- No wild shield UI or shield logic remains; trainer shield consumption persists across switches and fainting.
- Starter-by-starter first-encounter checks cover normal attacks, Ultimate and loss/retry; document balance adjustments.
- Music switches correctly across map, wild battle, trainer battle, capture, victory and return; mute and background pause work.
- First-time hints and faculty unlock notice do not repeatedly appear after reopening the app.
- Closing during victory preserves rewards and faculty completion exactly once.
- New rules supplement the existing GPS/Demo, capture and save regression checks.
