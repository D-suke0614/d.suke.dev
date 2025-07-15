const BaseProvider = require('./base-provider');

/**
 * Zenn記事プロバイダー
 * Zenn API (https://zenn.dev/api/articles?username=USERNAME) から記事を取得
 */
class ZennProvider extends BaseProvider {
  constructor(config) {
    super('Zenn', config);
    this.apiEndpoint = 'https://zenn.dev/api/articles';
  }

  /**
   * Zenn APIから記事一覧を取得
   * @returns {Promise<Array>} Zenn記事データの配列
   */
  async fetchArticles() {
    console.log('fetch zenn')
    const url = `${this.apiEndpoint}?username=${this.config.username}&order=latest`;

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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Zenn APIのレスポンス構造: { articles: [...] }
      return data.articles || [];
    } catch (error) {
      throw new Error(`Failed to fetch from Zenn API: ${error.message}`);
    }
  }

  /**
   * Zenn記事データを統一フォーマットに変換
   * @param {Object} article - Zenn記事データ
   * @returns {Object} 統一フォーマットの記事データ
   */
  transformArticle(article) {
    // Zennの記事URLを生成
    const articleUrl = `https://zenn.dev/${this.config.username}/articles/${article.slug}`;

    // 日付の正規化（ISO8601形式に変換）
    const publishedAt = new Date(article.published_at);

    // カテゴリーの決定（Zennのタグから推測）
    const category = this.determineCategory(article.topics || []);

    return {
      slug: `zenn-${article.slug}`, // 重複回避のためプレフィックスを付与
      title: article.title,
      date: publishedAt.toString(),
      category,
      excerpt:
        article.body_letters_count > 200
          ? article.emoji + ' ' + (article.title || '').substring(0, 150) + '...'
          : article.emoji + ' ' + (article.title || ''),
      content: undefined, // 外部記事なので内容は含めない
      url: articleUrl,
      source: 'zenn',
      tags: article.topics || [],
      // Zenn固有の追加情報
      likes: article.liked_count || 0,
      emoji: article.emoji || '📝',
      published: article.published,
    };
  }

  /**
   * タグからカテゴリーを推測
   * @param {Array} topics - Zennのトピック配列
   * @returns {string} カテゴリー ('tech' or 'life')
   */
  determineCategory(topics) {
    const techKeywords = [
      'javascript',
      'typescript',
      'react',
      'nextjs',
      'vue',
      'angular',
      'node',
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
    ];

    const topicNames = topics.map((topic) =>
      typeof topic === 'string' ? topic.toLowerCase() : topic.name?.toLowerCase() || '',
    );

    // テック系キーワードが含まれている場合は 'tech'
    const hasTechKeyword = topicNames.some((topic) =>
      techKeywords.some((keyword) => topic.includes(keyword)),
    );

    return hasTechKeyword ? 'tech' : 'life';
  }

  /**
   * プロバイダーが有効かどうかを判定
   * @returns {boolean} 有効かどうか
   */
  isEnabled() {
    console.log(`Checking if ZennProvider is enabled: ${this.config.enabled}`);
    console.log(`Checking if ZennProvider is username: ${this.config.username}`);
    return Boolean(
      this.config.enabled && this.config.username && this.config.username.trim() !== '',
    );
  }
}

module.exports = ZennProvider;
