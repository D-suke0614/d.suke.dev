# Cloudflare Pages対応 & 外部記事統合計画

## プロジェクト概要

Next.js 15.2.2のポートフォリオサイト（d.suke.dev）をCloudflare Pagesにデプロイする際のEdge Runtime対応と、将来的なZenn/Note記事統合機能の実装計画。

## 問題の背景

現在のブログシステムは、APIルート（`/api/posts`）でEdge Runtimeを使用しているが、Node.jsの`fs`モジュールを使用しているため、Cloudflare Pagesでデプロイ時にエラーが発生する。

## 解決策の概要

1. **Phase 1**: ビルド時静的生成によるEdge Runtime対応
2. **Phase 2**: 外部記事（Zenn/Note）統合機能の追加

---

## Phase 1: 基本Edge Runtime対応

### 1. 統合ブログデータ構造の設計

- [ ] BlogPost型を拡張
  ```typescript
  export type BlogPost = {
    slug: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    content?: string; // 外部記事の場合はundefined
    url: string; // 外部記事の場合は外部URL、内部記事の場合は内部パス
    source: 'internal' | 'zenn' | 'note';
    tags?: string[];
  };
  ```

### 2. ビルド時データ生成スクリプト作成

- [ ] `scripts/generate-blog-data.js`を作成
- [ ] 内部Markdownファイル読み込み機能
- [ ] タイムスタンプ順ソート機能
- [ ] `public/blog-data.json`出力機能
- [ ] 環境変数による開発/本番モード切り替え

### 3. package.json修正

- [ ] 開発用スクリプト追加
  ```json
  "dev": "npm run generate-blog-data:dev && next dev"
  ```
- [ ] ビルド用スクリプト修正
  ```json
  "build": "npm run generate-blog-data:prod && next build"
  ```
- [ ] データ生成スクリプト追加
  ```json
  "generate-blog-data:dev": "node scripts/generate-blog-data.js --dev",
  "generate-blog-data:prod": "node scripts/generate-blog-data.js --prod"
  ```

### 4. API Routes削除

- [ ] `src/app/api/posts/route.ts`を削除

### 5. lib/blog.ts修正

- [ ] サーバーサイド専用関数として残す
- [ ] ビルド時データ生成で使用

### 6. ブログ一覧ページ修正

- [ ] `src/app/blog/page.tsx`を修正
- [ ] `/api/posts`から`/blog-data.json`へ変更
- [ ] 記事ソース別アイコン表示準備

### 7. ブログ詳細ページ修正

- [ ] `src/app/blog/[slug]/page.tsx`を修正
- [ ] `generateStaticParams`を静的データベースに変更
- [ ] 静的データからの記事取得に変更

---

## Phase 2: 外部記事統合機能

### 1. 環境変数設定

- [ ] `.env.local`にZenn/Noteユーザー名設定
- [ ] `.env.example`作成

### 2. 外部API統合機能

- [ ] Zenn API (`https://zenn.dev/api/articles?username=USERNAME`) 連携
- [ ] Note RSS/Atom フィード連携
- [ ] エラーハンドリング実装
- [ ] レート制限対応

### 3. データ生成スクリプト拡張

- [ ] 外部記事取得機能追加
- [ ] 統合データソート機能
- [ ] キャッシュ機能実装

### 4. フロントエンド機能拡張

- [ ] 記事ソース別アイコン表示
- [ ] 外部記事の新規タブ表示
- [ ] フィルタリング機能拡張（内部/Zenn/Note）
- [ ] 詳細ページの外部記事リダイレクト

### 5. UI/UX改善

- [ ] 記事ソース別のデザイン差別化
- [ ] 外部記事プレビュー機能
- [ ] タグ機能実装

---

## 技術仕様

### 環境別動作

- **開発環境**: 内部記事のみ、高速起動
- **本番環境**: 外部記事も含む完全機能

### キャッシュ戦略

- ビルド時のデータ生成
- 開発時の差分更新
- 外部API取得結果のキャッシュ

### パフォーマンス最適化

- 静的生成によるCDN配信
- 画像最適化
- バンドルサイズ最適化

---

## テスト計画

### Phase 1テスト

- [ ] ローカル開発環境での動作確認
- [ ] ビルド成功確認
- [ ] Cloudflare Pagesデプロイ確認
- [ ] 既存ブログ機能の動作確認

### Phase 2テスト

- [ ] 外部記事取得テスト
- [ ] 統合表示テスト
- [ ] パフォーマンステスト
- [ ] エラーハンドリングテスト

---

## デプロイ手順

### Cloudflare Pages設定

1. [ ] ビルドコマンド: `npm run build`
2. [ ] 出力ディレクトリ: `out` or `.next`
3. [ ] 環境変数設定（Phase 2）

### 完了条件

- [ ] ローカル開発環境が正常動作
- [ ] Cloudflare Pagesでデプロイ成功
- [ ] 全てのブログ機能が正常動作
- [ ] 外部記事統合機能が正常動作（Phase 2）

---

## 進捗管理

### Phase 1進捗

- 開始日:
- 完了予定日:
- 実際の完了日:

### Phase 2進捗

- 開始日:
- 完了予定日:
- 実際の完了日:

---

## 注意事項

- Edge Runtime環境ではNode.js APIが使用不可
- 外部API取得時のレート制限に注意
- キャッシュ戦略の適切な実装が必要
- 開発体験を損なわないよう配慮

---

## 関連リンク

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [Zenn API](https://zenn.dev/zenn/articles/zenn-feed-rss)
