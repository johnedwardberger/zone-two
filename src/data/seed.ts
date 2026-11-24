/*
 * Zone Two seed data. EVERY PERSON HERE IS FICTIONAL.
 * Names, bios and stats are invented for the demo; photos are generated
 * illustrations (see components/Photo), never pictures of real people.
 *
 * Canonical units: run pace s/km, ride speed km/h, swim pace s/100m.
 */
import type { Activity, Athlete, City, Gender, Level, LoggedWith, Sport, TimeOfDay } from '../types'
import { LOGGED_WITH } from '../types'
import { addDays } from '../lib/dates'
import { hashString, mulberry32 } from '../lib/random'

export const CITIES: City[] = [
  { id: 'indianapolis', name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  { id: 'carmel', name: 'Carmel', state: 'IN', lat: 39.9784, lng: -86.118 },
  { id: 'fishers', name: 'Fishers', state: 'IN', lat: 39.9568, lng: -86.0134 },
  { id: 'westfield', name: 'Westfield', state: 'IN', lat: 40.0428, lng: -86.1275 },
  { id: 'noblesville', name: 'Noblesville', state: 'IN', lat: 40.0456, lng: -86.0086 },
  { id: 'zionsville', name: 'Zionsville', state: 'IN', lat: 39.9509, lng: -86.2617 },
  { id: 'greenwood', name: 'Greenwood', state: 'IN', lat: 39.6137, lng: -86.1067 },
  { id: 'bloomington', name: 'Bloomington', state: 'IN', lat: 39.1653, lng: -86.5264 },
  { id: 'west-lafayette', name: 'West Lafayette', state: 'IN', lat: 40.4259, lng: -86.9081 },
  { id: 'cincinnati', name: 'Cincinnati', state: 'OH', lat: 39.1031, lng: -84.512 },
  { id: 'louisville', name: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585 },
  { id: 'chicago', name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
]

export function cityName(id: string): string {
  const c = CITIES.find((x) => x.id === id)
  return c ? `${c.name}, ${c.state}` : ''
}

type AthleteSeed = Omit<Athlete, 'photos' | 'meet' | 'ageMin' | 'ageMax'> & {
  hue: number
  meet?: Gender[]
  ageMin?: number
  ageMax?: number
}

const W: Gender = 'woman'
const M: Gender = 'man'
const NB: Gender = 'nonbinary'

/** Paces here: run s/km, ride km/h, swim s/100m. */
const ATHLETES: AthleteSeed[] = [
  // ── Indianapolis area ───────────────────────────────────────────────
  {
    id: 'a01',
    firstName: 'Maya',
    birthDate: '1994-04-12',
    gender: W,
    meet: [M],
    cityId: 'indianapolis',
    sports: ['run'],
    weeklyHours: 10,
    level: 'elite',
    paces: { run: 285 },
    bio: '2:45 marathoner chasing a sub-2:40. Coffee before, tacos after. Monon Trail regular.',
    idealDate: 'Easy 8 miles on the Monon, then breakfast in Broad Ripple.',
    likesYou: true,
    persona: 'sunny',
    hue: 8,
  },
  {
    id: 'a02',
    firstName: 'Ethan',
    birthDate: '1990-09-03',
    gender: M,
    meet: [W],
    cityId: 'carmel',
    sports: ['ride', 'run'],
    weeklyHours: 14,
    level: 'competitive',
    paces: { ride: 31, run: 300 },
    bio: 'Cat 2 road racer. I will absolutely stop for a gas-station Coke mid-ride.',
    idealDate: 'A 40-mile no-drop ride with a café stop in Zionsville.',
    likesYou: false,
    persona: 'dry',
    hue: 210,
  },
  {
    id: 'a03',
    firstName: 'Priya',
    birthDate: '1996-01-22',
    gender: W,
    meet: [M, W],
    cityId: 'indianapolis',
    sports: ['swim', 'run', 'ride'],
    weeklyHours: 13,
    level: 'competitive',
    paces: { swim: 92, run: 310, ride: 29 },
    bio: 'Triathlete, 70.3 age-grouper. I own more goggles than shoes.',
    idealDate: 'Lap swim at the IU Natatorium, then smoothies.',
    likesYou: true,
    persona: 'nerdy',
    hue: 280,
  },
  {
    id: 'a04',
    firstName: 'Marcus',
    birthDate: '1988-06-30',
    gender: M,
    meet: [W],
    cityId: 'fishers',
    sports: ['run'],
    weeklyHours: 8,
    level: 'competitive',
    paces: { run: 300 },
    bio: 'Former college 10k guy, now chasing marathon PRs and good bagels.',
    idealDate: 'Fall Creek Trail out-and-back at conversation pace.',
    likesYou: false,
    persona: 'chill',
    hue: 30,
  },
  {
    id: 'a05',
    firstName: 'Lena',
    birthDate: '1992-11-08',
    gender: W,
    meet: [M],
    cityId: 'indianapolis',
    sports: ['ride'],
    weeklyHours: 12,
    level: 'competitive',
    paces: { ride: 30 },
    bio: 'Gravel by choice, road by necessity. Will talk about tire pressure for hours.',
    idealDate: 'Laps at Eagle Creek Park, then a picnic by the reservoir.',
    likesYou: true,
    persona: 'goofy',
    hue: 150,
  },
  {
    id: 'a06',
    firstName: 'Jordan',
    birthDate: '1998-03-17',
    gender: NB,
    meet: [W, M, NB],
    cityId: 'indianapolis',
    sports: ['run', 'swim'],
    weeklyHours: 9,
    level: 'recreational',
    paces: { run: 345, swim: 115 },
    bio: 'Half-marathons, open-water season, and too many race shirts.',
    idealDate: 'Cultural Trail loop and coffee at the City Market.',
    likesYou: true,
    persona: 'sunny',
    hue: 330,
  },
  {
    id: 'a07',
    firstName: 'Diego',
    birthDate: '1985-12-01',
    gender: M,
    meet: [W],
    cityId: 'indianapolis',
    sports: ['ride', 'run'],
    weeklyHours: 15,
    level: 'elite',
    paces: { ride: 35, run: 280 },
    bio: 'Duathlete, former pro cyclist. Now I coach and still race the local crits.',
    idealDate: 'Track session at Major Taylor Velodrome. I will lend you a bike.',
    likesYou: false,
    persona: 'competitive',
    hue: 195,
  },
  {
    id: 'a08',
    firstName: 'Hannah',
    birthDate: '1991-07-25',
    gender: W,
    meet: [M],
    cityId: 'carmel',
    sports: ['swim'],
    weeklyHours: 9,
    level: 'competitive',
    paces: { swim: 88 },
    bio: 'Masters swimmer, ex-D1 backstroker. Morning practice is my personality.',
    idealDate: 'Easy 2,000 yards side by side, then pancakes.',
    likesYou: false,
    persona: 'chill',
    hue: 190,
  },
  {
    id: 'a09',
    firstName: 'Noah',
    birthDate: '1995-02-14',
    gender: M,
    meet: [W, M],
    cityId: 'indianapolis',
    sports: ['run'],
    weeklyHours: 11,
    level: 'competitive',
    paces: { run: 295 },
    bio: 'Trail runner stuck in a flat state. Fort Harrison is my happy place.',
    idealDate: 'Fort Harrison trail loop and a dog-friendly patio.',
    likesYou: true,
    persona: 'goofy',
    hue: 95,
  },
  {
    id: 'a10',
    firstName: 'Sofia',
    birthDate: '1999-10-05',
    gender: W,
    meet: [M],
    cityId: 'fishers',
    sports: ['run', 'ride'],
    weeklyHours: 8,
    level: 'recreational',
    paces: { run: 340, ride: 25 },
    bio: 'Nurse who runs off night shifts. Training for my first full marathon.',
    idealDate: 'A slow 5 miles and an honest conversation.',
    likesYou: false,
    persona: 'sunny',
    hue: 345,
  },
  {
    id: 'a11',
    firstName: 'Caleb',
    birthDate: '1987-05-19',
    gender: M,
    meet: [W],
    cityId: 'westfield',
    sports: ['ride'],
    weeklyHours: 16,
    level: 'elite',
    paces: { ride: 36 },
    bio: 'Ultra-distance cyclist. 400 km brevets for fun. Yes, I eat a lot.',
    idealDate: 'A relaxed Monon cruise with a doughnut stop.',
    likesYou: false,
    persona: 'dry',
    hue: 220,
  },
  {
    id: 'a12',
    firstName: 'Ava',
    birthDate: '1993-08-28',
    gender: W,
    meet: [M, W],
    cityId: 'indianapolis',
    sports: ['swim', 'run'],
    weeklyHours: 10,
    level: 'competitive',
    paces: { swim: 95, run: 315 },
    bio: 'Open-water swimmer and aquathlon nerd. I like lakes more than people (kidding, mostly).',
    idealDate: 'Lap swim then tacos. Lots of tacos.',
    likesYou: true,
    persona: 'nerdy',
    hue: 175,
  },
  {
    id: 'a13',
    firstName: 'Liam',
    birthDate: '2000-01-11',
    gender: M,
    meet: [W],
    cityId: 'indianapolis',
    sports: ['run'],
    weeklyHours: 12,
    level: 'elite',
    paces: { run: 265 },
    bio: '14:20 5k, chasing an Olympic Trials standard. Very into naps.',
    idealDate: 'Shakeout on the Canal Towpath, then a long brunch.',
    likesYou: false,
    persona: 'competitive',
    hue: 15,
  },
  {
    id: 'a14',
    firstName: 'Grace',
    birthDate: '1989-03-02',
    gender: W,
    meet: [M],
    cityId: 'zionsville',
    sports: ['ride', 'run'],
    weeklyHours: 11,
    level: 'competitive',
    paces: { ride: 29, run: 320 },
    bio: 'Gran fondo addict and part-time baker. Climbs slowly, descends happily.',
    idealDate: 'Country-road ride from Zionsville to a farm stand.',
    likesYou: true,
    persona: 'sunny',
    hue: 40,
  },
  {
    id: 'a15',
    firstName: 'Owen',
    birthDate: '1992-12-20',
    gender: M,
    meet: [W, M],
    cityId: 'carmel',
    sports: ['swim', 'ride', 'run'],
    weeklyHours: 15,
    level: 'competitive',
    paces: { swim: 100, ride: 32, run: 305 },
    bio: 'Ironman finisher x3. Spreadsheet-driven training, chaos-driven everything else.',
    idealDate: 'Brick workout: short ride then a jog. Snacks provided.',
    likesYou: false,
    persona: 'nerdy',
    hue: 255,
  },
  {
    id: 'a16',
    firstName: 'Zoe',
    birthDate: '1997-06-09',
    gender: W,
    meet: [M, W, NB],
    cityId: 'indianapolis',
    sports: ['run'],
    weeklyHours: 7,
    level: 'recreational',
    paces: { run: 355 },
    bio: 'Run-club organizer. Fast friends, slow miles, good playlists.',
    idealDate: 'Sunset Cultural Trail run and ice cream.',
    likesYou: true,
    persona: 'goofy',
    hue: 300,
  },
  {
    id: 'a17',
    firstName: 'Isaac',
    birthDate: '1984-04-04',
    gender: M,
    meet: [W],
    cityId: 'noblesville',
    sports: ['ride'],
    weeklyHours: 10,
    level: 'recreational',
    paces: { ride: 27 },
    bio: 'Dad-joke specialist who started cycling at 35 and never stopped.',
    idealDate: 'Easy spin on the Monon and a coffee in Carmel.',
    likesYou: false,
    persona: 'chill',
    hue: 120,
  },
  {
    id: 'a18',
    firstName: 'Mia',
    birthDate: '1990-02-27',
    gender: W,
    meet: [M],
    cityId: 'indianapolis',
    sports: ['swim', 'run'],
    weeklyHours: 12,
    level: 'elite',
    paces: { swim: 80, run: 290 },
    bio: 'Former national-team swimmer, now running marathons for fun. Still early to everything.',
    idealDate: 'Lap swim at the Natatorium, then a walk downtown.',
    likesYou: false,
    persona: 'competitive',
    hue: 200,
  },
  {
    id: 'a19',
    firstName: 'Ben',
    birthDate: '1994-11-15',
    gender: M,
    meet: [W],
    cityId: 'greenwood',
    sports: ['run', 'ride'],
    weeklyHours: 9,
    level: 'competitive',
    paces: { run: 310, ride: 29 },
    bio: 'Physical therapist. I will judge your running form, lovingly.',
    idealDate: 'Garfield Park loops and a cold brew.',
    likesYou: true,
    persona: 'sunny',
    hue: 60,
  },
  {
    id: 'a20',
    firstName: 'Chloe',
    birthDate: '2001-09-21',
    gender: W,
    meet: [M, W],
    cityId: 'indianapolis',
    sports: ['ride'],
    weeklyHours: 9,
    level: 'recreational',
    paces: { ride: 24 },
    bio: 'Bike commuter turned weekend century rider. Pannier enthusiast.',
    idealDate: 'Cultural Trail ride with stops at every mural.',
    likesYou: false,
    persona: 'goofy',
    hue: 165,
  },
  {
    id: 'a21',
    firstName: 'Ryan',
    birthDate: '1986-08-08',
    gender: M,
    meet: [W],
    cityId: 'fishers',
    sports: ['swim', 'run'],
    weeklyHours: 8,
    level: 'recreational',
    paces: { swim: 125, run: 335 },
    bio: 'Masters swim newbie, longtime runner. Learning flip turns at 39.',
    idealDate: 'Morning swim and a big diner breakfast.',
    likesYou: false,
    persona: 'chill',
    hue: 240,
  },
  {
    id: 'a22',
    firstName: 'Nora',
    birthDate: '1995-05-05',
    gender: W,
    meet: [M],
    cityId: 'carmel',
    sports: ['run'],
    weeklyHours: 10,
    level: 'competitive',
    paces: { run: 300 },
    bio: 'Boston qualifier, spreadsheet keeper, sourdough maker.',
    idealDate: 'Tempo-ish Monon miles and a farmers market wander.',
    likesYou: false,
    persona: 'nerdy',
    hue: 20,
  },
  {
    id: 'a23',
    firstName: 'Theo',
    birthDate: '1997-12-12',
    gender: M,
    meet: [W, M, NB],
    cityId: 'indianapolis',
    sports: ['ride', 'swim'],
    weeklyHours: 11,
    level: 'competitive',
    paces: { ride: 30, swim: 105 },
    bio: 'Bike mechanic. I can fix your derailleur but not my sleep schedule.',
    idealDate: 'Velodrome open session, then pizza.',
    likesYou: true,
    persona: 'dry',
    hue: 270,
  },
  // ── Farther away (to demo the distance filter) ─────────────────────
  {
    id: 'a24',
    firstName: 'Elena',
    birthDate: '1991-03-30',
    gender: W,
    meet: [M],
    cityId: 'bloomington',
    sports: ['run', 'ride'],
    weeklyHours: 10,
    level: 'competitive',
    paces: { run: 305, ride: 28 },
    bio: 'Grad student, hill lover. Bloomington has the hills Indy is missing.',
    idealDate: 'Lake Monroe ride, slow and scenic.',
    likesYou: true,
    persona: 'nerdy',
    hue: 0,
  },
  {
    id: 'a25',
    firstName: 'Sam',
    birthDate: '1989-07-07',
    gender: M,
    meet: [W],
    cityId: 'chicago',
    sports: ['run'],
    weeklyHours: 11,
    level: 'elite',
    paces: { run: 275 },
    bio: 'Lakefront Trail miles every morning. Training for Chicago, obviously.',
    idealDate: 'Lakefront run then deep dish. Non-negotiable.',
    likesYou: false,
    persona: 'competitive',
    hue: 225,
  },
  {
    id: 'a26',
    firstName: 'Ruby',
    birthDate: '1996-10-18',
    gender: W,
    meet: [M, W],
    cityId: 'louisville',
    sports: ['swim', 'ride', 'run'],
    weeklyHours: 14,
    level: 'elite',
    paces: { swim: 85, ride: 33, run: 295 },
    bio: 'Pro triathlete in the making. Ohio River swims make me happy.',
    idealDate: 'Swim, bike, then bourbon-free lemonade.',
    likesYou: false,
    persona: 'sunny',
    hue: 315,
  },
  {
    id: 'a27',
    firstName: 'Felix',
    birthDate: '1983-01-25',
    gender: M,
    meet: [W],
    cityId: 'cincinnati',
    sports: ['ride'],
    weeklyHours: 13,
    level: 'competitive',
    paces: { ride: 31 },
    bio: 'Climber in a hilly city. Ask me about the best chili on the bike route.',
    idealDate: 'Riverside ride and a long lunch.',
    likesYou: false,
    persona: 'dry',
    hue: 100,
  },
  {
    id: 'a28',
    firstName: 'Iris',
    birthDate: '1993-04-16',
    gender: W,
    meet: [M, W, NB],
    cityId: 'west-lafayette',
    sports: ['run', 'swim'],
    weeklyHours: 9,
    level: 'competitive',
    paces: { run: 318, swim: 98 },
    bio: 'Engineer, ultrarunner, pool-lane diplomat.',
    idealDate: 'Riverfront trail run and a campus coffee crawl.',
    likesYou: true,
    persona: 'goofy',
    hue: 185,
  },
]

function toAthlete(s: AthleteSeed): Athlete {
  const { hue, ...rest } = s
  const scenes = s.sports.map((sp, i) => `art:scene:${sp}:${(hue + i * 3) % 6}`)
  return {
    ...rest,
    meet: s.meet ?? [M, W],
    ageMin: s.ageMin ?? 21,
    ageMax: s.ageMax ?? 50,
    photos: [`art:avatar:${hue}:${s.firstName[0]}`, ...scenes],
  }
}

export const SEED_ATHLETES: Athlete[] = ATHLETES.map(toAthlete)

/** Sample profile for "Skip: use a sample profile". Also fictional. */
export const SAMPLE_PROFILE: Athlete = {
  id: 'me',
  firstName: 'Alex',
  birthDate: '1995-05-20',
  gender: 'woman',
  meet: ['man', 'woman'],
  ageMin: 24,
  ageMax: 42,
  cityId: 'indianapolis',
  sports: ['run', 'ride'],
  weeklyHours: 9,
  level: 'competitive',
  paces: { run: 305, ride: 28 },
  bio: 'Marathoner dabbling in gravel. Early mornings, long brunches, good podcasts.',
  idealDate: 'Easy miles on the Monon, then coffee in Broad Ripple.',
  photos: ['art:avatar:12:A', 'art:scene:run:2', 'art:scene:ride:4'],
}

// ── Activity generation ───────────────────────────────────────────────

const TITLES: Record<Sport, string[]> = {
  run: [
    'Easy miles',
    'Long run',
    'Tempo Tuesday',
    'Recovery jog',
    'Track 6×800',
    'Progression run',
    'Hill repeats',
    'Shakeout',
    'Sunrise run',
    'Fartlek fun',
  ],
  ride: [
    'Endurance ride',
    'Zone 2 spin',
    'Group ride',
    'Gravel loop',
    'Coffee ride',
    'Sweet-spot intervals',
    'Century prep',
    'Recovery spin',
    'Headwind both ways',
    'Hill repeats',
  ],
  swim: [
    'Masters practice',
    'Aerobic swim',
    'Threshold set',
    'Easy laps',
    'Pull-buoy day',
    '10×100 on the clock',
    'Technique swim',
    'Open-water prep',
    'Kick set suffering',
    'Long swim',
  ],
}

const DESCRIPTIONS: Record<Sport, string[]> = {
  run: [
    'Legs felt great today.',
    'Kept it honest and easy.',
    'Windy but worth it.',
    'Negative split!',
  ],
  ride: [
    'Perfect weather.',
    'Café stop was the highlight.',
    'Held the wheel all day.',
    'Tailwind home.',
  ],
  swim: ['Lane to myself.', 'Working on my catch.', 'Long course is humbling.', 'Felt smooth.'],
}

function distanceRange(sport: Sport, level: Level): [number, number] {
  const scale = level === 'elite' ? 1.35 : level === 'competitive' ? 1.1 : 0.85
  if (sport === 'run') return [6000 * scale, 18000 * scale]
  if (sport === 'ride') return [30000 * scale, 95000 * scale]
  return [1500 * scale, 4000 * scale]
}

/** Build 3–8 recent activities for an athlete, deterministically from their id. */
export function generateActivities(athlete: Athlete, today: string, count?: number): Activity[] {
  const rnd = mulberry32(hashString(athlete.id))
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)]
  const n = count ?? 3 + Math.floor(rnd() * 6)
  const times: TimeOfDay[] = ['morning', 'morning', 'afternoon', 'evening']
  const logs: LoggedWith[] = LOGGED_WITH
  const result: Activity[] = []
  let daysAgo = Math.floor(rnd() * 4)

  for (let i = 0; i < n; i++) {
    // Primary sport appears most often.
    const sport = rnd() < 0.6 ? athlete.sports[0] : pick(athlete.sports)
    const [lo, hi] = distanceRange(sport, athlete.level)
    const roundTo = sport === 'swim' ? 50 : 100
    const distanceM = Math.round((lo + rnd() * (hi - lo)) / roundTo) * roundTo
    const basePace = athlete.paces[sport] ?? (sport === 'run' ? 330 : sport === 'ride' ? 26 : 120)
    const variation = 0.95 + rnd() * 0.12
    // Rides: higher = faster, so invert the variation.
    const pace = sport === 'ride' ? basePace / variation : basePace * variation
    const movingTimeS = Math.round(
      sport === 'run'
        ? (distanceM / 1000) * pace
        : sport === 'ride'
          ? (distanceM / 1000 / pace) * 3600
          : (distanceM / 100) * pace,
    )
    const date = addDays(today, -daysAgo)
    const photoCount = rnd() < 0.7 ? 1 : 2
    result.push({
      id: `${athlete.id}-act${i + 1}`,
      athleteId: athlete.id,
      sport,
      title: pick(TITLES[sport]),
      date,
      timeOfDay: pick(times),
      distanceM,
      movingTimeS,
      elevationM:
        sport === 'swim'
          ? undefined
          : Math.round((sport === 'run' ? 15 : 120) + rnd() * (sport === 'run' ? 150 : 900)),
      avgHr: rnd() < 0.8 ? Math.round(128 + rnd() * 30) : undefined,
      effort: Math.round(3 + rnd() * 5),
      description: rnd() < 0.5 ? pick(DESCRIPTIONS[sport]) : undefined,
      loggedWith: pick(logs),
      photos: Array.from(
        { length: photoCount },
        (_, k) => `art:scene:${sport}:${(i + k + hashString(athlete.id)) % 6}`,
      ),
      basePulses: Math.floor(4 + rnd() * 36),
      comments: [],
      postedAt: Date.now() - daysAgo * 86_400_000 - i,
    })
    daysAgo += 2 + Math.floor(rnd() * 7)
  }
  return result
}

/** Fresh seed state for a given "today". */
export function createSeedActivities(today: string): Activity[] {
  return SEED_ATHLETES.flatMap((a) => generateActivities(a, today))
}
