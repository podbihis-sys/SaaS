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

## Native builds

Push notifications need a real build, not Expo Go, and a real EAS project id in
`app.json` (`extra.eas.projectId` is a placeholder).

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

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
src/
  api/               client, typed endpoints, React Query hooks
  components/        ui primitives, SlotCard, WatchCard, form pickers
  lib/               storage, push registration, German formatting
```
