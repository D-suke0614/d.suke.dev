# ブログパフォーマンス最適化実装計画

## プロジェクト概要

### 現状の問題点
- `/public/blog-data.json`による全記事データの一括取得
- 記事本文を含む不要データの転送（一覧ページで70-80%が不要データ）
- クライアントサイドでの重い処理負荷（フィルタリング、ページネーション）
- 記事数増加に伴う線形的なパフォーマンス悪化

### 改善目標
- **初期ロード時間**: 90%削減（100記事時）
- **データ転送量**: 80%削減
- **クライアントサイド処理負荷**: 70%削減
- **スケーラビリティ**: 1000記事対応

### 技術的制約
- **Cloudflare Pages Edge Runtime**: 完全対応必須
- **フロントエンド完結**: DB・バックエンドサービス不要
- **追加設定不要**: 本番環境での設定変更なし

## 技術仕様

### Edge Runtime対応
- Next.js Edge API Routesを使用
- Node.js固有APIは使用禁止
- `export const runtime = 'edge'`で実装

### データ構造設計
#### 一覧用データ (`/public/blog-posts.json`)
```json
[
  {
    "slug": "article-slug",
    "title": "記事タイトル",
    "date": "2025-01-01",
    "category": "tech",
    "excerpt": "記事の抜粋",
    "tags": ["tag1", "tag2"],
    "source": "internal",
    "url": "/blog/article-slug"
  }
]
```

#### 個別記事データ (`/public/blog-content/[slug].json`)
```json
{
  "slug": "article-slug",
  "title": "記事タイトル",
  "date": "2025-01-01",
  "category": "tech",
  "excerpt": "記事の抜粋",
  "content": "記事の本文（HTML）",
  "tags": ["tag1", "tag2"],
  "source": "internal",
  "url": "/blog/article-slug"
}
```

#### 外部記事データ（Zenn, Qiita, Note）
```json
{
  "slug": "external-article-slug",
  "title": "外部記事タイトル",
  "date": "2025-01-01",
  "category": "tech",
  "excerpt": "記事の抜粋",
  "tags": ["tag1", "tag2"],
  "source": "zenn",
  "url": "https://zenn.dev/username/articles/article-slug"
}
```

### API設計
#### `/api/posts` (Edge Runtime)
- **機能**: ページネーション対応の記事一覧取得
- **パラメータ**: `page`, `category`, `limit`, `source`
- **レスポンス**: `{posts: Post[], total: number, hasMore: boolean}`

#### `/api/posts/[slug]` (Edge Runtime)
- **機能**: 個別記事取得
- **パラメータ**: `slug`
- **レスポンス**: `Post`オブジェクト

## フェーズ別実装計画

### フェーズ1: データ構造最適化

#### 1.1 ビルド時データ生成スクリプト作成
- [ ] `scripts/generate-blog-data.ts` の作成
- [ ] Markdownファイル読み込み・変換ロジック
- [ ] 一覧用・詳細用データの分離生成
- [ ] `package.json`のbuildスクリプトに統合

#### 1.2 Edge API Routes実装
- [ ] `/src/app/api/posts/route.ts` の作成
- [ ] `/src/app/api/posts/[slug]/route.ts` の作成
- [ ] ページネーション機能の実装
- [ ] エラーハンドリングの実装

#### 1.3 データ生成の実行
- [ ] 既存Markdownファイルから新しいJSON構造を生成
- [ ] `/public/blog-posts.json` の生成
- [ ] `/public/blog-content/[slug].json` の生成

### フェーズ2: クライアントサイド最適化

#### 2.1 ブログ一覧ページ改修
- [ ] `src/app/blog/page.tsx` の改修
- [ ] 全件取得からAPI経由ページング取得に変更
- [ ] フィルタリング機能のAPI連携
- [ ] ローディング状態の改善

#### 2.2 個別記事ページ改修
- [ ] `src/app/blog/[slug]/page.tsx` の改修
- [ ] 個別API経由での記事取得
- [ ] SSG対応の維持
- [ ] エラーハンドリングの改善

#### 2.3 共通コンポーネント最適化
- [ ] `BlogPostClient.tsx` の最適化
- [ ] 不要なpropsの削除
- [ ] パフォーマンス改善

### フェーズ3: 高度な最適化

#### 3.1 キャッシュ戦略実装
- [ ] Edge API ResponseにCache-Controlヘッダー追加
- [ ] クライアントサイドキャッシュ戦略
- [ ] Cloudflare CDN最適化

#### 3.2 検索・フィルタリング最適化
- [ ] サーバーサイドでの検索処理実装
- [ ] インデックスファイル生成
- [ ] 高速検索機能の実装

