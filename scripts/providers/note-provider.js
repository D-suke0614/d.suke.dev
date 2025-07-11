const BaseProvider = require('./base-provider');

/**
 * Note記事プロバイダー
 * Note RSS フィード (https://note.com/USERNAME/rss) から記事を取得
 */
class NoteProvider extends BaseProvider {
  constructor(config) {
    super('Note', config);
    this.rssEndpoint = `https://note.com/${this.config.username}/rss`;
  }

  /**
   * Note RSSフィードから記事一覧を取得
   * @returns {Promise<Array>} Note記事データの配列
   */
  async fetchArticles() {
    try {
      // Node.js環境でfetchが使えない場合の対処
      let fetch;
      try {
        fetch = (await import('node-fetch')).default;
      } catch {
        // Node.js 18以降では標準でfetchが使える
        fetch = globalThis.fetch;
      }

      const response = await fetch(this.rssEndpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogDataGenerator/1.0)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        timeout: 10000, // 10秒タイムアウト
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (response.status === 404) {
          throw new Error(
            `Note user "${this.config.username}" not found or RSS feed not available`,
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();

      // XMLをパースして記事データを抽出
      return this.parseRSSFeed(xmlText);
    } catch (error) {
      throw new Error(`Failed to fetch from Note RSS: ${error.message}`);
    }
  }

  /**
   * RSS XMLをパースして記事データを抽出
   * @param {string} xmlText - RSS XML文字列
   * @returns {Array} 記事データの配列
   */
  parseRSSFeed(xmlText) {
    // 簡易的なXMLパーサー（本格的にはxml2jsなどを使うが、依存関係を最小化）
    const articles = [];

    // <item>タグで記事を分割
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];

      try {
        const article = this.parseRSSItem(itemContent);
        if (article) {
          articles.push(article);
        }
      } catch (error) {
        console.warn(`⚠️  Note: Failed to parse RSS item: ${error.message}`);
        continue;
      }
    }

    return articles;
  }

  /**
   * RSS itemをパースして記事データを抽出
   * @param {string} itemContent - RSS item内容
   * @returns {Object|null} 記事データまたはnull
   */
  parseRSSItem(itemContent) {
    // XMLタグから値を抽出するヘルパー関数
    const extractTag = (tagName, content) => {
      const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
      const match = content.match(regex);
      return match ? match[1].trim() : '';
    };

    // CDATAを処理するヘルパー関数
    const cleanCDATA = (text) => {
      return text.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
    };

    const title = cleanCDATA(extractTag('title', itemContent));
    const link = extractTag('link', itemContent);
    const pubDate = extractTag('pubDate', itemContent);
    const description = cleanCDATA(extractTag('description', itemContent));

    if (!title || !link) {
      return null;
    }

    // Note記事のslugを抽出（URLから）
    const urlMatch = link.match(/\/n\/([a-zA-Z0-9_-]+)$/);
    const slug = urlMatch ? urlMatch[1] : link.split('/').pop() || `note-${Date.now()}`;

    return {
      title,
      link,
      pubDate,
      description,
      slug,
    };
  }

  /**
   * Note記事データを統一フォーマットに変換
   * @param {Object} article - Note記事データ
   * @returns {Object} 統一フォーマットの記事データ
   */
  transformArticle(article) {
    // 日付の正規化
    let publishedAt;
    try {
      publishedAt = new Date(article.pubDate);
      // 無効な日付の場合は現在日時を使用
      if (isNaN(publishedAt.getTime())) {
        publishedAt = new Date();
      }
    } catch {
      publishedAt = new Date();
    }

    // 抜粋文を作成（descriptionから）
    let excerpt = article.description || article.title;
    if (excerpt.length > 200) {
      excerpt = excerpt.substring(0, 197) + '...';
    }

    // HTMLタグを除去
    excerpt = excerpt.replace(/<[^>]*>/g, '').trim();

    // カテゴリーの決定（タイトルと説明から推測）
    const category = this.determineCategory(article.title, article.description);

    return {
      slug: `note-${article.slug}`, // 重複回避のためプレフィックスを付与
      title: article.title,
      date: publishedAt.toString(),
      category,
      excerpt,
      content: undefined, // 外部記事なので内容は含めない
      url: article.link,
      source: 'note',
      tags: [], // NoteのRSSではタグ情報が取得できないため空配列
    };
  }

  /**
   * タイトルと説明からカテゴリーを推測
   * @param {string} title - 記事タイトル
   * @param {string} description - 記事説明
   * @returns {string} カテゴリー ('tech' or 'life')
   */
  determineCategory(title, description) {
    const techKeywords = [
      'プログラミング',
      'エンジニア',
      'コード',
      '開発',
      'システム',
      'JavaScript',
      'TypeScript',
      'React',
      'Vue',
      'Angular',
      'Node.js',
      'Python',
      'Java',
      'Go',
      'PHP',
      'Ruby',
      'フロントエンド',
      'バックエンド',
      'API',
      'データベース',
      'AWS',
      'GCP',
      'Azure',
      'Docker',
      'Kubernetes',
      'GitHub',
      'Git',
      'CI/CD',
      'DevOps',
      '技術',
      'IT',
      'アプリ',
      'ウェブ',
      'サイト',
    ];

    const text = `${title} ${description}`.toLowerCase();

    // テック系キーワードが含まれている場合は 'tech'
    const hasTechKeyword = techKeywords.some((keyword) =>
      text.includes(keyword.toLowerCase()),
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

module.exports = NoteProvider;
