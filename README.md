# AI Legal Reviewer（契約書リスク自動レビュー）

契約書や規約のテキストから **リスクを自動検知** し、危険度スコアと条項別の改善案を提示する AI 法務レビュー支援ツールです。レビューの長文は **ストリーミング表示**、ダッシュボードの数値は **フロントで安全にパース** する構成になっています。

## 主な機能

- **契約書テキスト＋契約種別**（NDA・業務委託・利用規約 など）の入力
- **危険度スコア・リスクレベル・条項別リスク**のダッシュボード表示
- **条項別のリスク解説と改善案（修正文例）** を Markdown でストリーミング表示
- 入力検証／APIエラー分類／キャンセルに対応した堅牢なエラーハンドリング

## 技術スタック

| 分類 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 14（App Router） / TypeScript |
| スタイリング | Tailwind CSS / @tailwindcss/typography |
| Markdown | react-markdown + remark-gfm |
| AI | Anthropic SDK（`@anthropic-ai/sdk`）, モデル `claude-sonnet-4-6` |
| アイコン | lucide-react |

## アーキテクチャ

```
src/
├── app/
│   ├── api/review/route.ts   # ストリーミングAPI（client.messages.stream）
│   ├── layout.tsx            # ルートレイアウト / メタデータ
│   └── page.tsx              # トップページ（2カラム構成）
├── components/
│   ├── ReviewForm.tsx        # 入力フォーム（文字数検証・実行/停止）
│   ├── RiskDashboard.tsx     # スコアゲージ・条項別リスク一覧
│   └── ReviewReport.tsx      # Markdownストリーミング表示
├── hooks/
│   └── useLegalReview.ts     # fetchストリーム受信・状態管理
└── lib/
    ├── anthropic.ts          # クライアント生成（遅延初期化）
    ├── constants.ts          # モデルID・契約種別・ストリームマーカー
    ├── parseRiskSummary.ts   # サマリーJSONの安全パース
    ├── prompt.ts             # システム/ユーザープロンプト生成
    ├── severity.ts           # 深刻度の配色・ラベル
    └── types.ts              # ドメイン型定義
```

### ストリーミング・プロトコル

単一のストリームで「ダッシュボード用の数値」と「長文レビュー」を両立させるため、モデルには次の形式で出力させます。

```
@@SUMMARY@@
{ "overallScore": 72, "riskLevel": "high", "headline": "...", "clauses": [...] }
@@REPORT@@
## 総評
...（Markdown の詳細レビュー）...
```

クライアントはマーカーで分割し、`@@SUMMARY@@`〜`@@REPORT@@` 間の JSON を `try/catch` と型ガードで安全にパースしてダッシュボードへ、`@@REPORT@@` 以降を react-markdown でストリーミング表示します。JSON が破損していても UI はクラッシュしません。

## セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定（.env.example を .env.local にコピーしてキーを設定）
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local

# 3. 開発サーバー起動
npm run dev                  # http://localhost:3000
```

## 主要コマンド

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド確認（型・ビルドエラーの検査） |
| `npm run lint` | 静的解析（型・構文チェック） |

> ⚠️ 本ツールの出力は AI による参考情報であり、法的助言ではありません。重要な判断は必ず専門家にご相談ください。
