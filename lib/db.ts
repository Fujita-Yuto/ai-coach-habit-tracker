import { getSupabase } from "./supabase";
import type { Habit, HabitLog, WeightEntry } from "./storage";

// ── habits ───────────────────────────────────────────────

export async function dbGetHabits(userId: string): Promise<Habit[]> {
  const { data } = await getSupabase()
    .from("habits")
    .select("id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    createdAt: r.created_at as string,
  }));
}

export async function dbAddHabit(userId: string, habit: Habit): Promise<void> {
  await getSupabase().from("habits").insert({
    id: habit.id,
    user_id: userId,
    name: habit.name,
    created_at: habit.createdAt,
  });
}

export async function dbDeleteHabit(habitId: string): Promise<void> {
  await getSupabase().from("habits").delete().eq("id", habitId);
}

// ── habit_logs ───────────────────────────────────────────

export async function dbGetLogs(userId: string): Promise<HabitLog[]> {
  const { data } = await getSupabase()
    .from("habit_logs")
    .select("habit_id, date, done")
    .eq("user_id", userId);
  return (data ?? []).map((r) => ({
    habitId: r.habit_id as string,
    date: r.date as string,
    done: r.done as boolean,
  }));
}

export async function dbToggleLog(
  userId: string,
  habitId: string,
  date: string
): Promise<boolean> {
  const sb = getSupabase();
  const { data } = await sb
    .from("habit_logs")
    .select("id, done")
    .eq("habit_id", habitId)
    .eq("date", date)
    .maybeSingle();

  if (data) {
    await sb.from("habit_logs").update({ done: !data.done }).eq("id", data.id);
    return !(data.done as boolean);
  } else {
    await sb
      .from("habit_logs")
      .insert({ user_id: userId, habit_id: habitId, date, done: true });
    return true;
  }
}

// ── weights ──────────────────────────────────────────────

export async function dbGetWeights(userId: string): Promise<WeightEntry[]> {
  const { data } = await getSupabase()
    .from("weights")
    .select("date, weight_kg")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  return (data ?? []).map((r) => ({
    date: r.date as string,
    weightKg: Number(r.weight_kg),
  }));
}

export async function dbUpsertWeight(
  userId: string,
  entry: WeightEntry
): Promise<void> {
  await getSupabase()
    .from("weights")
    .upsert(
      { user_id: userId, date: entry.date, weight_kg: entry.weightKg },
      { onConflict: "user_id,date" }
    );
}

export async function dbDeleteWeight(
  userId: string,
  date: string
): Promise<void> {
  await getSupabase()
    .from("weights")
    .delete()
    .eq("user_id", userId)
    .eq("date", date);
}
