"use client";

import { useState, useEffect, startTransition } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getWeights, saveWeights, type WeightEntry } from "@/lib/storage";
import { dbGetWeights, dbUpsertWeight, dbDeleteWeight } from "@/lib/db";
import { useAuth } from "./AuthProvider";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function WeightChart() {
  const { user } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [date, setDate] = useState(todayStr());
  const [kg, setKg] = useState("");

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await dbGetWeights(user.id);
        startTransition(() => setWeights(data));
      } else {
        startTransition(() => setWeights(getWeights()));
      }
    }
    load();
  }, [user]);

  async function addWeight(e: React.FormEvent) {
    e.preventDefault();
    const weightKg = parseFloat(kg);
    if (!date || isNaN(weightKg) || weightKg <= 0) return;
    const entry: WeightEntry = { date, weightKg };

    if (user) {
      await dbUpsertWeight(user.id, entry);
      setWeights((prev) =>
        [...prev.filter((w) => w.date !== date), entry].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      );
    } else {
      const updated = [...weights.filter((w) => w.date !== date), entry].sort(
        (a, b) => a.date.localeCompare(b.date)
      );
      saveWeights(updated);
      setWeights(updated);
    }
    setKg("");
  }

  async function removeWeight(targetDate: string) {
    if (user) {
      await dbDeleteWeight(user.id, targetDate);
      setWeights((prev) => prev.filter((w) => w.date !== targetDate));
    } else {
      const updated = weights.filter((w) => w.date !== targetDate);
      saveWeights(updated);
      setWeights(updated);
    }
  }

  const chartData = weights.slice(-30).map((w) => ({
    date: w.date.slice(5),
    体重: w.weightKg,
  }));

  return (
    <div className="space-y-4">
      {/* 入力フォーム */}
      <form onSubmit={addWeight} className="flex flex-wrap gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        />
        <input
          type="number"
          value={kg}
          onChange={(e) => setKg(e.target.value)}
          placeholder="体重 (kg)"
          step="0.1"
          min="0"
          className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          記録
        </button>
      </form>

      {/* 折れ線グラフ */}
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400">体重を記録するとグラフが表示されます。</p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v: number) => `${v}kg`}
                width={52}
              />
              <Tooltip
                formatter={(v) => [`${v} kg`, "体重"]}
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#f9fafb",
                }}
              />
              <Line
                type="monotone"
                dataKey="体重"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 直近5件リスト */}
      {weights.length > 0 && (
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {[...weights]
            .reverse()
            .slice(0, 5)
            .map((w) => (
              <li
                key={w.date}
                className="flex items-center justify-between border-b border-gray-100 py-1 dark:border-gray-700"
              >
                <span>{w.date}</span>
                <span className="font-medium">{w.weightKg} kg</span>
                <button
                  onClick={() => removeWeight(w.date)}
                  className="text-gray-300 transition-colors hover:text-red-400 dark:text-gray-600 dark:hover:text-red-500"
                  aria-label={`${w.date}の記録を削除`}
                >
                  ✕
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
