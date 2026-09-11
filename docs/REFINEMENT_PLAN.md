# ECHO HUNT — confirmed refinement plan

Approved 11 September 2026. Keep Android package, Expo/EAS identity and Maps credentials. No APK, native build or EAS Build without a new explicit user instruction.

1. Repair real campus map rendering and visible 2D player; navy full-screen map, 40m player circle, compact edge controls and demo-only joystick. Diagnose provider errors before claiming success.
2. Loop Kanoko Town for exploration. Alternate Pokemon Battle music and A New Adventure on successive encounter starts; retry keeps its track. Lower the same battle track during capture. Independent persisted Music and Sound Effects settings; pause in background.
3. Reserve battle arena space: companion lower left, enemy upper right, controls outside sprites. Use existing attack sprites, elemental visual impact and selected Gen3 SFX. Back-facing art only if available, never mislabel mirrored front art.
4. Ultimate opens a 3-second, 10-orb drag QTE. Freeze attacks. Each orb scores once; base damage 15–50 then type/buff scaling. Show NICE/GREAT/EXCELLENT.
5. One shield per side, blocks 80% of Ultimate damage. Enemy charges after six normal attacks. Two-second shield decision, timeout takes hit. Enemy shields first player Ultimate automatically. Retry resets resources.
6. On a capture hit, resolve probability once: 70%, guaranteed on third landed throw. Creature disappears into orb, orb falls, shakes 1–2 times and releases on failure, or 3 times then CAPTURED on success. Misses do not count. Input locked during scene. Reward committed once after success; background pauses scene.
7. Validate save migration, QTE, shields, capture outcomes, TypeScript/lint/tests; bundle check and emulator flow. Record device limitations honestly. No APK.

### Emulator preview adjustment
Confirmed Google Maps SDK Authorization failure in Expo Go on 11 September. Added an Expo Go-only real OSM campus map through WebView, with the same coordinates, marker, radius and joystick. No mock geography. Native standalone Google Maps is preserved and must be validated when a build is explicitly authorized. Preview requires internet; tile labels come from the provider and may use local place names.
