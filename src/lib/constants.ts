/**
 * アプリ全体で共有する定数の一元管理。
 *
 * モデルIDはここでのみ定義し、各所からは `MODEL_ID` を参照する。
 * 旧ID（claude-3-5-sonnet 等）は提供終了済みで 404 になるため使用しない。
 */

/** 法務レビューに使用する Anthropic モデルID。 */
export const MODEL_ID = "claude-sonnet-4-6" as const;

/** モデルへ要求する最大出力トークン数。 */
export const MAX_TOKENS = 4096;

/**
 * フッターの「応援する」ボタンのリンク先。
 * ご自身の支援ページURL（Buy Me a Coffee / GitHub Sponsors 等）に置き換えてください。
 */
export const SUPPORT_URL = "https://www.buymeacoffee.com/";

/** 入力契約書テキストの最大文字数（過大なリクエストによるコスト・遅延を防ぐ）。 */
export const MAX_CONTRACT_LENGTH = 20000;

/** 入力契約書テキストの最小文字数（解析に値する分量を担保する）。 */
export const MIN_CONTRACT_LENGTH = 20;

/**
 * ストリーム内で「ダッシュボード用JSON」と「Markdownレポート」を区切るマーカー。
 * サーバ／クライアント双方がこの定数を参照することで、プロトコルの齟齬を防ぐ。
 */
export const STREAM_MARKERS = {
  /** サマリーJSONブロックの開始位置 */
  SUMMARY: "@@SUMMARY@@",
  /** Markdownレポートの開始位置 */
  REPORT: "@@REPORT@@",
} as const;

/** 対応する契約種別の定義（value はモデルへ渡す識別子）。 */
export const CONTRACT_TYPES = [
  { value: "nda", label: "秘密保持契約（NDA）" },
  { value: "outsourcing", label: "業務委託契約" },
  { value: "terms_of_service", label: "利用規約" },
  { value: "employment", label: "雇用契約" },
  { value: "lease", label: "賃貸借契約" },
  { value: "sales", label: "売買・取引基本契約" },
  { value: "other", label: "その他（一般契約）" },
] as const;

/** 契約種別の value 型（リテラルユニオン）。 */
export type ContractTypeValue = (typeof CONTRACT_TYPES)[number]["value"];

/** value から契約種別の定義を取得する。未知の value の場合は undefined。 */
export function findContractType(value: string) {
  return CONTRACT_TYPES.find((type) => type.value === value);
}
