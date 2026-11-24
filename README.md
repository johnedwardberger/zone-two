# Zone Two

> Find someone in your zone.

Zone Two is a **front-end-only proof of concept** of a dating app for serious
endurance athletes: runners, cyclists and swimmers. You post workouts you
logged elsewhere (Strava, Nike Run Club, Garmin, Apple Fitness) by entering
the numbers and adding photos. Instead of a generic like, you send a **Pulse**
on other people's activities. A **Mutual Pulse** unlocks a **match request**,
and once you've matched you can chat and plan a workout as a first date, on a
well-known public route.

**This is a demo. All profiles are fictional.** The 28 athletes are invented
and their photos are generated illustrations, never pictures of real people.
There are no accounts, servers, databases, payments or fitness-app
connections. Everything you do is saved in your browser's localStorage, and
**Settings → Reset demo** restores the original data.

Live demo: https://johnedwardberger.github.io/zone-two/

## Try the flow

1. **Try the demo** → fill in onboarding, or tap **Skip: use a sample profile**.
2. **Discover**: swipe right (or press →) to send a Pulse, left (←) to pass.
   About 40% of the fictional athletes "already liked your activity", so
   a Pulse to them becomes a **Mutual Pulse** after a moment.
3. **Request to match**. They accept within a few seconds and you get the
   match celebration. Two incoming requests are also waiting in **Matches**.
4. **Chat**. Fictional athletes reply with short canned messages.
5. **Plan a workout date** from the chat. Choose a suggested Indianapolis
   route, then send the proposal. They accept.
6. **Post** an activity, then see it on your **Profile** and in the **Feed**.

## Run locally

Requires Node 22+.

```bash
npm install
npm run dev
```

| Script            | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the dev server            |
| `npm run build`   | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build      |
| `npm test`        | Run the Vitest suite once       |
| `npm run lint`    | ESLint                          |
| `npm run format`  | Prettier                        |

## How deploy works

Every push to `main` runs `.github/workflows/deploy.yml`. The workflow
installs dependencies, lints, runs the tests and builds. It then publishes
`dist/` to GitHub Pages. In the repo, **Settings → Pages → Source** must be
set to **GitHub Actions**. Vite's `base` is `/zone-two/`, and the app uses hash
routing (`#/discover`), so deep links work on Pages without server rewrites.

## How it's built

- **React + Vite + TypeScript**, Tailwind CSS v4. All colors, fonts and
  shadows are theme tokens in `src/index.css`, so components never hard-code
  hex values.
- **React Router** (`HashRouter`), **Lucide** icons, **Leaflet** with
  OpenStreetMap tiles. Maps only ever show public suggested routes, never
  users' workouts.
- **One Zustand store** (`src/store/store.ts`) persisted to localStorage.
  Components read data through selectors (`store/selectors.ts`,
  `store/hooks.ts`) and change it only through store actions. Those actions
  are the data interface, so a real backend could implement them without UI
  changes. All demo-only behavior, like seeded athletes reacting, lives in
  `store/bots.ts`.
- **Pure, tested utilities** in `src/lib`: unit and pace conversion,
  plausibility checks, coarse dates, rounded distances, two-way matching
  filters, first-date suggestions, and training stats.

```
src/
  components/      shared UI (buttons, fields, modal, photo, icons, layout)
  features/        one folder per feature: landing, onboarding, discover,
                   matches, chat, plan, post, profile, feed, settings, pro
  store/           Zustand store, selectors, demo bots
  lib/             pure utilities (+ *.test.ts)
  data/            seed.ts (fictional athletes), routes.ts, replies.ts
  types/           domain types
```

## Privacy principles (even in the demo)

- No GPS routes or maps of anyone's own workouts.
- Activities show only a day and time of day, never an exact time.
- Locations show only as a city and a rounded distance ("8 mi away").

## Credits

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright)
contributors. Fonts: Inter and Barlow Condensed (Google Fonts). Icons: Lucide.
