/**
 * ストリームから受信したテキストを「サマリーJSON」と「Markdownレポート」へ
 * 安全に分解・検証するユーティリティ。
 *
 * モデル出力は完全には信頼できないため、JSON.parse の失敗・型不一致・
 * 値域外（スコアが0〜100外など）をすべて吸収し、UIが落ちないようにする。
 */

import { STREAM_MARKERS } from "./constants";
import type {
  ClauseRisk,
  RiskLevel,
  RiskSummary,
  Severity,
} from "./types";

const SEVERITIES: readonly Severity[] = ["low", "medium", "high", "critical"];
const RISK_LEVELS: readonly RiskLevel[] = ["low", "medium", "high", "critical"];

/** ストリーム全体を分割した結果。 */
export interface SplitStream {
  /** サマリーJSON部分の生テキスト（未受信なら null） */
  summaryRaw: string | null;
  /** Markdownレポート部分（@@REPORT@@ 以降。未到達なら空文字） */
  report: string;
  /** @@REPORT@@ マーカーを受信済みか */
  reportStarted: boolean;
}

/**
 * 受信中の累積テキストを、サマリー部とレポート部に分割する。
 * ストリーミング途中でも安全に呼べる（マーカー未到達なら report は空）。
 */
export function splitStream(accumulated: string): SplitStream {
  const summaryIndex = accumulated.indexOf(STREAM_MARKERS.SUMMARY);
  const reportIndex = accumulated.indexOf(STREAM_MARKERS.REPORT);

  // サマリーマーカーがまだ来ていない（先頭の揺らぎ）場合も考慮し、
  // 見つからなければ先頭からをサマリー候補として扱う。
  const summaryStart =
    summaryIndex >= 0 ? summaryIndex + STREAM_MARKERS.SUMMARY.length : 0;

  if (reportIndex < 0) {
    return {
      summaryRaw: accumulated.slice(summaryStart) || null,
      report: "",
      reportStarted: false,
    };
  }

  const summaryRaw = accumulated.slice(summaryStart, reportIndex).trim();
  const report = accumulated
    .slice(reportIndex + STREAM_MARKERS.REPORT.length)
    .replace(/^\r?\n/, ""); // マーカー直後の改行を除去

  return {
    summaryRaw: summaryRaw || null,
    report,
    reportStarted: true,
  };
}

/** 任意の値が「キー文字列のオブジェクト」か判定する型ガード。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 0〜100 に丸めた整数を返す。数値でなければ fallback。 */
function clampScore(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Severity の値を検証（不正なら "medium"）。 */
function toSeverity(value: unknown): Severity {
  return SEVERITIES.includes(value as Severity)
    ? (value as Severity)
    : "medium";
}

/** RiskLevel の値を検証（不正なら "medium"）。 */
function toRiskLevel(value: unknown): RiskLevel {
  return RISK_LEVELS.includes(value as RiskLevel)
    ? (value as RiskLevel)
    : "medium";
}

/** 文字列に正規化（非文字列は fallback）。 */
function toText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** 不正な条項要素を除外しつつ ClauseRisk[] に正規化する。 */
function normalizeClauses(value: unknown): ClauseRisk[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord).map((raw, index) => ({
    id: typeof raw.id === "number" ? raw.id : index + 1,
    title: toText(raw.title, `条項 ${index + 1}`),
    category: toText(raw.category, "その他"),
    severity: toSeverity(raw.severity),
    score: clampScore(raw.score, 0),
    finding: toText(raw.finding),
  }));
}

/**
 * サマリーJSONの生テキストを安全にパースして RiskSummary を返す。
 * コードフェンスや前後ノイズを許容し、失敗時は null を返す（UIは落とさない）。
 */
export function parseRiskSummary(summaryRaw: string | null): RiskSummary | null {
  if (!summaryRaw) {
    return null;
  }

  // ```json ... ``` のようなコードフェンスを除去し、最初の { 〜 最後の } を抽出。
  const withoutFence = summaryRaw.replace(/```(?:json)?/gi, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(withoutFence.slice(start, end + 1));
  } catch {
    return null; // JSONがまだ未完成 or 破損。呼び出し側で再試行される。
  }

  if (!isRecord(parsed)) {
    return null;
  }

  return {
    overallScore: clampScore(parsed.overallScore, 0),
    riskLevel: toRiskLevel(parsed.riskLevel),
    headline: toText(parsed.headline),
    clauses: normalizeClauses(parsed.clauses),
  };
}
