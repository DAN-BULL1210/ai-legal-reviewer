"use client";

/**
 * 利用者が入力した Anthropic APIキーを localStorage に保存・取得するフック。
 *
 * - 鍵はブラウザのローカルにのみ保存し、サーバへは送信時のヘッダーでのみ渡す。
 * - SSR では localStorage が無いため、マウント後に読み込む（loaded で判定）。
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ai-legal-reviewer:api-key";

export interface UseApiKey {
  /** 現在のAPIキー（未設定なら空文字） */
  apiKey: string;
  /** キーを保存する（空文字を渡すと削除） */
  saveApiKey: (key: string) => void;
  /** キーを削除する */
  clearApiKey: () => void;
  /** localStorage の読み込みが完了したか（ハイドレーション対策） */
  loaded: boolean;
}

export function useApiKey(): UseApiKey {
  const [apiKey, setApiKey] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setApiKey(window.localStorage.getItem(STORAGE_KEY) ?? "");
    } catch {
      // プライベートモード等で localStorage が使えない場合は無視。
    }
    setLoaded(true);
  }, []);

  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    try {
      if (trimmed) {
        window.localStorage.setItem(STORAGE_KEY, trimmed);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // 保存に失敗してもアプリは継続（メモリ上の state は反映済み）。
    }
  }, []);

  const clearApiKey = useCallback(() => {
    saveApiKey("");
  }, [saveApiKey]);

  return { apiKey, saveApiKey, clearApiKey, loaded };
}
