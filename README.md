# ECHO HUNT: Campus Legends

ECHO HUNT is an Android campus creature adventure built with Expo SDK 57, React Native, and TypeScript. The player explores KMUTNB Bangkok using foreground GPS or a clearly marked Demo Walk joystick, battles three elemental creatures, captures them with a swipe-controlled Echo Orb, and keeps progress in a local field guide.

## Included game loop

- GPS and Demo Walk movement on a Google campus map
- Three 40-meter encounter zones at the Faculty of Technical Education, Building 44, and Celebration Plaza
- Six companions across Fire, Water, and Grass
- Tap attacks, elemental multipliers, fixed buffs, energy, and Ultimate attacks
- Swipe capture with a moving target, misses, escapes, and a guaranteed third hit
- Persistent collection, active companion selection, sound settings, reset confirmation, and completion screen
- English-only interface with portrait safe-area layouts

## Run for development

Install the dependencies once:

```powershell
npm install
```

Start Metro:

```powershell
npx expo start
```

Then press `a` to open the app in an Android emulator, or scan the Expo Go QR code on an Android phone. Location permission is foreground-only. Demo Walk starts at the KMUTNB campus center when the current GPS position is more than one kilometer away.

The restricted Google Maps key in `app.json` is injected into the native Android application during a native build. Expo Go uses its own Android package and native configuration, so use it to test the game flow and use the approved preview build later to verify restricted-key map tiles.

## Quality checks

```powershell
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

The unit tests cover all nine elemental matchups, buffs, attack throttling, capture guarantees, encounter boundaries, and damaged save data.

## Android build gate

Do not run an EAS build or create an APK until the project owner explicitly approves it. The existing Android package remains `com.acer.miniproject`, with the existing Expo slug, EAS project, and Google Maps credentials.

## Assets and classroom use

Only selected files from the provided packs are included under `assets/game`; source ZIP archives are not bundled. Selected Pokémon-derived attack and faint sounds are included only for a non-commercial classroom demonstration and must be replaced before public or commercial release. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for credits and licensing notes.
