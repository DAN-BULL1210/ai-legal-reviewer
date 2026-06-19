/**
 * DAN-BULL ブランドロゴ。
 * 黒い円に白い線画の犬アイコン（lucide Dog）を配置し、白黒基調のデザインに合わせる。
 * 完全に同一の画像を使う場合は public/logo.png を置き、本コンポーネントを差し替える。
 */

import { Dog } from "lucide-react";

interface LogoProps {
  /** ロゴの大きさ */
  size?: "sm" | "md" | "lg";
  /** 「DAN-BULL」ワードマークを併記するか */
  showWordmark?: boolean;
  className?: string;
}

const SIZE = {
  sm: { circle: "h-9 w-9", icon: "h-5 w-5", text: "text-sm" },
  md: { circle: "h-11 w-11", icon: "h-6 w-6", text: "text-base" },
  lg: { circle: "h-14 w-14", icon: "h-8 w-8", text: "text-lg" },
} as const;

export function Logo({
  size = "md",
  showWordmark = false,
  className = "",
}: LogoProps) {
  const s = SIZE[size];
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {/* 黒円＋白線の犬。暗背景でも縁が見えるよう薄いリングを付与。 */}
      <span
        className={`inline-flex ${s.circle} shrink-0 items-center justify-center rounded-full bg-black ring-1 ring-white/20`}
      >
        <Dog className={`${s.icon} text-white`} strokeWidth={1.5} aria-hidden />
      </span>
      {showWordmark && (
        <span className={`font-extrabold tracking-tight text-white ${s.text}`}>
          DAN-BULL
        </span>
      )}
    </span>
  );
}
