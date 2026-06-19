/**
 * フッター。開発者への応援（投げ銭）への導線を表示する。
 * リンク先は constants.ts の SUPPORT_URL で設定する。
 */

import { Coffee, Heart } from "lucide-react";

import { SUPPORT_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Coffee className="h-4 w-4 text-amber-500" aria-hidden />
          このツールが役に立ったら、開発者にコーヒーを一杯ごちそうしませんか？
        </p>

        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <Heart
            className="h-4 w-4 transition-transform group-hover:scale-125"
            fill="currentColor"
            aria-hidden
          />
          開発者を応援する
        </a>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} AI Legal Reviewer
        </p>
      </div>
    </footer>
  );
}
