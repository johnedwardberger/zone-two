# Project Spec: Zone Two (Proof-of-Concept Demo)

Tagline: "Find someone in your zone."

## 0. How to work with me

- Read this entire file before writing code. Ask all clarifying questions in
  one list, then propose a plan (file structure, components, data model,
  phases) and wait for my approval.
- Build in the phases in Section 10. After each phase: run the dev server,
  check the UI at 375px, 768px, and 1440px widths, summarize what changed,
  commit with a clear message, and wait for my feedback.
- Don't add features, pages, or libraries beyond this spec without asking.
- If something here is unclear or conflicts with something else, ask; don't guess.

## 1. Overview

Zone Two is a dating web app for serious endurance athletes (runners,
cyclists, swimmers) who train many hours a week, with its own identity and
some Strava-like features. Users post workout sessions they've logged
elsewhere (Strava, Nike Run Club, Garmin, Apple Fitness) by entering the
metrics and adding their own photos. No GPS routes or maps of users' workouts
are ever shown. Instead of a generic like, users give **Kudos** to each
other's activities. Mutual Kudos unlocks the ability to send a **match
request**; once accepted, the two can chat and plan a workout as a first date.

- Core belief: fit people want to be with fit people.
- Audience: pro athletes and dedicated amateurs, mostly on their phones.
- This is a **front-end-only proof of concept** to demo the experience.
  No real accounts, no server, no database, no payments.

## 2. Tech stack

- React + Vite + TypeScript. Tailwind CSS with the palette below defined as
  theme tokens (no hard-coded hex values in components).
- React Router using HashRouter (so deep links work on GitHub Pages).
- App state persisted to localStorage so the demo survives reloads.
  A "Reset demo" button in Settings restores the seed data.
- Maps (only for public suggested date routes, Section 4.8): Leaflet with
  OpenStreetMap tiles, with the required OSM attribution. No API keys.
- Deploy: GitHub Actions workflow that builds and publishes to GitHub Pages
  on every push to `main`. Set Vite `base` to the repo name.
- No Strava/Nike/Garmin API connections of any kind.

## 3. Visual design

- Feel: sleek, modern, athletic, warm. Generous whitespace, big confident
  numbers for workout stats, rounded cards, soft shadows, smooth subtle
  motion. Its own identity; don't imitate Strava's orange UI or Tinder's
  flame branding.
- Palette (refine if needed, keep the feel; all text must meet WCAG AA):
  - Primary soft red: #D9675F
  - Primary pressed/hover: #B84E47
  - Cream background: #FAF4EA
  - Card surface: #FFFDF8
  - Text charcoal: #2B2523
  - Secondary text/borders: #8C807A
  - Match/celebration accent: soft red-to-coral gradient based on primary
- Typography: "Inter" for UI text; "Barlow Condensed" (bold) for stats and
  headlines. Load from Google Fonts.
- Icons: Lucide. Each sport has a consistent icon and subtle tint
  (run, ride, swim). Kudos gets a distinctive custom icon, not a heart or thumb.
- Logo: a simple wordmark "Zone Two," optionally with a minimal heart-rate
  line motif. Create it as inline SVG.
- Navigation: bottom tab bar on mobile; left sidebar on desktop (≥1024px).
  Tabs: Discover · Feed · Post (center, emphasized) · Matches · Profile.
- Respect `prefers-reduced-motion`. Visible keyboard focus states throughout.

## 4. Pages & features

### 4.1 Landing page (first visit)

- Hero: Zone Two wordmark, tagline, "Try the demo" button.
- "How it works" in four steps: Post your workout → Give Kudos →
  Request a match → Train together on your first date.
- Who it's for: runners, cyclists, swimmers who take training seriously.
- Footer note: "This is a demo. All profiles are fictional."

### 4.2 Onboarding (demo profile setup)

Multi-step form with a progress indicator, stored locally:

1. Name, date of birth (must be 18+; block under-18 with a friendly
   message), city.
2. Gender, and who you'd like to meet.
3. Sports (multi-select: run / ride / swim), typical weekly training hours,
   level (recreational, competitive, elite/pro), typical pace per sport.
4. Up to 6 photos (uploaded from device, compressed, stored as data URLs),
   short bio (max 300 chars), "ideal first date" workout.

- Include a "Skip: use a sample profile" option so demos are fast.

### 4.3 Discover (swipe deck): meeting new people

- A stack of **activity cards** from athletes you haven't matched with,
  filtered by Discovery settings (4.10).
- Each card: activity photo (or athlete photo), first name, age, city,
  sport icon, activity title, coarse date ("Tuesday morning"), and key
  metrics (see 4.5). Tap to open the full athlete profile.
