"use client";

import { useState, useEffect, startTransition } from "react";
import { getLogs } from "@/lib/storage";

type Cell = {
  dateStr: string;
  count: number;
  isFuture: boolean;
};

type MonthMarker = { col: number; label: string };

const MONTH_LABELS = [
  "1月","2月","3月","4月","5月","6月",
  "7月","8月","9月","10月","11月","12月",
];
// 日曜始まり: 月・水・金だけ表示（GitHub スタイル）
const DOW_LABELS = ["", "月", "", "水", "", "金", ""];

const CELL_PX = 12; // w-3
const GAP_PX  = 2;  // gap-0.5
const COL_W   = CELL_PX + GAP_PX; // 14px / week

function toUtcDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildGrid(countMap: Record<string, number>) {
  const todayStr = toUtcDateStr(new Date());

  // 今週の日曜（UTC）を基点に 52 週前の日曜から開始
  const now = new Date();
  const currentSunday = new Date(now);
  currentSunday.setUTCDate(now.getUTCDate() - now.getUTCDay());
  currentSunday.setUTCHours(0, 0, 0, 0);

  const start = new Date(currentSunday);
  start.setUTCDate(currentSunday.getUTCDate() - 51 * 7);

  const weeks: Cell[][] = [];
  const monthMarkers: MonthMarker[] = [];
  let lastMonth = -1;
  const cursor = new Date(start);

  while (weeks.length < 53) {
    // 月ラベル: 週の日曜の月が変わったタイミングで追加
    const m = cursor.getUTCMonth();
    if (m !== lastMonth) {
      monthMarkers.push({ col: weeks.length, label: MONTH_LABELS[m] });
      lastMonth = m;
    }

    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const ds = toUtcDateStr(cursor);
      week.push({
        dateStr: ds,
        count: countMap[ds] ?? 0,
        isFuture: ds > todayStr,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);

    // 次の日曜が今日より後ならグリッド完成
    if (toUtcDateStr(cursor) > todayStr) break;
  }

  return { weeks, monthMarkers };
}

function cellBg(count: number, isFuture: boolean): string {
  if (isFuture || count === 0) return "bg-gray-100";
  if (count === 1) return "bg-indigo-200";
  if (count <= 3) return "bg-indigo-400";
  if (count <= 5) return "bg-indigo-600";
  return "bg-indigo-800";
}

export default function HabitHeatmap() {
  const [weeks, setWeeks] = useState<Cell[][]>([]);
  const [monthMarkers, setMonthMarkers] = useState<MonthMarker[]>([]);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const logs = getLogs();
    const countMap: Record<string, number> = {};
    for (const log of logs) {
      if (log.done) countMap[log.date] = (countMap[log.date] ?? 0) + 1;
    }
    const { weeks, monthMarkers } = buildGrid(countMap);
    startTransition(() => {
      setWeeks(weeks);
      setMonthMarkers(monthMarkers);
    });
  }, []);

  if (weeks.length === 0) return null;

  const totalDone = weeks
    .flat()
    .reduce((s, c) => s + (c.isFuture ? 0 : c.count), 0);

  const gridWidth = weeks.length * COL_W + 24; // 24px = day-label column

  return (
    <div className="space-y-3">
      {/* サマリ */}
      <p className="text-sm text-gray-500">
        過去1年間の達成合計：
        <span className="font-semibold text-indigo-600">{totalDone} 件</span>
      </p>

      {/* スクロール可能なグリッド */}
      <div className="overflow-x-auto pb-1">
        <div className="relative" style={{ width: `${gridWidth}px` }}>
          {/* 月ラベル行 */}
          <div className="relative h-5 ml-6">
            {monthMarkers.map(({ col, label }) => (
              <span
                key={`${col}-${label}`}
                className="absolute text-[11px] leading-none text-gray-500 select-none"
                style={{ left: `${col * COL_W}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* 曜日ラベル + セルグリッド */}
          <div className="flex gap-0.5">
            {/* 曜日ラベル列 */}
            <div className="flex flex-col gap-0.5 w-6 shrink-0">
              {DOW_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="h-3 text-[10px] leading-3 text-gray-400 flex items-center justify-end pr-1 select-none"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* 週ごとの列 */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${cellBg(cell.count, cell.isFuture)} transition-opacity hover:opacity-70 cursor-default`}
                    onMouseEnter={(e) => {
                      if (cell.isFuture) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        text: `${cell.dateStr} — ${cell.count}件達成`,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ツールチップ（fixed でビューポート基準に配置）*/}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 34,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* 凡例 */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 select-none">
        <span>少</span>
        {(["bg-gray-100","bg-indigo-200","bg-indigo-400","bg-indigo-600","bg-indigo-800"] as const).map(
          (cls) => (
            <div key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
          )
        )}
        <span>多</span>
      </div>
    </div>
  );
}
