# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 必ず日本語で入力すること
- コードの修正を行った場合には、修正後にプロジェクトがビルドできることを確認すること
- 実装計画書などのドキュメントはチェックできる形式で.mdファイルにて作成すること

## プロジェクト概要

このプロジェクトは、Next.js 15.2.2、React 19、TypeScriptを使用したポートフォリオサイト（d.suke.dev）です。エッジランタイムに対応しており、ブログ機能、テーマ切り替え機能、スキルや作品紹介ページを含みます。

## 実装方針

- フェーズ別実装：実装計画書に従って段階的に実装し実装が完了したものにはチェックをつける

## 開発コマンド

### 基本的なコマンド

- `npm run dev` - 開発サーバーの起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーの起動

### コード品質管理

- `npm run lint` - 全リントチェック（ESLint + Prettier）
- `npm run lint:eslint` - ESLintチェック
- `npm run lint:prettier` - Prettierチェック
- `npm run fix` - 自動修正（Prettier → ESLint）
- `npm run fix:prettier` - Prettierで自動修正
- `npm run fix:eslint` - ESLintで自動修正

## アーキテクチャ

### ディレクトリ構造

```
src/app/
├── (page.tsx)                 # ホームページ
├── about/                     # 自己紹介ページ
├── blog/                      # ブログ機能
│   ├── [slug]/               # 動的ブログ記事ページ
│   │   ├── BlogPostClient.tsx # クライアントサイド記事コンポーネント
│   │   └── page.tsx          # サーバーサイド記事ページ
│   └── page.tsx              # ブログ一覧ページ
├── skills/                    # スキル紹介ページ
├── works/                     # 作品紹介ページ
├── components/                # 共通コンポーネント
│   ├── footer/               # フッター
│   ├── header/               # ヘッダー
│   ├── mainContentWrapper/    # メインコンテンツラッパー
│   ├── themeProvider/        # テーマプロバイダー
│   └── themeToggle/          # テーマ切り替えボタン
├── content/blog/              # Markdownブログ記事
├── lib/                       # ユーティリティ関数
│   └── blog.ts               # ブログ記事処理
└── api/posts/                 # ブログ記事API（Edge Runtime）
```

### 主要な技術仕様

#### ブログシステム

- Markdownファイル（`src/app/content/blog/`）をgray-matterで処理
- APIエンドポイント（`/api/posts`）でブログ記事一覧を配信
- Edge Runtimeで動作するAPI
- 動的ルーティング（`/blog/[slug]`）

#### テーマシステム

- `next-themes`を使用したダークモード対応
- システム設定の自動検出
- ThemeProviderによるアプリケーション全体の状態管理

#### スタイリング

- CSS Modulesを使用
- コンポーネントごとの独立したスタイル管理
- レスポンシブデザイン対応

## 開発時の注意点

### パスエイリアス

- `@/*` → `./src/*`のエイリアス設定

### リンター設定

- ESLintとPrettierの連携設定
- TypeScript対応
- Next.js推奨設定を適用
- Huskyとlint-stagedによるコミット時の自動チェック

### エッジランタイム対応

- API RouteはEdge Runtimeで動作
- Node.js固有のAPIは使用不可
- ファイルシステムアクセスはサーバーサイドのみ

### ブログ記事の作成

- `src/app/content/blog/`にMarkdownファイルを配置
- frontmatterに`title`, `date`, `category`, `excerpt`を記述
- 記事のslugはファイル名から自動生成

## Gitワークフロー

### ブランチ戦略

- **メインブランチ（main）**: 安定版コード、直接コミット禁止
- **フィーチャーブランチ**: 機能開発用、命名規則 `feature/機能名`
- **リファクタリングブランチ**: リファクタリング用、命名規則 `refactor/機能名`
- **必須手順**: フィーチャーブランチ or リファクタリングブランチ → プルリクエスト → レビュー → マージ

### 実装手順

1. **ブランチ作成**: `git checkout -b feature/フェーズ名-機能名` or `git checkout -b refactor/フェーズ名-リファクタ名`
2. **機能実装**: 段階的に実装、適宜コミット
3. **品質チェック**: `npm run lint` + `npx tsc --noEmit`
4. **最終コミット**: 機能完了時に統括コミット
5. **プッシュ**: `git push -u origin ブランチ名`
6. **PR作成**: GitHub上でプルリクエスト作成
7. **マージ**: レビュー後にメインブランチへマージ

### コミットメッセージ規約

- 日本語で簡潔に記述
- 機能追加: "追加: 機能名"
- 修正: "修正: 対象"
- フェーズ完了: "フェーズX: 機能名の実装"
