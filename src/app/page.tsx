"use client";

/**
 * トップページ。
 * 左に入力フォーム、右にダッシュボード＋詳細レビューを配置する2カラム構成。
 * 状態管理は useLegalReview フックに集約する。
 */

import { AlertCircle, Loader2, ScrollText, Sparkles } from "lucide-react";

import { ReviewForm } from "@/components/ReviewForm";
import { ReviewReport } from "@/components/ReviewReport";
import { RiskDashboard } from "@/components/RiskDashboard";
import { useLegalReview } from "@/hooks/useLegalReview";

export default function Home() {
  const { status, summary, report, error, start, cancel } = useLegalReview();

  const isRunning = status === "loading" || status === "streaming";
  const hasResult = summary !== null || report.length > 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-indigo-600">
          <Sparkles className="h-5 w-5" aria-hidden />
          <span className="text-sm font-semibold tracking-wide">
            AI Legal Reviewer
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          契約書リスク自動レビュー
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          契約書の条文を貼り付けると、AIが条項ごとのリスクを検知し、危険度スコアと
          具体的な改善案を提示します。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* 左カラム: 入力 */}
        <div className="flex flex-col gap-4">
          <ReviewForm
            isRunning={isRunning}
            onSubmit={start}
            onCancel={cancel}
          />
          <p className="px-1 text-xs leading-relaxed text-slate-400">
            ※ 本ツールの出力はAIによる参考情報であり、法的助言ではありません。
            重要な判断は必ず専門家にご相談ください。
          </p>
        </div>

        {/* 右カラム: 結果 */}
        <div className="flex flex-col gap-6">
          {status === "error" && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">分析に失敗しました</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {status === "loading" && !hasResult && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-400 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              <p className="text-sm">AIが契約書を読み込んでいます…</p>
            </div>
          )}

          {status === "idle" && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center text-slate-400">
              <ScrollText className="h-8 w-8" aria-hidden />
              <p className="text-sm leading-relaxed">
                契約書を入力して「リスクを分析する」を押すと、
                <br />
                ここに結果が表示されます。
              </p>
            </div>
          )}

          {summary && <RiskDashboard summary={summary} />}
          {report.length > 0 && (
            <ReviewReport report={report} streaming={status === "streaming"} />
          )}
        </div>
      </div>
    </main>
  );
}
