/**
 * 深刻度・リスクレベルの表示用メタ情報（ラベルと配色）。
 * UIコンポーネント間で配色を統一するために一元管理する。
 */

import type { RiskLevel, Severity } from "./types";

interface SeverityMeta {
  /** 日本語ラベル */
  label: string;
  /** バッジ用の Tailwind クラス（文字色・背景・枠線） */
  badgeClass: string;
  /** ゲージ／バー用の塗り色クラス */
  barClass: string;
  /** スコア数値などの文字色クラス */
  textClass: string;
}

const META: Record<Severity, SeverityMeta> = {
  low: {
    label: "低",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barClass: "bg-emerald-500",
    textClass: "text-emerald-600",
  },
  medium: {
    label: "中",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    barClass: "bg-amber-500",
    textClass: "text-amber-600",
  },
  high: {
    label: "高",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    barClass: "bg-orange-500",
    textClass: "text-orange-600",
  },
  critical: {
    label: "重大",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    barClass: "bg-red-500",
    textClass: "text-red-600",
  },
};

/** Severity の表示メタを取得する。 */
export function severityMeta(severity: Severity): SeverityMeta {
  return META[severity];
}

/** RiskLevel は Severity と同じスケールのため共通メタを流用する。 */
export function riskLevelMeta(level: RiskLevel): SeverityMeta {
  return META[level];
}

/**
 * 0〜100 の総合スコアから対応する RiskLevel を導出する。
 * モデルの riskLevel と数値が食い違った場合のフォールバックにも使える。
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}
