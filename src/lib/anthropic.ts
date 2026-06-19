/**
 * Anthropic クライアントの生成。
 *
 * APIキーは環境変数 `ANTHROPIC_API_KEY` から読み込む。
 * 未設定のまま起動してもアプリ全体がクラッシュしないよう、
 * クライアント生成は遅延（リクエスト時）に行い、専用エラーで通知する。
 */

import Anthropic from "@anthropic-ai/sdk";

/** APIキー未設定など、設定不備を表す専用エラー。route 側で 500 に変換する。 */
export class MissingApiKeyError extends Error {
  readonly code = "missing_api_key";
  constructor() {
    super(
      "サーバーに ANTHROPIC_API_KEY が設定されていません。環境変数を確認してください。",
    );
    this.name = "MissingApiKeyError";
  }
}

let cachedClient: Anthropic | null = null;

/**
 * Anthropic クライアントを取得する（生成結果をキャッシュ）。
 * @throws {MissingApiKeyError} APIキーが未設定の場合
 */
export function getAnthropicClient(): Anthropic {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}
