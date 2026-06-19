/**
 * 契約書リスク分析のストリーミング API。
 *
 * POST /api/review
 *   body: { contractText: string, contractType: ContractTypeValue }
 *   res : text/plain のストリーム（@@SUMMARY@@ JSON @@REPORT@@ Markdown）
 *
 * 設計方針:
 *  - 入力検証・設定不備など「ストリーム開始前」のエラーは適切なHTTPステータス＋JSONで返す。
 *  - ストリーム開始後のエラーは、すでに200を返しているためレポート末尾に通知文を流し込む。
 *  - クライアント切断時は AbortSignal で上流リクエストもキャンセルし、無駄な課金を防ぐ。
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import {
  createAnthropicClient,
  MissingApiKeyError,
  resolveApiKey,
} from "@/lib/anthropic";
import {
  MAX_CONTRACT_LENGTH,
  MAX_TOKENS,
  MIN_CONTRACT_LENGTH,
  MODEL_ID,
  findContractType,
} from "@/lib/constants";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import type { ApiErrorBody, ReviewRequest } from "@/lib/types";

/** Anthropic SDK を使うため Node.js ランタイムを明示。 */
export const runtime = "nodejs";
/** 常に動的（キャッシュさせない）。 */
export const dynamic = "force-dynamic";

/** バリデーション失敗を表す内部エラー。 */
class ValidationError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/** JSONエラーレスポンスを生成するヘルパー。 */
function errorResponse(status: number, body: ApiErrorBody): NextResponse {
  return NextResponse.json(body, { status });
}

/** リクエストボディを検証し、正規化した ReviewRequest を返す。 */
function parseAndValidate(raw: unknown): ReviewRequest {
  if (typeof raw !== "object" || raw === null) {
    throw new ValidationError(
      "リクエスト形式が不正です。",
      "invalid_request",
    );
  }

  const { contractText, contractType } = raw as Record<string, unknown>;

  if (typeof contractText !== "string" || contractText.trim().length === 0) {
    throw new ValidationError(
      "契約書のテキストを入力してください。",
      "empty_contract",
    );
  }

  const trimmed = contractText.trim();
  if (trimmed.length < MIN_CONTRACT_LENGTH) {
    throw new ValidationError(
      `契約書のテキストが短すぎます（${MIN_CONTRACT_LENGTH}文字以上）。`,
      "contract_too_short",
    );
  }
  if (trimmed.length > MAX_CONTRACT_LENGTH) {
    throw new ValidationError(
      `契約書のテキストが長すぎます（${MAX_CONTRACT_LENGTH}文字以内）。`,
      "contract_too_long",
    );
  }

  if (typeof contractType !== "string" || !findContractType(contractType)) {
    throw new ValidationError(
      "契約種別が不正です。",
      "invalid_contract_type",
    );
  }

  return {
    contractText: trimmed,
    contractType: findContractType(contractType)!.value,
  };
}

export async function POST(request: Request): Promise<Response> {
  // 1) ボディのパースと検証
  let reviewRequest: ReviewRequest;
  try {
    const json = await request.json();
    reviewRequest = parseAndValidate(json);
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(400, { error: error.message, code: error.code });
    }
    return errorResponse(400, {
      error: "リクエストボディの解析に失敗しました。",
      code: "invalid_json",
    });
  }

  // 2) APIキーの解決（ヘッダー優先・環境変数フォールバック）とクライアント生成。
  //    キーが無いのは利用者側の設定不足のため 400 を返す。
  let client: Anthropic;
  try {
    const apiKey = resolveApiKey(request);
    client = createAnthropicClient(apiKey);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return errorResponse(400, { error: error.message, code: error.code });
    }
    return errorResponse(500, {
      error: "サーバー設定エラーが発生しました。",
      code: "server_misconfigured",
    });
  }

  // 3) ストリーミング応答の構築
  const encoder = new TextEncoder();
  const { contractText, contractType } = reviewRequest;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const messageStream = client.messages.stream(
          {
            model: MODEL_ID,
            max_tokens: MAX_TOKENS,
            system: buildSystemPrompt(),
            messages: [
              { role: "user", content: buildUserPrompt(contractType, contractText) },
            ],
          },
          // クライアントが切断したら上流リクエストも中断する。
          { signal: request.signal },
        );

        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (error) {
        // 既にヘッダ（200）送出済みのため、エラーはレポート本文へ通知する。
        controller.enqueue(encoder.encode(toStreamErrorMessage(error)));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", // 一部プロキシのバッファリングを無効化
    },
  });
}

/** ストリーム途中のエラーを、レポート末尾に差し込む日本語メッセージへ変換する。 */
function toStreamErrorMessage(error: unknown): string {
  // クライアント切断（Abort）の場合は通知不要。
  if (error instanceof Error && error.name === "AbortError") {
    return "";
  }

  // サーバ側でも原因を追えるようにログを残す。
  console.error("[/api/review] ストリーム中にエラーが発生しました:", error);

  let detail = "予期しないエラーが発生しました。時間をおいて再試行してください。";
  if (error instanceof Anthropic.APIConnectionError) {
    // ネットワーク到達不可（オフライン・DNS・プロキシ等）。
    detail =
      "AIサービスに接続できませんでした。ネットワーク接続を確認して再試行してください。";
  } else if (error instanceof Anthropic.APIError) {
    const status = error.status;
    if (status === 400 || status === 401 || status === 403) {
      // 認証・リクエスト拒否はキー不正が主因のため、設定を促す。
      detail =
        "APIキーが無効か拒否されました。設定（⚙️）で入力したキーを確認してください。";
    } else if (status === 429) {
      detail = "リクエストが集中しています。しばらく待って再試行してください。";
    } else if (status === 529) {
      detail = "AIサービスが一時的に過負荷です。時間をおいて再試行してください。";
    } else if (typeof status === "number" && status >= 500) {
      detail = "AIサービス側でエラーが発生しました。時間をおいて再試行してください。";
    } else {
      detail = "AIサービスとの通信でエラーが発生しました。";
    }
  }

  return `\n\n> ⚠️ **エラー:** ${detail}\n`;
}
