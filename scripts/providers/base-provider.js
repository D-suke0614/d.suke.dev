/**
 * 外部記事プロバイダーの基底クラス
 * 新しいサイト対応時はこのクラスを継承して実装する
 */
class BaseProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.cache = new Map();
    this.cacheExpiry = config.cacheHours
      ? config.cacheHours * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000; // デフォルト24時間
  }

  /**
   * 記事一覧を取得する（サブクラスで実装必須）
   * @returns {Promise<Array>} 記事データの配列
   */
  async fetchArticles() {
    throw new Error(`fetchArticles method must be implemented in ${this.name} provider`);
  }

  /**
   * 生データを統一フォーマットに変換する（サブクラスで実装必須）
   * @param {Object} rawData - 生データ
   * @returns {Object} 統一フォーマットの記事データ
   */
  transformArticle(_rawData) {
    throw new Error(
      `transformArticle method must be implemented in ${this.name} provider`,
    );
  }

  /**
   * プロバイダーが有効かどうかを判定
   * @returns {boolean} 有効かどうか
   */
  isEnabled() {
    return Boolean(this.config.enabled && this.config.username);
  }

  /**
   * キャッシュからデータを取得
   * @param {string} key - キャッシュキー
   * @returns {Object|null} キャッシュされたデータまたはnull
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * データをキャッシュに保存
   * @param {string} key - キャッシュキー
   * @param {Object} data - 保存するデータ
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheExpiry,
    });
  }

  /**
   * HTTP リクエストのエラーハンドリング
   * @param {Error} error - エラーオブジェクト
   * @param {string} context - エラーのコンテキスト
   */
  handleError(error, context = '') {
    console.error(
      `❌ ${this.name} Provider Error${context ? ` (${context})` : ''}:`,
      error.message,
    );

    // レート制限エラーの特別処理
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      console.warn(`⚠️  ${this.name}: Rate limit detected. Skipping this fetch.`);
    }

    return [];
  }

  /**
   * スリープ処理（レート制限対策）
   * @param {number} ms - 待機時間（ミリ秒）
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * プロバイダーから記事を取得する（メイン処理）
   * @returns {Promise<Array>} 統一フォーマットの記事配列
   */
  async getArticles() {
    if (!this.isEnabled()) {
      console.log(`⚡ ${this.name}: Disabled or not configured`);
      return [];
    }

    const cacheKey = `articles_${this.config.username}`;

    // キャッシュから取得を試行
    if (this.config.useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`💾 ${this.name}: Using cached data (${cached.length} articles)`);
        return cached;
      }
    }

    try {
      console.log(`🔄 ${this.name}: Fetching articles for ${this.config.username}...`);

      // 生データ取得
      const rawArticles = await this.fetchArticles();

      // 統一フォーマットに変換
      const transformedArticles = rawArticles.map((article) =>
        this.transformArticle(article),
      );

      // キャッシュに保存
      if (this.config.useCache) {
        this.setCache(cacheKey, transformedArticles);
      }

      console.log(
        `✅ ${this.name}: Successfully fetched ${transformedArticles.length} articles`,
      );
      return transformedArticles;
    } catch (error) {
      return this.handleError(error, 'getArticles');
    }
  }
}

module.exports = BaseProvider;
