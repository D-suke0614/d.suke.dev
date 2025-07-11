const BaseProvider = require('./base-provider');

/**
 * Qiita記事プロバイダー
 * Qiita API v2 (GET /api/v2/users/:user_id/items) から記事を取得
 */
class QiitaProvider extends BaseProvider {
  constructor(config) {
    super('Qiita', config);
    this.apiEndpoint = 'https://qiita.com/api/v2';
  }

  /**
   * Qiita APIから記事一覧を取得
   * @returns {Promise<Array>} Qiita記事データの配列
   */
  async fetchArticles() {
    const url = `${this.apiEndpoint}/users/${this.config.username}/items?page=1&per_page=20`;

    try {
      // Node.js環境でfetchが使えない場合の対処
      let fetch;
      try {
        fetch = (await import('node-fetch')).default;
      } catch {
        // Node.js 18以降では標準でfetchが使える
        fetch = globalThis.fetch;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogDataGenerator/1.0)',
          Accept: 'application/json',
        },
        timeout: 10000, // 10秒タイムアウト
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (response.status === 404) {
          throw new Error(`Qiita user "${this.config.username}" not found`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const articles = await response.json();

      // Qiita APIのレスポンスは配列形式
      return Array.isArray(articles) ? articles : [];
    } catch (error) {
      throw new Error(`Failed to fetch from Qiita API: ${error.message}`);
    }
  }

  /**
   * Qiita記事データを統一フォーマットに変換
   * @param {Object} article - Qiita記事データ
   * @returns {Object} 統一フォーマットの記事データ
   */
  transformArticle(article) {
    // 日付の正規化（ISO8601形式に変換）
    const createdAt = new Date(article.created_at);

    // カテゴリーの決定（Qiitaのタグから推測）
    const category = this.determineCategory(article.tags || []);

    // 抜粋文を作成
    let excerpt = article.body ? this.createExcerpt(article.body) : article.title;

    return {
      slug: `qiita-${article.id}`, // 重複回避のためプレフィックスを付与
      title: article.title,
      date: createdAt.toString(),
      category,
      excerpt,
      content: undefined, // 外部記事なので内容は含めない
      url: article.url,
      source: 'qiita',
      tags: article.tags ? article.tags.map((tag) => tag.name) : [],
      // Qiita固有の追加情報
      likes: article.likes_count || 0,
      stocks: article.stocks_count || 0,
      comments: article.comments_count || 0,
      private: article.private || false,
    };
  }

  /**
   * 本文から抜粋文を作成
   * @param {string} body - 記事本文（Markdown）
   * @returns {string} 抜粋文
   */
  createExcerpt(body) {
    if (!body) return '';

    // Markdownのヘッダー、コードブロック、リンクなどを除去
    let cleanText = body
      .replace(/^#{1,6}\s+/gm, '') // ヘッダー
      .replace(/```[\s\S]*?```/g, '') // コードブロック
      .replace(/`[^`]+`/g, '') // インラインコード
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンク
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 画像
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1') // Italic
      .replace(/^\s*[-*+]\s+/gm, '') // リスト
      .replace(/^\s*\d+\.\s+/gm, '') // 番号付きリスト
      .replace(/\n+/g, ' ') // 改行を空白に
      .trim();

    // 200文字程度に制限
    if (cleanText.length > 200) {
      cleanText = cleanText.substring(0, 197) + '...';
    }

    return cleanText || '（記事の詳細はQiitaでご覧ください）';
  }

  /**
   * タグからカテゴリーを推測
   * @param {Array} tags - Qiitaのタグ配列
   * @returns {string} カテゴリー ('tech' or 'life')
   */
  determineCategory(tags) {
    const techKeywords = [
      'javascript',
      'typescript',
      'react',
      'nextjs',
      'vue',
      'angular',
      'node',
      'nodejs',
      'python',
      'java',
      'go',
      'rust',
      'php',
      'ruby',
      'frontend',
      'backend',
      'fullstack',
      'api',
      'database',
      'sql',
      'aws',
      'gcp',
      'azure',
      'docker',
      'kubernetes',
      'github',
      'git',
      'cicd',
      'devops',
      'terraform',
      'programming',
      'development',
      'tech',
      'engineering',
      'html',
      'css',
      'sass',
      'webpack',
      'vite',
      'mysql',
      'postgresql',
      'mongodb',
      'redis',
      'linux',
      'ubuntu',
      'centos',
      'nginx',
      'apache',
    ];

    const lifeKeywords = [
      'ポエム',
      'キャリア',
      '転職',
      '働き方',
      '雑記',
      'ライフハック',
      '日記',
      'エッセイ',
      '思考',
      'チームビルディング',
      'マネジメント',
      'リーダーシップ',
    ];

    const tagNames = tags.map((tag) =>
      typeof tag === 'string' ? tag.toLowerCase() : tag.name?.toLowerCase() || '',
    );

    // ライフ系キーワードが含まれている場合は 'life' を優先
    const hasLifeKeyword = tagNames.some((tag) =>
      lifeKeywords.some((keyword) => tag.includes(keyword)),
    );

    if (hasLifeKeyword) {
      return 'life';
    }

    // テック系キーワードが含まれている場合は 'tech'
    const hasTechKeyword = tagNames.some((tag) =>
      techKeywords.some((keyword) => tag.includes(keyword)),
    );

    return hasTechKeyword ? 'tech' : 'life';
  }

  /**
   * プロバイダーが有効かどうかを判定
   * @returns {boolean} 有効かどうか
   */
  isEnabled() {
    return Boolean(
      this.config.enabled && this.config.username && this.config.username.trim() !== '',
    );
  }
}

module.exports = QiitaProvider;
