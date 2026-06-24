import { describe, it, expect } from "vitest";
import { calcStreak, calcWeeklyRate } from "./storage";
import type { Habit, HabitLog } from "./storage";

/** 今日から n 日前の "YYYY-MM-DD" 文字列を返す */
function ago(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** テスト用ログ生成ヘルパー */
function log(habitId: string, daysAgo: number, done = true): HabitLog {
  return { habitId, date: ago(daysAgo), done };
}

const HABIT_A: Habit = { id: "a", name: "運動", createdAt: ago(30) };
const HABIT_B: Habit = { id: "b", name: "読書", createdAt: ago(30) };

// ─── calcStreak ────────────────────────────────────────────────────────────

describe("calcStreak", () => {
  it("記録がゼロのとき 0 を返す", () => {
    expect(calcStreak("a", [])).toBe(0);
  });

  it("今日だけ達成していれば 1 を返す", () => {
    expect(calcStreak("a", [log("a", 0)])).toBe(1);
  });

  it("今日と昨日を達成していれば 2 を返す", () => {
    expect(calcStreak("a", [log("a", 0), log("a", 1)])).toBe(2);
  });

  it("直近 N 日連続達成で N を返す", () => {
    const logs = [0, 1, 2, 3, 4].map((d) => log("a", d));
    expect(calcStreak("a", logs)).toBe(5);
  });

  it("今日が未達成なら 0 を返す（昨日まで連続していても）", () => {
    const logs = [1, 2, 3].map((d) => log("a", d));
    expect(calcStreak("a", logs)).toBe(0);
  });

  it("途中で連続が途切れる場合、今日から連続している分だけカウントする", () => {
    // 今日・昨日は達成、2日前はスキップ、3日前は達成
    const logs = [log("a", 0), log("a", 1), log("a", 3)];
    expect(calcStreak("a", logs)).toBe(2);
  });

  it("done:false の記録はストリークに含まない", () => {
    const logs = [log("a", 0, false), log("a", 1, true)];
    expect(calcStreak("a", logs)).toBe(0);
  });

  it("別の habitId のログは無視する", () => {
    const logs = [log("b", 0), log("b", 1), log("b", 2)];
    expect(calcStreak("a", logs)).toBe(0);
  });

  it("全日達成（7日分）で 7 を返す", () => {
    const logs = [0, 1, 2, 3, 4, 5, 6].map((d) => log("a", d));
    expect(calcStreak("a", logs)).toBe(7);
  });
});

// ─── calcWeeklyRate ────────────────────────────────────────────────────────

describe("calcWeeklyRate", () => {
  it("習慣リストがゼロのとき 0 を返す", () => {
    expect(calcWeeklyRate([], [])).toBe(0);
  });

  it("ログがゼロのとき 0 を返す", () => {
    expect(calcWeeklyRate([HABIT_A], [])).toBe(0);
  });

  it("done:false のログはカウントしない", () => {
    const logs = [0, 1, 2, 3, 4, 5, 6].map((d) => log("a", d, false));
    expect(calcWeeklyRate([HABIT_A], logs)).toBe(0);
  });

  it("1習慣・全 7 日達成で 100 を返す", () => {
    const logs = [0, 1, 2, 3, 4, 5, 6].map((d) => log("a", d));
    expect(calcWeeklyRate([HABIT_A], logs)).toBe(100);
  });

  it("1習慣・7日中 3 日達成で 43 を返す（四捨五入）", () => {
    const logs = [0, 1, 2].map((d) => log("a", d));
    expect(calcWeeklyRate([HABIT_A], logs)).toBe(43); // 3/7*100 ≈ 42.857 → 43
  });

  it("2習慣・HABIT_A のみ全 7 日達成で 50 を返す", () => {
    // スロット合計 14、うち 7 件達成 → 50%
    const logs = [0, 1, 2, 3, 4, 5, 6].map((d) => log("a", d));
    expect(calcWeeklyRate([HABIT_A, HABIT_B], logs)).toBe(50);
  });

  it("直近 7 日よりも古い記録は集計に含まない", () => {
    // daysAgo(7) は 8 日目にあたり範囲外
    const logs = [log("a", 7), log("a", 8), log("a", 10)];
    expect(calcWeeklyRate([HABIT_A], logs)).toBe(0);
  });

  it("連続が途切れていても 7 日分の合計で率を計算する", () => {
    // 1習慣・今日と 6 日前だけ達成（2/7 = 28.57 → 29）
    const logs = [log("a", 0), log("a", 6)];
    expect(calcWeeklyRate([HABIT_A], logs)).toBe(29);
  });
});
