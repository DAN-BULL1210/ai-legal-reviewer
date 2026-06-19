"use client";

/**
 * リスク検知結果のタブ表示。
 * 「リスク概要（ダッシュボード）」と「詳細レビュー（Markdown）」をタブで切り替える。
 * ストリーミング中は詳細レビュータブに生成インジケータを表示する。
 */

import { FileText, LayoutDashboard } from "lucide-react";
import { useState } from "react";

import { ReviewReport } from "@/components/ReviewReport";
import { RiskDashboard } from "@/components/RiskDashboard";
import type { RiskSummary } from "@/lib/types";

type TabKey = "dashboard" | "report";

interface ResultTabsProps {
  summary: RiskSummary | null;
  report: string;
  streaming: boolean;
}

export function ResultTabs({ summary, report, streaming }: ResultTabsProps) {
  const [tab, setTab] = useState<TabKey>("dashboard");

  const hasDashboard = summary !== null;
  const hasReport = report.length > 0;

  // 選択中タブが未利用ならもう一方へフォールバック。
  const active: TabKey =
    tab === "dashboard"
      ? hasDashboard
        ? "dashboard"
        : "report"
      : hasReport
        ? "report"
        : "dashboard";

  return (
    <section className="flex flex-col gap-4">
      {/* タブバー（セグメント型・白黒基調） */}
      <div
        role="tablist"
        aria-label="リスク検知結果"
        className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto sm:self-start"
      >
        <TabButton
          isActive={active === "dashboard"}
          onClick={() => setTab("dashboard")}
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden />
          リスク概要
          {hasDashboard && (
            <span className="ml-1 rounded-full bg-slate-900/10 px-1.5 text-xs font-bold tabular-nums">
              {summary.clauses.length}
            </span>
          )}
        </TabButton>
        <TabButton
          isActive={active === "report"}
          onClick={() => setTab("report")}
        >
          <FileText className="h-4 w-4" aria-hidden />
          詳細レビュー
          {streaming && (
            <span
              className="ml-1 h-2 w-2 animate-pulse rounded-full bg-indigo-500"
              aria-label="生成中"
            />
          )}
        </TabButton>
      </div>

      {/* タブパネル */}
      <div>
        {active === "dashboard" && summary && (
          <RiskDashboard summary={summary} />
        )}
        {active === "report" && (
          <ReviewReport report={report} streaming={streaming} />
        )}
      </div>
    </section>
  );
}

function TabButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
        isActive
          ? "bg-neutral-900 text-white shadow-sm"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
