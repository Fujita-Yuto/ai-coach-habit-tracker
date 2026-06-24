# AIコーチ習慣トラッカー

体重・運動・食事などの習慣を毎日記録し、AIコーチ（Gemini API）が日本語で励ましと具体的な改善提案を返すWebアプリ。

## なぜ作ったか

RIZAPテクノロジーズが手がける chocoZAP アプリの「運動・健康状態の可視化」と、RIZAPの理念「人は変われる」「結果にコミット」に着想を得て、**データの可視化 × AI(LLM)による伴走**を1つのアプリで体現することを目的として開発しました。

## 主な機能

- **習慣の管理**：習慣（名前のみ）を追加・削除
- **今日の達成チェック**：各習慣の達成可否をチェック
- **進捗の可視化**：連続達成日数（ストリーク）・直近7日の達成率
- **体重記録 ＋ グラフ**：日付つきで体重を記録し、折れ線グラフで推移を表示
- **AIコーチに相談**：Gemini APIが励まし＋具体的な改善提案を日本語で返す

## 使用技術

| 区分 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| グラフ | Recharts |
| AIコーチ | Gemini API（`gemini-2.5-flash`） |
| データ保存 | localStorage |
| デプロイ | Vercel |

## ローカル起動手順

```bash
# 1. 依存パッケージをインストール
npm install

# 2. Gemini APIキーを設定
#    プロジェクト直下に .env.local を作成し、以下を記入
#    GEMINI_API_KEY=your_api_key_here
#    （APIキーは https://aistudio.google.com/ から無料取得）

# 3. 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## デプロイ

[Vercel](https://vercel.com/) にリポジトリを連携し、環境変数 `GEMINI_API_KEY` を設定してデプロイ。
