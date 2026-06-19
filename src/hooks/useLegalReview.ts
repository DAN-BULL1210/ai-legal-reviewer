"use client";

/**
 * 法務レビューのストリーミングを扱うカスタムフック。
 *
 * - /api/review に POST し、レスポンスボディを逐次読み取る。
 * - 受信テキストを splitStream で分割し、サマリーJSONを安全にパースしてダッシュボードへ、
 *   レポート部はそのままストリーミング表示用に公開する。
 * - AbortController によりキャンセル／アンマウント時の中断に対応する。
 */

import { useCallback, useRef, useState } from "react";

import { parseRiskSummary, splitStream } from "@/lib/parseRiskSummary";
import type { ApiErrorBody, ReviewRequest, RiskSummary } from "@/lib/types";

export type ReviewStatus =
  | "idle"
  | "loading" // リクエスト送信〜最初のチャンク受信まで
  | "streaming" // 受信中
  | "done"
  | "error";

export interface UseLegalReview {
  status: ReviewStatus;
  /** ダッシュボード用サマリー（パース完了後に値が入る） */
  summary: RiskSummary | null;
  /** ストリーミング中の Markdown レポート */
  report: string;
  /** エラーメッセージ（status === "error" のとき） */
  error: string | null;
  /** レビューを開始する */
  start: (request: ReviewRequest) => Promise<void>;
  /** 進行中のレビューをキャンセルする */
  cancel: () => void;
  /** 状態を初期化する */
  reset: () => void;
}

export function useLegalReview(): UseLegalReview {
  const [status, setStatus] = useState<ReviewStatus>("idle");
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [report, setReport] = useState("");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancel();
    setStatus("idle");
    setSummary(null);
    setReport("");
    setError(null);
  }, [cancel]);

  const start = useCallback(
    async (request: ReviewRequest) => {
      // 進行中のリクエストがあれば中断してから開始。
      cancel();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setSummary(null);
      setReport("");
      setError(null);

      try {
        const response = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          // サーバはエラー時 JSON を返す。安全に読み取って表示する。
          const body = (await response.json().catch(() => null)) as
            | ApiErrorBody
            | null;
          throw new Error(
            body?.error ?? `リクエストに失敗しました（HTTP ${response.status}）。`,
          );
        }

        if (!response.body) {
          throw new Error("ストリームを取得できませんでした。");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        setStatus("streaming");

        // 逐次読み取り。チャンクごとに分割・パースして state を更新する。
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });
          const split = splitStream(accumulated);

          if (split.reportStarted) {
            const parsed = parseRiskSummary(split.summaryRaw);
            // パース成功時のみ更新（途中の壊れたJSONで上書きしない）。
            setSummary((prev) => parsed ?? prev);
            setReport(split.report);
          }
        }

        setStatus("done");
        abortRef.current = null;
      } catch (err) {
        // キャンセルはエラー扱いにしない。
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(
          err instanceof Error ? err.message : "予期しないエラーが発生しました。",
        );
        setStatus("error");
        abortRef.current = null;
      }
    },
    [cancel],
  );

  return { status, summary, report, error, start, cancel, reset };
}
