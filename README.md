# Zone Two

> Find someone in your zone.

Zone Two is a **front-end-only proof-of-concept** of a dating app for serious
endurance athletes — runners, cyclists and swimmers. Users post workouts they
logged elsewhere, give **Kudos** to each other's activities, and mutual Kudos
unlocks a match request. Once matched, they can chat and plan a workout as a
first date.

**This is a demo. All profiles are fictional.** There are no real accounts,
servers, databases or payments; app state lives in your browser's localStorage.

## Run locally

Requires Node 22+.

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run format`.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which lints, builds
and publishes `dist/` to GitHub Pages. The repo's **Settings → Pages → Source**
must be set to **GitHub Actions**. Vite's `base` is `/zone-two/` and the app
uses hash routing, so deep links work on Pages.

The project spec lives in [CLAUDE.md](./CLAUDE.md).
