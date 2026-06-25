"use client";

import { useState } from "react";
import { getHabits, getLogs, getWeights, calcWeeklyRate } from "@/lib/storage";
import { dbGetHabits, dbGetLogs, dbGetWeights } from "@/lib/db";
import { useAuth } from "./AuthProvider";
import type { CoachResponse } from "@/app/api/coach/route";

const CARDS: {
  key: keyof CoachResponse;
  label: string;
  icon: string;
  bg: string;
  border: string;
  heading: string;
}[] = [
  {
    key: "praise",
    label: "励まし",
    icon: "🌟",
    bg: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-200 dark:border-indigo-800",
    heading: "text-indigo-700 dark:text-indigo-400",
  },
  {
    key: "insight",
    label: "傾向・気づき",
    icon: "📊",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    heading: "text-blue-700 dark:text-blue-400",
  },
  {
    key: "action",
    label: "今日のアクション",
    icon: "🎯",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
    heading: "text-emerald-700 dark:text-emerald-400",
  },
];

export default function AiCoach() {
  const { user } = useAuth();
  const [result, setResult] = useState<CoachResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    setLoading(true);
    setResult(null);
    setError(null);

    const [habits, logs, weights] = user
      ? await Promise.all([
          dbGetHabits(user.id),
          dbGetLogs(user.id),
          dbGetWeights(user.id),
        ])
      : [getHabits(), getLogs(), getWeights()];

    const weeklyCompletionRate = calcWeeklyRate(habits, logs);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyCompletionRate,
          habits: habits.map((h) => h.name),
          recentWeights: weights.slice(-7),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "AIの呼び出しに失敗しました。");
      } else {
        setResult(json as CoachResponse);
      }
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleAsk}
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "考え中…" : "AIコーチに相談する"}
      </button>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          AIコーチが分析しています…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="grid gap-3 sm:grid-cols-3">
          {CARDS.map(({ key, label, icon, bg, border, heading }) => (
            <div
              key={key}
              className={`space-y-1 rounded-xl border ${border} ${bg} px-4 py-3`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${heading}`}>
                {icon} {label}
              </p>
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {result[key]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
