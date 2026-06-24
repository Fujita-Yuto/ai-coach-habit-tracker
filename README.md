# AIコーチ習慣トラッカー

**CaludeCodeを使って作成した**

[![CI](https://github.com/Fujita-Yuto/ai-coach-habit-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Fujita-Yuto/ai-coach-habit-tracker/actions/workflows/ci.yml)

体重・運動・食事などの習慣を毎日記録し、AIコーチ（Gemini API）が日本語で励ましと具体的な改善提案を返すWebアプリ。

**デモ：** https://ai-coach-habit-tracker.vercel.app/

---

## なぜ作ったか

**データの可視化 × AI(LLM)による伴走**を1つのアプリで体現することを目的として開発しました。

---

## 主な機能

| 機能               | 説明                                                             |
| ------------------ | ---------------------------------------------------------------- |
| 習慣の管理         | 習慣を追加・削除。データは localStorage に永続化                 |
| 今日の達成チェック | 各習慣にチェックを入れて今日の達成を記録                         |
| ストリーク表示     | 今日から遡って連続達成している日数を表示（🔥）                   |
| 7日達成率          | 直近7日間の達成率(%)をリアルタイム計算・表示                     |
| 体重グラフ         | 日付つきで体重を記録し、Recharts の折れ線グラフで推移を可視化    |
| AIコーチ           | ボタン1つで Gemini API に相談。励まし＋改善提案を150字程度で返す |

---

## 使用技術

| 区分           | 技術                                                  |
| -------------- | ----------------------------------------------------- |
| フレームワーク | Next.js 16 (App Router) + TypeScript                  |
| スタイリング   | Tailwind CSS                                          |
| グラフ         | Recharts                                              |
| AIコーチ       | Gemini API（`gemini-2.5-flash`）/ `@google/genai` SDK |
| データ保存     | localStorage（キー接頭辞: `habit-tracker:`）          |
| デプロイ       | Vercel                                                |

> APIキーはサーバー側（Next.js Route Handler）のみで使用し、フロントには一切露出しません。

---

## ローカル起動手順

```bash
# 1. 依存パッケージをインストール
npm install

# 2. Gemini APIキーを取得・設定
#    https://aistudio.google.com/ で「Get API key」から無料発行
#    プロジェクト直下に .env.local を作成し以下を記入：
#    GEMINI_API_KEY=your_api_key_here

# 3. 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## テスト

```bash
npm test          # 全テストを1回実行
npm run test:watch  # ファイル変更を監視して自動再実行
```

`lib/storage.ts` のストリーク計算・7日達成率計算に対するユニットテストを網羅しています（境界ケース含む）。

---

## セキュリティ

- `.env.local` は `.gitignore` で除外済み（APIキーをコミットしない）
- Gemini API の呼び出しはサーバー側の `/api/coach` Route Handler のみで行う
