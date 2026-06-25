"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export default function AuthButton() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) return null;

  // ── ログイン済み ─────────────────────────────────────────
  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500 truncate max-w-[180px]">{user.email}</span>
        <button
          onClick={() => getSupabase()?.auth.signOut()}
          className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
        >
          ログアウト
        </button>
      </div>
    );
  }

  // ── マジックリンク送信済み ───────────────────────────────
  if (sent) {
    return (
      <p className="text-sm text-green-600">
        {email} にログインリンクを送りました。メールを確認してください。
      </p>
    );
  }

  // ── 未ログイン・フォーム非表示 ──────────────────────────
  if (!open) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">ゲストモード（localStorage保存）</span>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          ログインして同期
        </button>
      </div>
    );
  }

  // ── ログインフォーム ─────────────────────────────────────
  async function handleMagicLink() {
    if (!email) return;
    await getSupabase()?.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSent(true);
  }

  function handleGoogle() {
    getSupabase()?.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
        placeholder="メールアドレス"
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
      />
      <button
        onClick={handleMagicLink}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        メールでログイン
      </button>
      <button
        onClick={handleGoogle}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Googleでログイン
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        キャンセル
      </button>
    </div>
  );
}