- Actions: Pass and Kudos.
  - Mobile: swipe left = Pass, right = Kudos, with drag physics, card tilt,
    and "PASS"/"KUDOS" stamps that fade in while dragging.
  - Desktop: buttons + keyboard arrows (← pass, → kudos).
- Undo last swipe (one level).
- Empty state when the deck runs out, with a button to widen filters.

### 4.4 Kudos → match request → match

- Kudos are private. No one sees who gave them Kudos unless it's mutual
  (seeing all Kudos is a mock Pro feature; see 4.11).
- **Mutual Kudos:** when both users have given Kudos to at least one of
  each other's activities, both see a "Mutual Kudos with [Name]"
  notification and a **"Request to match"** button on that person's profile
  and in the Matches tab's "Mutual Kudos" section.
- **Match request:** either person can send it, optionally with a short note
  (max 140 chars). The other person can Accept or Decline. Declines are
  silent (the sender just never sees an acceptance).
- **Match:** on acceptance, show a full-screen celebration with both
  photos, shared sport(s), and a suggested first-date workout built from both
  profiles. Buttons: "Send a message" and "Keep swiping".
- Demo behavior:
  - Each seeded athlete has a hidden `likesYou` flag (~40% true). Giving
    Kudos to one with `likesYou = true` triggers Mutual Kudos (after a short
    delay, as if they'd already liked your activity).
  - When you send a match request to a seeded athlete, they accept after
    2–4 seconds.
  - After onboarding, seed 2 incoming match requests from seeded athletes
    so the "accept a request" flow can also be demoed.

### 4.5 Post an activity

Form fields:

- Sport (run / ride / swim), title, date, time of day (morning / afternoon /
  evening; never exact time).
- Distance and moving time, with pace/speed calculated live:
  run = min/mi or min/km, ride = mph or km/h, swim = per 100 yd or per 100 m.
- Optional: elevation gain (run/ride), average heart rate, perceived effort
  (1–10), description.
- "Logged with" tag: Strava, Nike Run Club, Garmin Connect, Apple Fitness,
  Other (a label only, no integration).
- Up to 4 photos.
- No location or route fields.
- Inline validation (no negative values or physically impossible paces).
- After posting: success toast, and the activity appears on Profile, in the
  Feed for matches, and in other users' Discover decks.

### 4.6 Feed (matches only)

- Chronological list of activities from your matches and yourself.
- Each post: athlete, sport, title, metrics row, photos (carousel if >1),
  Kudos button with count, and comments.
- Kudos here are a friendly reaction between people who have already
  matched; they don't affect matching.

### 4.7 Matches & chat

- Matches tab sections: "Match requests" (incoming, with Accept/Decline),
  "Mutual Kudos" (people you can send a request to), new matches as a
  horizontal avatar row, and conversations with last-message previews.
- Chat thread: message bubbles, timestamps, typing indicator.
  Demo: seeded athletes reply with short canned messages after 1–3 seconds,
  written to fit their sport and personality.
- Every profile and chat has Unmatch, Block, and Report (reason picker +
  confirmation; blocking removes the person everywhere).

### 4.8 Plan a date (with suggested routes)

- "Plan a workout date" button in chat opens a planner:
  1. Sport (pre-selected from shared sports).
  2. **Suggested routes**: cards for well-known public routes and venues in
     the demo city that fit the sport and both athletes' typical distances,
     each with name, distance options, surface, a public meeting point
     (trailhead/parking lot/pool entrance), a one-line description, and a
     small Leaflet map of the public route. Option to enter a custom
     public meeting spot instead.
  3. Distance and target pace (suggested from both athletes' typical paces,
     using the slower partner's comfortable pace by default).
  4. Day and time of day.
- Sends a styled "Date proposal" card in the chat with Accept / Suggest
  changes. In the demo, the seeded athlete accepts.
- Include a small safety tip on the planner: meet at a public, busy spot in
  daylight and tell a friend your plans.

### 4.9 Profile

- Header: swipeable photos, name, age, city, sports, level, bio,
  ideal first date.
- Training snapshot: average weekly hours (last 4 weeks), totals per sport,
  longest session, and a small bar chart of the last 8 weeks.
- Grid/list of their activities.
- Own profile adds Edit Profile.

### 4.10 Settings

- Units: miles / kilometers.
- Discovery filters:
  - Sports (run / ride / swim)
  - Age range (dual slider, 18–70)
  - Gender / who you want to meet
  - Distance from my city (radius slider, using city coordinates in seed data)
  - Minimum average weekly training hours
  - Level (recreational / competitive / elite-pro) and pace range per sport
- No minimum activity requirement to use the app; volume is a filter only.
- Link to Zone Two Pro page.
- Reset demo.

### 4.11 Zone Two Pro (mock premium screen, non-functional)

- An upsell page reachable from Settings and from a subtle banner in
  Discover/Matches.
- Features shown: See who gave you Kudos (blurred avatar grid preview),
  Unlimited undo, Boost your activity to the top of nearby decks for 30 min,
  Travel mode (swipe in another city before a race).
- Mock pricing: monthly and annual plan cards.
- "Upgrade" button opens a modal: "Payments aren't part of this demo."
  Nothing is unlocked.

## 5. Seed data

- 25–30 fictional athletes in a single `/data/seed.ts`, varied by sport,
  level, age (21–45), gender, and city. Most are in or around Indianapolis,
  IN so matching feels local; a few are farther away to demo the distance
  filter.
- Each has 3–8 activities with realistic metrics (e.g., a 2:45 marathoner's
  easy runs are ~7:30–8:15/mi; a competitive cyclist's endurance rides are
  ~18–21 mph; a masters swimmer's 100 yd pace is ~1:20–1:45).
- Suggested date routes (8–12) for Indianapolis using real, well-known public
  places, e.g., the Monon Trail, Indianapolis Cultural Trail, Central Canal
  Towpath, Fall Creek Trail, Eagle Creek Park, plus public pools for swims.
  Verify names and use approximate, reasonable distances/coordinates;
  ask me if unsure.
- Photos: illustrated or abstract placeholder avatars and generic sport/
  scenery images that clearly aren't real people. Never use photos of
  real people.
- Label clearly throughout that all profiles are fictional.

## 6. Accessibility

- WCAG 2.2 AA: contrast, semantic HTML, labeled inputs, alt text, full
  keyboard support (including the swipe deck), focus management for modals.

## 7. Code standards

- Organize by feature (`/features/discover`, `/features/matches`,
  `/features/chat`, `/features/post`, ...), shared UI in `/components`,
  types in `/types`, seed data in `/data`.
- One central store (Zustand) wrapping localStorage, behind a clean data
  interface, so a real backend could replace it later without touching UI.
- Pace/speed/unit conversions and matching logic in pure, tested utility
  functions (Vitest).
- README: what Zone Two is, how to run locally, how deploy works, and that
  all data is fictional.

## 8. Privacy principles (even in the demo)

- No GPS routes or maps of users' own workouts, ever.
- Activity times shown only as day + time of day, never exact timestamps.
- Location shown as city and rounded distance ("8 mi away") only.

## 9. Out of scope for this demo

- Real authentication, servers, databases, real payments, push
  notifications, external fitness-app integrations, native mobile apps.

## 10. Build phases

1. Scaffold, Tailwind theme tokens, routing, layout shell with nav,
   GitHub Pages deploy workflow (get it live first).
2. Seed data, store, unit/pace utilities, matching logic (with tests).
3. Landing page + onboarding.
4. Discover swipe deck.
5. Kudos → mutual Kudos → match requests → match celebration.
6. Post activity + Profile.
7. Feed.
8. Matches tab + chat + block/report.
9. Plan a date + suggested routes + map.
10. Settings, filters, Zone Two Pro page, reset demo.
11. Polish: animations, empty states, accessibility pass, responsive QA,
    final review against every section of this spec.

## 11. Definition of done

- The full flow works in the deployed demo: land → onboard → swipe → mutual
  Kudos → send/accept match request → match → chat → plan a date on a
  suggested route → post an activity → see it on profile and in the feed.
- No console errors; works in latest Chrome, Safari, Firefox, and mobile
  Safari.
- Every item in this spec is implemented or explicitly discussed with me.

## 12. Decisions log (agreed after Phase 0 Q&A)

- Deploy: GitHub Pages via Actions, base `/zone-two/`, no custom domain.
- Palette AA fixes: secondary _text_ uses darker `#6B605A`; `#8C807A` is for
  borders/icons only. Filled buttons use `#B84E47` with white text (pressed:
  darker still). `#D9675F` stays the brand accent for icons, Kudos,
  gradients and large display text.
- Bottom tab bar below 1024px (incl. tablets); left sidebar at ≥1024px.
- Post is a regular page (`/post`). Settings opens from a gear on Profile
  and appears in the desktop sidebar.
- Discover shows one card per athlete (their most recent activity); the
  athlete leaves the deck after Pass or Kudos.
- Discovery filters apply both ways (gender and age).
- Onboarding city is a pick-list of seeded cities (needed for distance).
- Passed athletes return only when filters widen or the demo is reset.
- Feed comments are one-way; seeded athletes don't reply to them.
- Sample profile includes 4–5 activities. Default units: miles.
- Libraries: swipe physics hand-rolled (pointer events, no new dependency);
  `react-leaflet` allowed with `leaflet`; ESLint + Prettier; bar chart and
  image compression hand-rolled.
- QA: Chromium screenshots at 375/768/1440 here; the owner checks Safari,
  Firefox and mobile Safari on real devices.
