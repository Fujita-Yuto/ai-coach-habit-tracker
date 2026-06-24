"use client";

import { useState } from "react";
import {
  getHabits,
  getLogs,
  getWeights,
  calcWeeklyRate,
} from "@/lib/storage";

export default function AiCoach() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const habits = getHabits();
    const logs = getLogs();
    const weights = getWeights();
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
        setMessage(json.message ?? "（回答なし）");
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
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          AIコーチが考えています…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          <span className="block mb-1 text-xs font-semibold text-indigo-500">AIコーチより</span>
          {message}
        </div>
      )}
    </div>
  );
}
