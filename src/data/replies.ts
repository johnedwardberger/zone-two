/*
 * Canned chat replies for the fictional seeded athletes, by personality.
 * {sport} is replaced with the athlete's main sport noun.
 */
import type { Sport } from '../types'

const SPORT_NOUN: Record<Sport, string> = { run: 'run', ride: 'ride', swim: 'swim' }

const REPLIES: Record<string, string[]> = {
  sunny: [
    'Hi!! So glad we matched 😊',
    'Honestly my favorite part of any {sport} is the coffee after.',
    'What are you training for right now?',
    'That sounds amazing. I love that you take it seriously but still have fun.',
    'We should get a {sport} on the calendar!',
    'Mornings work best for me. Weekends especially.',
  ],
  dry: [
    'Hey. Good taste in workouts.',
    'I respect anyone who logs their recovery days.',
    'What’s your longest {sport} this year?',
    'Solid. Mine was too long, in hindsight.',
    'I’m in for a {sport} if there’s food after.',
    'I’ll bring snacks. Not the good ones, though.',
  ],
  nerdy: [
    'Hi! I may have already looked at your splits. In a respectful way.',
    'Do you train by heart rate or by feel?',
    'I have a spreadsheet for everything. Including tacos.',
    'Zone 2 is underrated. That’s my whole personality.',
    'Want to do an easy {sport} and compare notes?',
    'I’ll plan the route. You plan the post-workout food?',
  ],
  chill: [
    'Hey, nice to match with you.',
    'Easy days are my favorite days honestly.',
    'How long have you been doing this?',
    'Love that. No pressure, just miles.',
    'A low-key {sport} sounds perfect.',
    'Weekend morning? I’m flexible.',
  ],
  competitive: [
    'Hey! Saw your last session. Strong.',
    'Race calendar check: what’s next for you?',
    'I promise to keep it conversational. Mostly.',
    'Respect. That’s a real block of training.',
    'Let’s do a {sport}. First one to the coffee shop buys.',
    'I’m free most mornings after 6.',
  ],
  goofy: [
    'Hi!!! Thanks for the Pulse. Mine’s racing 😄',
    'Important question: post-{sport} snack of choice?',
    'Correct answer. We’re going to get along.',
    'I once ran into a mailbox during a tempo. Ask me about it never.',
    'A {sport} date? Say less.',
    'I’ll be the one in the very loud socks.',
  ],
}

const DATE_ACCEPTED: Record<string, string> = {
  sunny: 'Yes!! It’s a date. See you there 🙌',
  dry: 'Locked in. I’ll be the one on time.',
  nerdy: 'Accepted and added to my calendar (and my spreadsheet).',
  chill: 'Sounds perfect. See you then.',
  competitive: 'Done. I’ll keep the pace honest 😉',
  goofy: 'It’s a date! Loud socks confirmed.',
}

export function cannedReply(persona: string | undefined, index: number, sport: Sport): string {
  const lines = REPLIES[persona ?? 'chill'] ?? REPLIES.chill
  return lines[index % lines.length].replaceAll('{sport}', SPORT_NOUN[sport])
}

export function dateAcceptedReply(persona: string | undefined): string {
  return DATE_ACCEPTED[persona ?? 'chill'] ?? DATE_ACCEPTED.chill
}
