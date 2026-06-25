"use client";

import { useState, useEffect, startTransition } from "react";
import {
  getHabits,
  saveHabits,
  getLogs,
  toggleLog,
  calcStreak,
  calcWeeklyRate,
  type Habit,
  type HabitLog,
} from "@/lib/storage";
import {
  dbGetHabits,
  dbAddHabit,
  dbDeleteHabit,
  dbGetLogs,
  dbToggleLog,
} from "@/lib/db";
import { useAuth } from "./AuthProvider";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitList() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [newName, setNewName] = useState("");

  // user が変わるたびに再ロード（ログイン・ログアウト時も含む）
  useEffect(() => {
    async function load() {
      if (user) {
        const [h, l] = await Promise.all([
          dbGetHabits(user.id),
          dbGetLogs(user.id),
        ]);
        startTransition(() => {
          setHabits(h);
          setLogs(l);
        });
      } else {
        startTransition(() => {
          setHabits(getHabits());
          setLogs(getLogs());
        });
      }
    }
    load();
  }, [user]);

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name,
      createdAt: todayStr(),
    };
    if (user) {
      await dbAddHabit(user.id, habit);
      setHabits((prev) => [...prev, habit]);
    } else {
      const updated = [...habits, habit];
      saveHabits(updated);
      setHabits(updated);
    }
    setNewName("");
  }

  async function removeHabit(id: string) {
    if (user) {
      await dbDeleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setLogs((prev) => prev.filter((l) => l.habitId !== id));
    } else {
      const updated = habits.filter((h) => h.id !== id);
      saveHabits(updated);
      setHabits(updated);
    }
  }

  async function handleToggle(habitId: string) {
    const date = todayStr();
    if (user) {
      const newDone = await dbToggleLog(user.id, habitId, date);
      setLogs((prev) => {
        const idx = prev.findIndex(
          (l) => l.habitId === habitId && l.date === date
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], done: newDone };
          return next;
        }
        return [...prev, { habitId, date, done: newDone }];
      });
    } else {
      toggleLog(habitId, date);
      setLogs(getLogs());
    }
  }

  const weeklyRate = calcWeeklyRate(habits, logs);
  const today = todayStr();

  return (
    <div className="space-y-4">
      {/* 7日達成率サマリ */}
      {habits.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm">
          <span className="text-gray-600">直近7日の達成率</span>
          <span className="ml-auto font-bold text-indigo-600 text-lg">{weeklyRate}%</span>
        </div>
      )}

      {/* 習慣リスト */}
      {habits.length === 0 ? (
        <p className="text-sm text-gray-400">習慣がまだありません。下のフォームから追加してください。</p>
      ) : (
        <ul className="space-y-2">
          {habits.map((habit) => {
            const isDone = logs.some(
              (l) => l.habitId === habit.id && l.date === today && l.done
            );
            const streak = calcStreak(habit.id, logs);
            return (
              <li
                key={habit.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => handleToggle(habit.id)}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-indigo-600"
                />
                <span
                  className={`flex-1 text-sm font-medium ${
                    isDone ? "text-gray-400 line-through" : "text-gray-800"
                  }`}
                >
                  {habit.name}
                </span>
                {streak > 0 && (
                  <span className="text-xs font-semibold text-orange-500">
                    🔥 {streak}日
                  </span>
                )}
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="shrink-0 text-gray-300 transition-colors hover:text-red-400"
                  aria-label={`${habit.name}を削除`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 追加フォーム */}
      <form onSubmit={addHabit} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="習慣名を入力（例：朝30分ウォーキング）"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          追加
        </button>
      </form>
    </div>
  );
}
