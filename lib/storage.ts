export type Habit = {
  id: string;
  name: string;
  createdAt: string;
};

export type HabitLog = {
  habitId: string;
  date: string; // "YYYY-MM-DD"
  done: boolean;
};

export type WeightEntry = {
  date: string; // "YYYY-MM-DD"
  weightKg: number;
};

const HABITS_KEY = "habit-tracker:habits";
const LOGS_KEY = "habit-tracker:logs";
const WEIGHTS_KEY = "habit-tracker:weights";

export function getHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HABITS_KEY);
  return raw ? (JSON.parse(raw) as Habit[]) : [];
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getLogs(): HabitLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOGS_KEY);
  return raw ? (JSON.parse(raw) as HabitLog[]) : [];
}

export function saveLogs(logs: HabitLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getWeights(): WeightEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(WEIGHTS_KEY);
  return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
}

export function saveWeights(weights: WeightEntry[]): void {
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
}

export function toggleLog(habitId: string, date: string): void {
  const logs = getLogs();
  const idx = logs.findIndex((l) => l.habitId === habitId && l.date === date);
  if (idx >= 0) {
    logs[idx] = { ...logs[idx], done: !logs[idx].done };
  } else {
    logs.push({ habitId, date, done: true });
  }
  saveLogs(logs);
}

// 今日から過去にさかのぼって done:true が連続している日数
export function calcStreak(habitId: string, logs: HabitLog[]): number {
  const doneDates = new Set(
    logs.filter((l) => l.habitId === habitId && l.done).map((l) => l.date)
  );
  let streak = 0;
  const base = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (doneDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// 直近7日の達成率 (%)
export function calcWeeklyRate(habits: Habit[], logs: HabitLog[]): number {
  if (habits.length === 0) return 0;
  const base = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  let done = 0;
  for (const habit of habits) {
    for (const date of dates) {
      const log = logs.find((l) => l.habitId === habit.id && l.date === date);
      if (log?.done) done++;
    }
  }
  return Math.round((done / (habits.length * 7)) * 100);
}
