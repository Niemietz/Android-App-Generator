# Kotlin App Generator

A React web app with Node.js + Express as backend that turns a form describing your **entities, screens, navigation,
optional login, and backend sync policy** into a complete, multi-module **Kotlin + Jetpack
Compose + Hilt + Room + Retrofit** Android project — zipped and ready to open in Android Studio.

## Structure

- `src/App.jsx` — top-level layout and view switching (generator ↔ contact form)
- `src/hooks/useGeneratorState.js` — all form state + mutation actions (replaces
  the DOM-query-based `collectSpec()`/event-listener wiring from `app.js`)
- `src/utils/spec.js` — pure helpers: stats calculation, spec-payload building,
  module-name preview
- `src/utils/moduleGraph.js` — pure layout computation for the SVG dependency graph
- `src/components/` — UI components, split roughly one-to-one with the original
  page's panels (Project, Backend sync, Image cache, Entities, Extra screens,
  External SDKs, Release signing, Preview) plus the sidebar (module graph,
  generate/preview buttons) and the contact form

## What it generates

For each project you describe, you get a Gradle project with:

- **`app`** — `Application` (kicks off a sync pass on launch), `MainActivity`, and an `AppNavHost`
  that stitches every feature's navigation graph together (starting at Login if you enabled it,
  otherwise at a `HomeScreen` hub when you have more than one entity, or straight at your single
  entity's list screen).
- **`core-lottie`** — a collection of Lottie animationated components.
- **`core-common`** — a `Result` wrapper and a `DispatcherProvider` used across every layer.
- **`core-ui`** — a shared Material 3 Compose theme plus Loading/Error/Empty composables.
- **`core-database`** — one Room `AppDatabase` with a generated `@Entity` + `Dao` per entity
  (String UUID primary keys, plus `updatedAt`/`isDirty`/`isDeleted` sync bookkeeping columns), and
  the Hilt module that provides them.
- **`core-network`** — Retrofit/OkHttp setup, a retry-with-backoff helper, and the
  `SyncCoordinator`/`PeriodicSyncScheduler` that drive two-way sync for every entity.
- **`core-image`** *(only if any entity/SDK uses the Image/RemoteImage type)* — built entirely on
  OkHttp/Retrofit (no Coil/Glide/Picasso): device image picking (`rememberImagePickerLauncher`),
  upload-on-sync (`ImageCacheManager.uploadIfNeeded`, called from each entity's Synchronizer right
  before push), a URL-keyed disk cache with cache-first lookup and conditional-GET re-validation
  (`ImageCacheManager.getLocalPathOrDownload`), a periodic background re-sync
  (`ImageSyncScheduler`, its own configurable interval), and `CachedRemoteImage` (a Compose
  composable decoding cached files with plain `BitmapFactory`).
- **`core-firebase`** *(optional, on by default)* — Crashlytics (crashes captured automatically;
  a Timber tree also forwards logged warnings/errors as breadcrumbs/non-fatals) and Analytics
  (`AnalyticsLogger`, a plain-Kotlin wrapper around `FirebaseAnalytics`). If login is also
  enabled, the Login screen gets a "Continue with Firebase" button as a fully independent
  alternative sign-in (email/password), on top of the existing backend-token login. Requires a
  real `google-services.json` from your own Firebase console — the generator can't create one for
  you (it holds project-specific credentials) and clearly documents where to get it.
- **`core-firestore`** *(optional, off by default; needs Firebase)* — a generic,
  collection-agnostic Firestore data layer (`FirestoreDataSource`: add/set/get/delete plus
  cursor-based pagination) for arbitrary large collections your entities don't model — activity
  feeds, logs, event streams. Deliberately **not** wired into `SyncCoordinator`/
  `EntitySynchronizer` at all, and **not** flavor-gated — present in every build variant
  regardless of the restBackend/sqlConnect choice below, since it's an entirely independent
  concern. Genuinely opt-in: nothing generated calls into it; you inject it where you need it.
- **Two build variants for remote data** *(optional, off by default; needs Firebase)* — a
  Product Flavor split (`restBackend` / `sqlConnect`), selectable in Android Studio's Build
  Variants panel *before* building: your existing OkHttp/Retrofit backend, or
  [Firebase SQL Connect](https://firebase.google.com/docs/sql-connect) (Cloud SQL for
  PostgreSQL). Same `EntitySynchronizer` class names/package in both, just different flavor
  source sets, so `SyncCoordinator` and everything downstream never know which is active. The
  SQL Connect side needs one manual step this generator can't do for you (its own SDK codegen
  against a schema this generator *does* provide) — see `dataconnect/README.md` in the generated
  project.
