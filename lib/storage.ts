// localStorage 読み書き・集計ロジック（ステップ2以降で実装）

export type Habit = {
  id: string;
  name: string;
  createdAt: string;
};

export type HabitLog = {
  habitId: string;
  date: string;
  done: boolean;
};

export type WeightEntry = {
  date: string;
  weightKg: number;
};
