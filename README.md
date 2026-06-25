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

| 機能               | 説明                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| 習慣の管理         | 習慣を追加・削除。ログイン時は Supabase、未ログイン時は localStorage に保存 |
| 今日の達成チェック | 各習慣にチェックを入れて今日の達成を記録                                    |
| ストリーク表示     | 今日から遡って連続達成している日数を表示（🔥）                              |
| 7日達成率          | 直近7日間の達成率(%)をリアルタイム計算・表示                                |
| 体重グラフ         | 日付つきで体重を記録し、Recharts の折れ線グラフで推移を可視化               |
| AIコーチ           | ボタン1つで Gemini API に相談。励まし・傾向・アクションを3カードで表示      |
| 認証               | メール（マジックリンク）または Google でログイン。未ログインはゲストモード   |

---

## 使用技術

| 区分           | 技術                                                       |
| -------------- | ---------------------------------------------------------- |
| フレームワーク | Next.js 16 (App Router) + TypeScript                       |
| スタイリング   | Tailwind CSS                                               |
| グラフ         | Recharts                                                   |
| AIコーチ       | Gemini API（`gemini-2.5-flash`）/ `@google/genai` SDK      |
| DB / 認証      | Supabase（PostgreSQL + Row Level Security + Auth）         |
| ゲスト保存     | localStorage（キー接頭辞: `habit-tracker:`）               |
| デプロイ       | Vercel                                                     |

> Gemini APIキー・Supabase サービスロールキーはサーバー側またはコミット外で管理し、フロントには露出しません。

---

## 環境変数

`.env.local` をプロジェクト直下に作成し、以下を設定してください。

```env
# Gemini API（サーバー側のみ使用）
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase（クライアント側で使用 ── anonキーはRLSで保護）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **注意：** `GEMINI_API_KEY` は `NEXT_PUBLIC_` を付けないことでフロントに露出しません。  
> サービスロールキーはこのアプリでは不要です。絶対にコミットしないでください。

Vercel にデプロイする場合は、Dashboard → Settings → Environment Variables に同じキーを追加してください。

---

## Supabase セットアップ

[supabase.com](https://supabase.com) で無料プロジェクトを作成後、SQL Editor で以下を実行してください。

```sql
-- habits テーブル
CREATE TABLE habits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD')
);

-- habit_logs テーブル
CREATE TABLE habit_logs (
  id       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID    NOT NULL REFERENCES habits(id)     ON DELETE CASCADE,
  date     TEXT    NOT NULL, -- "YYYY-MM-DD"
  done     BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (habit_id, date)
);

-- weights テーブル
CREATE TABLE weights (
  id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date      TEXT         NOT NULL, -- "YYYY-MM-DD"
  weight_kg NUMERIC(5,1) NOT NULL,
  UNIQUE (user_id, date)
);

-- Row Level Security（各ユーザーが自分のデータのみ操作可能）
ALTER TABLE habits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weights   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits: own rows"     ON habits     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_logs: own rows" ON habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weights: own rows"    ON weights    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

Google ログインを使う場合は、Supabase Dashboard → Authentication → Providers → Google で OAuth クライアントを設定してください。

---

## ローカル起動手順

```bash
# 1. 依存パッケージをインストール
npm install

# 2. .env.local を作成して環境変数を設定（上記参照）

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
- Supabase は anonキーのみクライアントで使用し、Row Level Security でユーザーごとにデータを分離
- サービスロールキーはアプリ内で一切使用しない
