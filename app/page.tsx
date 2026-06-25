import HabitList from "@/components/HabitList";
import HabitHeatmap from "@/components/HabitHeatmap";
import WeightChart from "@/components/WeightChart";
import AiCoach from "@/components/AiCoach";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-10">
      {/* ヘッダー */}
      <header>
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
          AIコーチ習慣トラッカー
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          毎日の習慣を記録して、AIコーチに励ましてもらおう
        </p>
      </header>

      {/* 習慣リストセクション */}
      <section className="space-y-6">
        <div>
          <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold dark:border-gray-700 dark:text-gray-100">
            習慣リスト
          </h2>
          <HabitList />
        </div>
        <div>
          <h3 className="mb-3 text-base font-semibold text-gray-700 dark:text-gray-300">
            年間達成ヒートマップ
          </h3>
          <HabitHeatmap />
        </div>
      </section>

      {/* 体重セクション */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold dark:border-gray-700 dark:text-gray-100">
          体重の記録
        </h2>
        <WeightChart />
      </section>

      {/* AIコーチセクション */}
      <section>
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold dark:border-gray-700 dark:text-gray-100">
          AIコーチに相談
        </h2>
        <AiCoach />
      </section>
    </div>
  );
}
