import { GoogleGenAI, Type } from "@google/genai";

type CoachRequest = {
  weeklyCompletionRate: number;
  habits: string[];
  recentWeights: { date: string; weightKg: number }[];
};

export type CoachResponse = {
  praise: string;
  insight: string;
  action: string;
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

  const prompt = `あなたはRIZAP流の前向きなパーソナルコーチです。以下のユーザーデータを分析してください。

直近7日の達成率: ${data.weeklyCompletionRate}%
習慣: ${data.habits.length > 0 ? data.habits.join("、") : "（未登録）"}
体重推移（直近）: ${data.recentWeights.length > 0 ? JSON.stringify(data.recentWeights) : "（未記録）"}

以下の3項目を日本語で、それぞれ50〜80字程度で返してください。
- praise: ユーザーへの励まし（努力を認め、前向きな言葉で）
- insight: データから読み取れる傾向や気づき（具体的な数字・変化に言及）
- action: 今日すぐできる具体的な改善アクション1つ（動詞で始める）`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            praise:  { type: Type.STRING, description: "ユーザーへの励まし（1〜2文）" },
            insight: { type: Type.STRING, description: "データから読み取れる傾向や気づき" },
            action:  { type: Type.STRING, description: "今日すぐできる具体的な改善アクション1つ" },
          },
          required: ["praise", "insight", "action"],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? "{}") as CoachResponse;

    if (!parsed.praise || !parsed.insight || !parsed.action) {
      return Response.json(
        { error: "AIの応答が不完全でした。もう一度試してください。" },
        { status: 500 }
      );
    }

    return Response.json(parsed);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AIの呼び出しに失敗しました。";
    return Response.json({ error: message }, { status: 500 });
  }
}
