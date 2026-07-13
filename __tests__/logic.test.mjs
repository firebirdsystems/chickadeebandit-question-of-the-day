import { describe, it, expect } from "vitest";
import {
  DECK, pickQuestion, isoDay, endOfDayIso, isReleased, sortedRounds,
  roundForDay, answeredMemberIds, everyoneAnswered,
} from "../src/logic.js";

describe("pickQuestion", () => {
  it("never repeats an already-asked question", () => {
    const used = DECK.slice(0, DECK.length - 1);
    expect(pickQuestion(used, () => 0)).toBe(DECK[DECK.length - 1]);
  });
  it("matches used questions case/space-insensitively", () => {
    const used = [` ${DECK[0].toUpperCase()} `];
    expect(pickQuestion(used, () => 0)).not.toBe(DECK[0]);
  });
  it("returns null when the deck is exhausted", () => {
    expect(pickQuestion(DECK)).toBeNull();
  });
});

describe("day helpers", () => {
  it("isoDay formats local dates", () => {
    expect(isoDay(new Date(2026, 6, 12, 9))).toBe("2026-07-12");
  });
  it("endOfDayIso is a valid instant at local end of day", () => {
    const iso = endOfDayIso("2026-07-12");
    expect(new Date(iso).getTime()).toBe(new Date("2026-07-12T23:59:59").getTime());
    expect(endOfDayIso("garbage")).toBe("");
  });
});

describe("isReleased — must mirror the hub's sealed_until check", () => {
  const now = new Date("2026-07-12T12:00:00Z");
  it("released when closed by status", () => {
    expect(isReleased({ status: "closed", reveal_at: "2099-01-01T00:00:00Z" }, now)).toBe(true);
  });
  it("released when reveal_at has passed, even if still open", () => {
    expect(isReleased({ status: "open", reveal_at: "2026-07-12T11:00:00Z" }, now)).toBe(true);
    expect(isReleased({ status: "open", reveal_at: "2026-07-12T12:00:00Z" }, now)).toBe(true);
  });
  it("sealed while open and before reveal_at", () => {
    expect(isReleased({ status: "open", reveal_at: "2026-07-12T23:59:59Z" }, now)).toBe(false);
    expect(isReleased(null, now)).toBe(false);
  });
});

describe("rounds", () => {
  const rounds = [
    { id: "old", question_date: "2026-07-10", created_at: "1" },
    { id: "today", question_date: "2026-07-12", created_at: "2" },
  ];
  it("sorts newest first", () => {
    expect(sortedRounds(rounds)[0].id).toBe("today");
  });
  it("finds the round for a day", () => {
    expect(roundForDay(rounds, "2026-07-12")?.id).toBe("today");
    expect(roundForDay(rounds, "2026-07-11")).toBeNull();
  });
});

describe("marks", () => {
  const members = [{ id: "a" }, { id: "b" }];
  const marks = [
    { round_id: "r1", member_id: "a" },
    { round_id: "r2", member_id: "b" },
  ];
  it("collects answered member ids per round", () => {
    expect([...answeredMemberIds(marks, "r1")]).toEqual(["a"]);
  });
  it("everyoneAnswered requires all current members", () => {
    expect(everyoneAnswered(marks, "r1", members)).toBe(false);
    expect(everyoneAnswered([...marks, { round_id: "r1", member_id: "b" }], "r1", members)).toBe(true);
    expect(everyoneAnswered(marks, "r1", [])).toBe(false);
  });
});
