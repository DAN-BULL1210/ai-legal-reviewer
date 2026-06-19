"use client";

/**
 * 詳細レビュー（Markdown）の表示。
 * ストリーミング中はテキスト末尾に点滅カーソルを出し、生成中であることを示す。
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReviewReportProps {
  /** 表示する Markdown 本文 */
  report: string;
  /** ストリーミング継続中か（カーソル表示の制御） */
  streaming: boolean;
}

export function ReviewReport({ report, streaming }: ReviewReportProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">詳細レビュー</h2>
      <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20 prose-h2:text-lg prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed prose-pre:bg-slate-900">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
        {streaming && (
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-indigo-500 align-text-bottom" />
        )}
      </div>
    </section>
  );
}
