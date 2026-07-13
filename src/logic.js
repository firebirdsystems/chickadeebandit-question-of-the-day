/**
 * Pure business logic for the Question of the Day app.
 * No DOM, no fetch — importable in both browser and test environments.
 */

/** The built-in question deck. Family-safe conversation starters. */
export const DECK = [
  "What made you laugh today?",
  "If our family had a theme song, what would it be?",
  "What's the best meal you've ever eaten?",
  "If you could have any superpower for one day, what would you do with it?",
  "What's something you're proud of from this week?",
  "If you could swap chores with anyone in the house, whose would you take?",
  "What's a smell that instantly makes you happy?",
  "Which movie could you watch a hundred times?",
  "If we went anywhere on vacation tomorrow, where should we go?",
  "What's the weirdest food combination you secretly like?",
  "Who was kind to you today?",
  "If you could talk to any animal, which one and why?",
  "What's a small thing that made today better?",
  "If our pet could talk for one hour, what would it complain about?",
  "What would you do with a completely free Saturday?",
  "What's something you want to learn this year?",
  "If you could rename yourself, what name would you pick?",
  "What's the best gift you've ever received?",
  "If our house had a secret room, what should be in it?",
  "What's a rule you'd add to our family?",
  "What are you most looking forward to this month?",
  "If you could be any age for a week, what age would you pick?",
  "What's the bravest thing you've ever done?",
  "Which fictional character would fit right into our family?",
  "What's your favorite memory from this year so far?",
  "If you could invent something, what problem would it solve?",
  "What's a food you refused to eat as a little kid but like now?",
  "If today had a title like a book chapter, what would it be?",
  "What's something you appreciate about the person to your left at dinner?",
  "If you won a small prize of $100, what would you spend it on?",
  "What's the best sound in the world?",
  "If we started a family band, what instrument would you play?",
  "What's something hard you're working on right now?",
  "If you could time-travel to watch one event, which one?",
  "What's your perfect breakfast?",
  "What would you put in a time capsule from this week?",
  "If our family had a motto, what should it be?",
  "What's a place nearby we've never explored but should?",
  "Who do you miss right now, and what would you tell them?",
  "What's one thing you'd change about school or work, if you could?",
];

/** Deterministic-ish pick: a random deck question not asked yet (null when exhausted). */
export function pickQuestion(usedQuestions, rand = Math.random) {
  const used = new Set((usedQuestions ?? []).map((q) => String(q).trim().toLowerCase()));
  const remaining = DECK.filter((q) => !used.has(q.trim().toLowerCase()));
  if (!remaining.length) return null;
  return remaining[Math.floor(rand() * remaining.length)];
}

/** Local YYYY-MM-DD for a Date. */
export function isoDay(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO instant for local end-of-day of a YYYY-MM-DD (the auto-reveal moment). */
export function endOfDayIso(dayIso) {
  const d = new Date(`${dayIso}T23:59:59`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

/**
 * Whether a round's answers are released for everyone: closed by status, or
 * its reveal_at is at/before now. MUST mirror the hub's sealed_until check so
 * the UI never says "sealed" for rows the hub is already returning.
 */
export function isReleased(round, now = new Date()) {
  if (!round) return false;
  if (round.status === "closed") return true;
  if (!round.reveal_at) return false;
  const t = new Date(round.reveal_at).getTime();
  return Number.isFinite(t) && t <= now.getTime();
}

/** Rounds sorted newest question first. */
export function sortedRounds(rounds) {
  return [...rounds].sort((a, b) =>
    String(b.question_date).localeCompare(String(a.question_date))
    || String(b.created_at).localeCompare(String(a.created_at)));
}

/** The round for a given local day (newest wins if several). */
export function roundForDay(rounds, dayIso) {
  return sortedRounds(rounds).find((r) => r.question_date === dayIso) ?? null;
}

/** Ids of members who have marked "answered" for a round. */
export function answeredMemberIds(marks, roundId) {
  return new Set(marks.filter((m) => m.round_id === roundId).map((m) => m.member_id));
}

/** True when every current household member has answered. */
export function everyoneAnswered(marks, roundId, members) {
  if (!members.length) return false;
  const answered = answeredMemberIds(marks, roundId);
  return members.every((m) => answered.has(m.id));
}
