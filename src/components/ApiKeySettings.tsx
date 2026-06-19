"use client";

/**
 * APIキー設定UI。ヘッダー右上の歯車ボタンとモーダルダイアログを提供する。
 * キーはブラウザのローカル（localStorage）にのみ保存される旨を明示する。
 */

import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ApiKeySettingsProps {
  /** 現在保存されているAPIキー */
  apiKey: string;
  /** キーを保存する */
  onSave: (key: string) => void;
  /** キーを削除する */
  onClear: () => void;
  /** モーダルの開閉状態（親が制御） */
  open: boolean;
  /** 開閉状態の変更要求 */
  onOpenChange: (open: boolean) => void;
}

export function ApiKeySettings({
  apiKey,
  onSave,
  onClear,
  open,
  onOpenChange,
}: ApiKeySettingsProps) {
  const [draft, setDraft] = useState(apiKey);
  const [reveal, setReveal] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const hasKey = apiKey.length > 0;

  // モーダルを開くたびに、保存済みの値で入力欄を初期化する。
  useEffect(() => {
    if (open) {
      setDraft(apiKey);
      setReveal(false);
      setJustSaved(false);
    }
  }, [open, apiKey]);

  // Escキーで閉じる。
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function handleSave() {
    onSave(draft);
    setJustSaved(true);
    window.setTimeout(() => onOpenChange(false), 600);
  }

  function handleClear() {
    onClear();
    setDraft("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-label="APIキー設定を開く"
        className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
      >
        <Settings className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">APIキー設定</span>
        <span
          className={`h-2 w-2 rounded-full ${
            hasKey ? "bg-emerald-500" : "bg-slate-300"
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="APIキー設定"
        >
          {/* 背景オーバーレイ */}
          <button
            type="button"
            aria-label="閉じる"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-slate-900/40"
          />

          {/* ダイアログ本体 */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-indigo-600" aria-hidden />
                <h2 className="text-base font-bold text-slate-900">
                  Anthropic APIキー
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="閉じる"
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type={reveal ? "text" : "password"}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="sk-ant-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 font-mono text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  aria-label={reveal ? "キーを隠す" : "キーを表示"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-600"
                >
                  {reveal ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                キーは
                <span className="font-semibold text-slate-600">
                  お使いのブラウザのローカル（localStorage）にのみ保存
                </span>
                され、レビュー実行時に通信ヘッダー経由でサーバーへ渡されます。サーバー側には保存されません。
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
                >
                  APIキーを取得
                </a>
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClear}
                disabled={!hasKey}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                削除
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={draft.trim().length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {justSaved ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <KeyRound className="h-4 w-4" aria-hidden />
                )}
                {justSaved ? "保存しました" : "保存する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
