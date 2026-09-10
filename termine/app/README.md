# TerminRadar app

Expo / React Native client. One codebase, three targets: iOS, Android and a web
build.

## Screens

| Route | Purpose |
| --- | --- |
| `(tabs)/index` | **Suchaufträge** — the standing searches on this device. |
| `(tabs)/search` | **Termine finden** — what is free right now, and the office catalogue. Supports search by city, postal code or current location. |
| `(tabs)/alerts` | **Meldungen** — alert history, including alerts suppressed by quiet hours or the rate limit. |
| `(tabs)/settings` | **Einstellungen** — push permission, how it works, delete all data. |
| `watch/new` | Three-step wizard: errand → offices → when. |
| `watch/[id]` | One search order, its criteria, and the slots matching it now. |
| `slot/[id]` | One appointment, and the handoff into the official portal. |
| `office/[id]` | One office: address, services, current availability. |

## Running it

```bash
npm install
npm start
```

Then `i` for the iOS simulator, `a` for Android, `w` for the browser.

The app finds the backend automatically: in Expo Go it derives the host from the
packager address, which is the only value that works on a physical device *and*
an Android emulator. Override with `EXPO_PUBLIC_API_URL` when the API lives
elsewhere:

```bash
EXPO_PUBLIC_API_URL=https://api.example.org npm start
```

## Checks

```bash
npm run typecheck          # tsc --noEmit, strict
npx expo export --platform web   # proves the bundle builds
```

## Auf das eigene iPhone: TestFlight

**Xcode wird nicht gebraucht.** EAS baut die iOS-Binary auf Apples Hardware in
der Cloud und lädt sie zu App Store Connect hoch; ein Mac ist an keiner Stelle
nötig. Was du brauchst, ist ein **Apple Developer Program**-Konto (99 $/Jahr)
und ein Expo-Konto (kostenlos).

Alles läuft in `termine/app`:

```bash
npm install -g eas-cli
eas login                       # Expo-Konto
eas init                        # ersetzt extra.eas.projectId in app.json
```

Vor dem ersten Build sind **drei Werte** einzutragen — der Build ist sonst
technisch in Ordnung und praktisch nutzlos:

1. **`eas.json` → `build.production.env.EXPO_PUBLIC_API_URL`** — die öffentliche
   Adresse deines Backends. `https://api.example.invalid` ist ein Platzhalter.
   Ohne erreichbare Adresse zeigt die App auf dem Gerät nur Fehler; sie sagt das
   inzwischen ausdrücklich, statt „Server nicht erreichbar" zu melden.
2. **`app.json` → `ios.bundleIdentifier`** — `de.terminradar.app` ist geraten.
   Er muss zu einer App-ID gehören, die dir gehört, und ist nach dem ersten
   Upload nicht mehr änderbar.
3. **`eas.json` → `submit.production.ios.ascAppId`** — die App-ID aus App Store
   Connect, nachdem du dort einmal einen App-Eintrag angelegt hast.

Dann:

```bash
eas build --platform ios --profile testflight
eas submit --platform ios --latest
```

Der Build dauert 10–20 Minuten, der Upload wenige. Danach verarbeitet Apple die
Binary (nochmal 5–30 Minuten), und sie erscheint in App Store Connect unter
**TestFlight**. Dich selbst als internen Tester hinzufügen, TestFlight-App auf
dem iPhone öffnen — fertig. Für interne Tester (bis 100, dein eigenes Team) ist
**keine Beta-Prüfung** durch Apple nötig; erst externe Tester brauchen eine.

Beim ersten `eas build` fragt die CLI nach deinen Apple-Zugangsdaten und legt
Zertifikat und Provisioning-Profil selbst an. Gib die Daten in der CLI ein,
nicht hier im Chat.

**Android:** derselbe Weg, `--platform android`, und statt TestFlight der
interne Testkanal der Play Console. Rechne dort mit der Hürde für neue private
Entwicklerkonten: 20 Tester über 14 Tage geschlossenen Test vor der
Produktivfreigabe.

### Was schon geprüft ist

| Prüfung | Ergebnis |
| --- | --- |
| `npx expo-doctor` | 18/18 |
| `tsc --noEmit` | sauber |
| `expo export --platform ios` | bündelt, 3,8 MB Hermes-Bytecode |
| Icons, Splash, Notification-Icon | erzeugt (`scripts/make_icons.py`) |
| `eas.json` mit Profilen development/preview/testflight/production | vorhanden |

### Andere Builds

```bash
eas build --platform ios --profile preview   # Simulator-Build, ohne Apple-Konto
eas build --platform android --profile preview
```

Push-Benachrichtigungen brauchen einen echten Build — in Expo Go funktionieren
sie nicht.

## Notes on the setup

**NativeWind is pinned to 4.1.23, not `^4.1.x`.** From 4.2 it requires
`react-native-worklets/plugin`, which only exists with Reanimated 4; Expo SDK 52
ships Reanimated 3. A caret range silently resolves to 4.2 and the bundle fails
to build. The pin is the fix.

**The Reanimated Babel plugin is not listed in `babel.config.js`.**
`babel-preset-expo` adds it automatically when Reanimated is installed; adding
it by hand duplicates it and breaks on versions that moved it.

**Notifications are guarded behind `Platform.OS !== 'web'`.** `expo-notifications`
has no web implementation and *throws* rather than no-opping, which takes the
whole app down on first render. The web build is a convenience view; alerting is
a phone feature.

**Times are always rendered in the office's timezone**, never the device's. A
09:15 appointment in Berlin must read 09:15 to a user sitting in Lisbon. See
`src/lib/format.ts`.

**There is no login.** The device generates a random install id on first launch
and exchanges it for a long-lived token, kept in the Keychain / Android Keystore
via `expo-secure-store`. Watching for an appointment does not require knowing
who is watching.

## Layout

```
app/                 expo-router screens
assets/              icon, splash, notification icon — generated, not hand-drawn
scripts/
  make_icons.py      redraws assets/ from thirty lines of geometry
src/
  api/               client, typed endpoints, React Query hooks
  components/        ui primitives, SlotCard, WatchCard, form pickers
  lib/               storage, push registration, German formatting
```
