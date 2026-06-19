"use client";

/**
 * アプリのブランドロゴ（ヘッダー用）。
 * 左に丸型アイコン画像（public/danbull-icon_2.jpg）、右に「LegaBull Sniffer」を並べる。
 *
 * 画像が未配置・読み込み失敗の場合は犬アイコン（lucide Dog）へ自動フォールバックし、
 * ヘッダーが壊れないようにする。画像を配置すれば自動で本物の画像に切り替わる。
 */

import { Dog } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = "" }: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {imageFailed ? (
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black ring-1 ring-white/20">
          <Dog className="h-7 w-7 text-white" strokeWidth={1.5} aria-hidden />
        </span>
      ) : (
        <Image
          src="/danbull-icon.png"
          alt="LegaBull Sniffer ロゴ"
          width={48}
          height={48}
          priority
          onError={() => setImageFailed(true)}
          className="h-12 w-12 shrink-0 rounded-full bg-black object-contain object-center ring-1 ring-white/20"
        />
      )}
      <span className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
        LegaBull Sniffer
      </span>
    </div>
  );
}
