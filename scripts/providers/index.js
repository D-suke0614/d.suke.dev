const ZennProvider = require('./zenn-provider');
const NoteProvider = require('./note-provider');
const QiitaProvider = require('./qiita-provider');

/**
 * 外部記事プロバイダー管理クラス
 * 環境変数から設定を読み込み、各プロバイダーを初期化・管理する
 */
class ProviderManager {
  constructor(isDev = false) {
    this.isDev = false;
    // this.isDev = isDev;
    this.providers = [];
    this.initializeProviders();
  }

  /**
   * 環境変数から設定を読み込み、プロバイダーを初期化
   */
  initializeProviders() {
    // 共通設定
    const commonConfig = {
      useCache: process.env.CACHE_EXTERNAL_ARTICLES !== 'false',
      cacheHours: parseInt(process.env.CACHE_DURATION_HOURS) || 24,
    };

    // 開発環境では外部記事取得を無効化（高速起動のため）
    const externalEnabled =
      !this.isDev && process.env.ENABLE_EXTERNAL_ARTICLES !== 'false';
    // const externalEnabled =
    //   !this.isDev && process.env.ENABLE_EXTERNAL_ARTICLES !== 'false';

    console.log(`External articles this.isDev: ${this.isDev}`);
    console.log(`External articles process.env.ENABLE_EXTERNAL_ARTICLES !== 'false': ${process.env.ENABLE_EXTERNAL_ARTICLES !== 'false'}`);
    console.log(`External articles externalEnabled: ${externalEnabled}`);

    // Zennプロバイダー
    const zennConfig = {
      ...commonConfig,
      enabled: externalEnabled && Boolean(process.env.ZENN_USERNAME),
      username: process.env.ZENN_USERNAME || '',
    };
    this.providers.push(new ZennProvider(zennConfig));

    // Noteプロバイダー
    const noteConfig = {
      ...commonConfig,
      enabled: externalEnabled && Boolean(process.env.NOTE_USERNAME),
      username: process.env.NOTE_USERNAME || '',
    };
    this.providers.push(new NoteProvider(noteConfig));

    // Qiitaプロバイダー
    const qiitaConfig = {
      ...commonConfig,
      enabled: externalEnabled && Boolean(process.env.QIITA_USER_ID),
      username: process.env.QIITA_USER_ID || '',
    };
    this.providers.push(new QiitaProvider(qiitaConfig));

    this.logProviderStatus();
  }

  /**
   * プロバイダーの状態をログ出力
   */
  logProviderStatus() {
    console.log('🔧 External Article Providers Status:');
    this.providers.forEach((provider) => {
      const status = provider.isEnabled() ? '✅ Enabled' : '⚠️  Disabled';
      const reason =
        !provider.isEnabled() && provider.config.username
          ? '(environment disabled)'
          : !provider.config.username
            ? '(username not configured)'
            : '';
      console.log(`   ${provider.name}: ${status} ${reason}`);
    });
  }

  /**
   * 全プロバイダーから記事を取得
   * @returns {Promise<Array>} 全外部記事の配列
   */
  async fetchAllArticles() {
    if (this.isDev) {
      console.log('⚡ Development mode: Skipping external articles for faster startup');
      return [];
    }

    const enabledProviders = this.providers.filter((provider) => provider.isEnabled());

    if (enabledProviders.length === 0) {
      console.log('⚠️  No external article providers enabled');
      return [];
    }

    console.log(
      `🚀 Fetching articles from ${enabledProviders.length} external provider(s)...`,
    );

    // 全プロバイダーから並行で記事を取得
    const articlePromises = enabledProviders.map(async (provider) => {
      try {
        const articles = await provider.getArticles();
        return articles || [];
      } catch (error) {
        console.error(`❌ ${provider.name} provider failed:`, error.message);
        return [];
      }
    });

    try {
      const articleArrays = await Promise.all(articlePromises);
      const allArticles = articleArrays.flat();

      console.log(`✅ External articles fetched: ${allArticles.length} total`);

      // 統計情報を出力
      this.logArticleStats(allArticles);

      return allArticles;
    } catch (error) {
      console.error('❌ Failed to fetch external articles:', error.message);
      return [];
    }
  }

  /**
   * 取得した記事の統計情報をログ出力
   * @param {Array} articles - 記事配列
   */
  logArticleStats(articles) {
    const stats = articles.reduce((acc, article) => {
      acc[article.source] = (acc[article.source] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 External Articles Statistics:');
    Object.entries(stats).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} articles`);
    });
  }

  /**
   * 特定のプロバイダーを取得
   * @param {string} name - プロバイダー名
   * @returns {Object|null} プロバイダーまたはnull
   */
  getProvider(name) {
    return (
      this.providers.find(
        (provider) => provider.name.toLowerCase() === name.toLowerCase(),
      ) || null
    );
  }

  /**
   * 有効なプロバイダーの一覧を取得
   * @returns {Array} 有効なプロバイダーの配列
   */
  getEnabledProviders() {
    return this.providers.filter((provider) => provider.isEnabled());
  }

  /**
   * 新しいプロバイダーを追加（将来の拡張用）
   * @param {Object} provider - プロバイダーインスタンス
   */
  addProvider(provider) {
    if (!provider || typeof provider.getArticles !== 'function') {
      throw new Error('Invalid provider: must implement getArticles method');
    }
    this.providers.push(provider);
  }
}

module.exports = ProviderManager;