- **`core-auth`** *(only if you enable the login screen)* — a login screen/ViewModel, a
  DataStore-backed session, a Retrofit auth API, and the OkHttp interceptor that attaches the
  token to every other request.
- **`feature-<entity>`** — one Gradle module per entity, each with:
  - `domain/` — the plain domain model
  - `data/` — mapper + `Repository` interface/impl (Room entity ⇄ domain model), plus
    `data/remote/` — the entity's Retrofit `Api`, wire-format `Dto`, and its `Synchronizer`
    (push dirty rows, pull + last-write-wins merge)
  - `di/` — Hilt `@Binds` modules for the repository and the synchronizer
  - `presentation/{list,detail,form}/` — a `@HiltViewModel` + Compose screen for each screen type
    you enabled for that entity
  - `navigation/` — route constants (`Destinations`) and a `NavGraphBuilder` extension

Everything uses **Kotlin DSL Gradle files** and a **version catalog**
(`gradle/libs.versions.toml`), KSP for Room, and kapt for Hilt.

## Every screen now shares one chrome component

All generated screens (List/Detail/Form, Home, Login, Debug, and your extra screens) render
through a single `core-ui` component, `AppScaffold`, instead of each hand-rolling its own
`Scaffold`. That's what makes the following consistent everywhere instead of being one-offs:

- **Debug-only tooling:** every screen's app bar gets a bug-report icon *only in debug builds*
  (release builds never even register the route — see the `BuildConfig.DEBUG` guard in
  `AppNavHost`), opening a `DebugScreen` with version/build info and a "Sync now" button. Every
  screen also shows the running version name in the bottom-left corner while in debug.
- **Logout everywhere:** List/Detail/Form screens (not just Home) show a logout action whenever
  login is enabled.
- **List screens can navigate back to Home:** when a Home screen exists (multi-entity, login
  enabled, or extra screens present), each entity's List screen gets a back arrow to it.
- **Extra screens are now actually wired up** (previously a bug: they were accepted by the spec
  but never generated or added to the nav graph) — each gets a placeholder Composable, a route,
  and a button on Home.

## Login and sync, at a glance

- **Login (optional):** a simple username/password screen calling your backend's login endpoint,
  storing the returned token with DataStore, and attaching it as a Bearer token to every request.
- **Two-way sync:** every entity pushes local changes then pulls remote ones. Conflict resolution
  is last-write-wins by timestamp, with local unsynced edits always taking priority over an
  incoming pull. Full detail (including the expected backend contract) is in the **generated
  project's own README**, not this one.
- **When it runs:** app open, and immediately after every save/update/delete. Optionally also on
  a fixed timer while the app process is alive.
- **Retries:** each network call retries up to the number of times you configure, with
  exponential backoff, before giving up for that pass (the row stays queued and retries next
  time).
- **Concurrency:** a single coordinator serializes all sync passes through a conflated channel, so
  concurrent triggers never race and bursts of triggers collapse into one extra pass.

## Running the generator

Describe your entities/fields/screens in the form, and click
**Generate project**. Your browser will download a `.zip` — unzip it and open the folder in
Android Studio.

> **Note on the Gradle wrapper:** the generated project ships `gradlew`/`gradlew.bat` and
> `gradle/wrapper/gradle-wrapper.properties`, but not the binary `gradle-wrapper.jar` (it can't be
> generated from templates). Android Studio will offer to fetch/regenerate it the first time you
> open the project — accept that prompt. If you'd rather do it yourself and have Gradle installed
> locally, run `gradle wrapper --gradle-version 8.9` once inside the generated project.

## Notes / things carried over as-is

- The backend API base URL is in `src/config.js` — update it to point at your real API.
- Google Fonts, the reCAPTCHA Enterprise script, and SweetAlert2 are still
  loaded via `<script>`/`<link>` tags in `index.html` from their original
  CDNs, exactly like the source project, rather than being pulled in as npm
  packages.

## Extending the generator

Because generation is just template functions returning strings, adding a new field type,
screen type, or code pattern (e.g. a `use case` layer, pagination, a search bar) means editing
the relevant `src/generators/*.js` file — no framework or plugin system to learn.

## Known limitations (intentional, to keep the base clean)

- Date fields are stored/edited as raw epoch-millis; wire in a real date picker yourself.
- No auth, networking/API layer, or pagination scaffolding — this is a local-first Room base.
- No app icon or launcher assets are generated; Android Studio's defaults apply.

## Contact

If you want to contact me for any Android app development project services, just fill up the form at:
https://niemietz.github.io/Android-App-Generator#contact
