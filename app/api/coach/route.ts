import { GoogleGenAI } from "@google/genai";

type CoachRequest = {
  weeklyCompletionRate: number;
  habits: string[];
  recentWeights: { date: string; weightKg: number }[];
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  let data: CoachRequest;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "リクエストの形式が不正です。" }, { status: 400 });
  }

  const prompt = `あなたはRIZAP流の前向きなパーソナルコーチです。
直近7日の達成率: ${data.weeklyCompletionRate}%
習慣: ${data.habits.length > 0 ? data.habits.join("、") : "（未登録）"}
体重推移（直近）: ${data.recentWeights.length > 0 ? JSON.stringify(data.recentWeights) : "（未記録）"}
励まし1〜2文と、今日からできる具体的な改善提案を1つ、合計150字程度の日本語で返してください。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return Response.json({ message: response.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AIの呼び出しに失敗しました。";
    return Response.json({ error: message }, { status: 500 });
  }
}
