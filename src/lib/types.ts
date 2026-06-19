/**
 * ドメイン全体で共有する型定義。
 *
 * ダッシュボードに表示する数値はモデルからJSONで受け取るため、
 * フロントで「安全にパースできる」よう厳密な型と判定単位を定義する。
 */

import type { ContractTypeValue } from "./constants";

/** リスクの深刻度。ダッシュボードの色分け・集計に用いる。 */
export type Severity = "low" | "medium" | "high" | "critical";

/** 全体の総合リスクレベル。 */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** 条項単位のリスク評価（ダッシュボードのリスト表示に使用）。 */
export interface ClauseRisk {
  /** 1始まりの通し番号 */
  id: number;
  /** 条項のタイトル（例: 秘密保持の範囲） */
  title: string;
  /** リスクのカテゴリ（例: 秘密保持 / 損害賠償 / 解除 など） */
  category: string;
  /** 深刻度 */
  severity: Severity;
  /** 0〜100 のリスクスコア（高いほど危険） */
  score: number;
  /** 何が問題か（簡潔な指摘） */
  finding: string;
}

/** ダッシュボードに表示する構造化サマリー（モデルのJSON出力を検証した結果）。 */
export interface RiskSummary {
  /** 0〜100 の総合危険度スコア */
  overallScore: number;
  /** 総合リスクレベル */
  riskLevel: RiskLevel;
  /** 全体所感（1〜2文） */
  headline: string;
  /** 条項別リスクの一覧 */
  clauses: ClauseRisk[];
}

/** API へ送信するレビュー依頼の本文。 */
export interface ReviewRequest {
  /** 契約書の本文テキスト */
  contractText: string;
  /** 契約種別 */
  contractType: ContractTypeValue;
}

/** API がエラー時に返す JSON の形。 */
export interface ApiErrorBody {
  /** ユーザー向けの日本語エラーメッセージ */
  error: string;
  /** プログラム判定用のエラーコード */
  code: string;
}
