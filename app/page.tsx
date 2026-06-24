import HabitList from "@/components/HabitList";
import HabitHeatmap from "@/components/HabitHeatmap";
import WeightChart from "@/components/WeightChart";
import AiCoach from "@/components/AiCoach";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      {/* ヘッダー */}
      <header>
        <h1 className="text-3xl font-bold text-indigo-700">AIコーチ習慣トラッカー</h1>
        <p className="mt-1 text-sm text-gray-500">毎日の習慣を記録して、AIコーチに励ましてもらおう</p>
      </header>

      {/* 習慣リストセクション */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">習慣リスト</h2>
          <HabitList />
        </div>
        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-700">年間達成ヒートマップ</h3>
          <HabitHeatmap />
        </div>
      </section>

      {/* 体重セクション */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">体重の記録</h2>
        <WeightChart />
      </section>

      {/* AIコーチセクション */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">AIコーチに相談</h2>
        <AiCoach />
      </section>
    </div>
  );
}
