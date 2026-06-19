"use client";

/**
 * 契約書テキストと契約種別を入力するフォーム。
 * 文字数の上限/下限をリアルタイム検証し、送信可否を制御する。
 */

import { Loader2, ScanText, Square } from "lucide-react";
import { useMemo, useState } from "react";

import {
  CONTRACT_TYPES,
  MAX_CONTRACT_LENGTH,
  MIN_CONTRACT_LENGTH,
} from "@/lib/constants";
import type { ContractTypeValue } from "@/lib/constants";
import type { ReviewRequest } from "@/lib/types";

interface ReviewFormProps {
  /** レビュー実行中（送信ボタンを「停止」に切り替える） */
  isRunning: boolean;
  /** レビュー開始 */
  onSubmit: (request: ReviewRequest) => void;
  /** 実行中の停止 */
  onCancel: () => void;
}

export function ReviewForm({ isRunning, onSubmit, onCancel }: ReviewFormProps) {
  const [contractType, setContractType] = useState<ContractTypeValue>("nda");
  const [contractText, setContractText] = useState("");

  const length = contractText.trim().length;
  const tooLong = length > MAX_CONTRACT_LENGTH;
  const tooShort = length > 0 && length < MIN_CONTRACT_LENGTH;
  const canSubmit = length >= MIN_CONTRACT_LENGTH && !tooLong && !isRunning;

  const counterClass = useMemo(() => {
    if (tooLong) return "text-red-600";
    if (length > MAX_CONTRACT_LENGTH * 0.9) return "text-amber-600";
    return "text-slate-400";
  }, [length, tooLong]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ contractText: contractText.trim(), contractType });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="contractType"
          className="text-sm font-semibold text-slate-700"
        >
          契約種別
        </label>
        <select
          id="contractType"
          value={contractType}
          onChange={(e) => setContractType(e.target.value as ContractTypeValue)}
          disabled={isRunning}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
        >
          {CONTRACT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="contractText"
            className="text-sm font-semibold text-slate-700"
          >
            契約書テキスト
          </label>
          <span className={`text-xs tabular-nums ${counterClass}`}>
            {length.toLocaleString()} / {MAX_CONTRACT_LENGTH.toLocaleString()}
          </span>
        </div>
        <textarea
          id="contractText"
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
          disabled={isRunning}
          rows={12}
          placeholder="レビューしたい契約書の条文を貼り付けてください。"
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
        />
        {tooShort && (
          <p className="text-xs text-amber-600">
            {MIN_CONTRACT_LENGTH}文字以上入力してください。
          </p>
        )}
        {tooLong && (
          <p className="text-xs text-red-600">
            {MAX_CONTRACT_LENGTH.toLocaleString()}文字以内に収めてください。
          </p>
        )}
      </div>

      {isRunning ? (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Square className="h-4 w-4" aria-hidden />
          分析を停止
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ScanText className="h-4 w-4" aria-hidden />
          )}
          リスクを分析する
        </button>
      )}
    </form>
  );
}
