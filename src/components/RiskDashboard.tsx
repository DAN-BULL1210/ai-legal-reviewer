"use client";

/**
 * リスクダッシュボード。
 * 総合危険度スコア・リスクレベル・条項別リスクの一覧を表示する。
 * 値はすべて検証済みの RiskSummary（フロントで安全パース済み）を受け取る。
 */

import { AlertTriangle, ShieldCheck } from "lucide-react";

import { riskLevelMeta, scoreToRiskLevel, severityMeta } from "@/lib/severity";
import type { RiskSummary } from "@/lib/types";

interface RiskDashboardProps {
  summary: RiskSummary;
}

/** 円形のスコアゲージ（SVG）。 */
function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const meta = riskLevelMeta(scoreToRiskLevel(score));

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-slate-100"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${meta.textClass} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold tabular-nums ${meta.textClass}`}>
          {score}
        </span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

export function RiskDashboard({ summary }: RiskDashboardProps) {
  const levelMeta = riskLevelMeta(summary.riskLevel);
  const sortedClauses = [...summary.clauses].sort((a, b) => b.score - a.score);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <ScoreGauge score={summary.overallScore} />
        <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="text-sm font-semibold text-slate-500">
              総合リスクレベル
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-bold ${levelMeta.badgeClass}`}
            >
              {levelMeta.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700">
            {summary.headline || "全体の所感を生成中です…"}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 sm:justify-start">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            検出された要注意条項: {summary.clauses.length} 件
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          条項別リスク
        </h3>
        {sortedClauses.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden />
            重大な要注意条項は検出されていません。
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sortedClauses.map((clause) => {
              const meta = severityMeta(clause.severity);
              return (
                <li
                  key={clause.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <h4 className="truncate text-sm font-semibold text-slate-800">
                          {clause.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {clause.category}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-lg font-bold tabular-nums ${meta.textClass}`}
                    >
                      {clause.score}
                    </span>
                  </div>
                  {clause.finding && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {clause.finding}
                    </p>
                  )}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${meta.barClass}`}
                      style={{ width: `${clause.score}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
