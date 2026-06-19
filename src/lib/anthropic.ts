/**
 * Anthropic クライアントの生成。
 *
 * APIキーは「リクエストの x-api-key ヘッダー（利用者が画面から入力した鍵）」を最優先で使用し、
 * 無ければサーバの環境変数 `ANTHROPIC_API_KEY` にフォールバックする。
 * これにより、利用者が自分の鍵を持ち込む（BYO-key）デモ運用と、
 * サーバ共通鍵での運用の両方に対応する。
 */

import Anthropic from "@anthropic-ai/sdk";

/** APIキー未指定を表す専用エラー。route 側で適切なステータスに変換する。 */
export class MissingApiKeyError extends Error {
  readonly code = "missing_api_key";
  constructor() {
    super(
      "APIキーが設定されていません。画面右上の設定（⚙️）からAnthropicのAPIキーを入力してください。",
    );
    this.name = "MissingApiKeyError";
  }
}

/**
 * リクエストヘッダー（優先）または環境変数から APIキーを解決する。
 * @throws {MissingApiKeyError} どちらにもキーが無い場合
 */
export function resolveApiKey(request: Request): string {
  const headerKey = request.headers.get("x-api-key")?.trim();
  if (headerKey) {
    return headerKey;
  }

  const envKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (envKey) {
    return envKey;
  }

  throw new MissingApiKeyError();
}

/**
 * 指定したAPIキーで Anthropic クライアントを生成する。
 * キーはリクエストごとに異なり得るため、シングルトンにはしない。
 */
export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}