#### 3.3 パフォーマンス監視
- [ ] パフォーマンス計測の実装
- [ ] 改善効果の測定
- [ ] 最適化の検証

### フェーズ4: 外部記事取得機能

#### 4.1 外部記事取得実装
- [ ] Zenn RSS Feed取得機能
- [ ] Note RSS Feed取得機能
- [ ] Qiita API v2連携
- [ ] RSS Parser実装

#### 4.2 データ統合・ソート機能
- [ ] 内部記事と外部記事の統合
- [ ] 投稿日時によるソート
- [ ] 重複記事の除去
- [ ] エラーハンドリング

#### 4.3 UI対応
- [ ] 記事ソース表示機能
- [ ] 外部記事リンク処理
- [ ] ソース別フィルタリング

### フェーズ5: 自動更新機能

#### 5.1 GitHub Actions定期実行
- [ ] `.github/workflows/scheduled-blog-update.yml` 作成
- [ ] 定期実行設定（6-12時間間隔）
- [ ] Cloudflare Pages自動デプロイ
- [ ] 実行ログ監視

#### 5.2 手動トリガー機能
- [ ] workflow_dispatch設定
- [ ] 手動実行ボタン
- [ ] 緊急更新対応

#### 5.3 Webhook連携（オプション）
- [ ] Webhook受信API実装
- [ ] 各サービス連携設定
- [ ] リアルタイム更新対応

## ファイル構造

### 新規作成ファイル
```
scripts/
├── generate-blog-data.ts          # ビルド時データ生成

src/app/api/
├── posts/
│   ├── route.ts                   # 記事一覧API (Edge Runtime)
│   └── [slug]/
│       └── route.ts               # 個別記事API (Edge Runtime)

.github/workflows/
└── scheduled-blog-update.yml      # 定期更新用GitHub Actions

public/
├── blog-posts.json                # 一覧用データ
└── blog-content/
    ├── [slug].json                # 個別記事データ
    └── ...
```

### 修正対象ファイル
```
src/app/blog/
├── page.tsx                       # 一覧ページ（API連携、外部記事対応）
└── [slug]/
    └── page.tsx                   # 個別ページ（API連携、外部記事対応）

scripts/
└── generate-blog-data.js          # 外部記事取得機能追加

package.json                       # buildスクリプトの修正
```

## 実装手順

### 開発環境での確認
1. `npm run dev` で開発サーバー起動
2. 各フェーズ完了後の動作確認
3. `npm run build` でビルド確認

### 品質管理
1. `npm run lint` でコード品質チェック
2. `npm run fix` で自動修正
3. `npx tsc --noEmit` で型チェック

### Git管理
1. 各フェーズ完了時にコミット
2. `feature/blog-performance-optimization` ブランチで作業
3. 最終的にPRでmainブランチにマージ

## 期待効果

### パフォーマンス改善
- **10記事**: 変化なし（既に最適）
- **50記事**: 50%高速化
- **100記事**: 90%高速化
- **500記事**: 95%高速化
- **1000記事**: 98%高速化

### 運用面での改善
- **開発効率**: 高速な開発サーバー
- **デプロイ**: 追加設定不要
- **運用コスト**: 変更なし
- **スケーラビリティ**: 大幅向上
- **コンテンツ管理**: 外部記事の自動取得・更新
- **更新頻度**: 6-12時間間隔での自動更新

## 注意事項

### Edge Runtime制約
- `fs`モジュール使用不可
- Node.js固有API使用不可
- 同期的なファイル読み込み不可

### Cloudflare Pages制約
- 25MBのファイルサイズ制限
- 1000ファイルの制限
- 関数実行時間制限（30秒）

### 互換性
- 既存のブログ機能は完全に維持
- URLパスは変更なし
- SEO対応は維持

## 完了条件

### 必須条件
- [ ] フェーズ1-3が完了（パフォーマンス最適化）
- [ ] 既存機能が完全に動作
- [ ] Edge Runtimeで正常動作
- [ ] Cloudflare Pagesでデプロイ可能

### 品質条件
- [ ] lint/typecheckが通過
- [ ] パフォーマンステストが通過
- [ ] 1000記事での動作確認
- [ ] モバイル環境での動作確認

### 拡張機能条件（オプション）
- [ ] フェーズ4が完了（外部記事取得）
- [ ] フェーズ5が完了（自動更新）
- [ ] 外部記事が正常に取得・表示される
- [ ] 自動更新が正常に動作する

---

**作成日**: 2025-07-15  
**最終更新**: 2025-07-15  
**担当**: Claude Code

## 更新履歴
- 2025-07-15: 初版作成（フェーズ1-3: パフォーマンス最適化）
- 2025-07-15: フェーズ4-5追加（外部記事取得・自動更新機能）