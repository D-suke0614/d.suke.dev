const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 環境変数の読み込み（.env.localがある場合）
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// 引数の解析
const isDev = process.argv.includes('--dev');
const isProd = process.argv.includes('--prod');

console.log(`🚀 Generating blog data (${isDev ? 'development' : 'production'} mode)...`);

// ディレクトリパス
const postsDirectory = path.join(process.cwd(), 'src/app/content/blog');
const outputPath = path.join(process.cwd(), 'public/blog-data.json');

// 内部記事の取得
function getInternalPosts() {
  try {
    if (!fs.existsSync(postsDirectory)) {
      console.warn('⚠️  Blog content directory not found:', postsDirectory);
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        try {
          const slug = fileName.replace(/\.md$/, '');
          const fullPath = path.join(postsDirectory, fileName);
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const { data, content } = matter(fileContents);

          return {
            slug,
            title: data.title,
            date: data.date.toString(),
            category: data.category,
            excerpt: data.excerpt,
            content: isProd ? content : content, // 開発モードでも内容を含める
            url: `/blog/${slug}`,
            source: 'internal',
            tags: data.tags || [],
          };
        } catch (error) {
          console.error(`❌ Error processing ${fileName}:`, error.message);
          return null;
        }
      })
      .filter(Boolean);

    console.log(`📝 Found ${posts.length} internal posts`);
    return posts;
  } catch (error) {
    console.error('❌ Error reading internal posts:', error.message);
    return [];
  }
}

// 外部記事の取得（Phase 2: プロバイダーシステムを使用）
async function getExternalPosts() {
  const ProviderManager = require('./providers');
  const providerManager = new ProviderManager(isDev);

  try {
    const externalPosts = await providerManager.fetchAllArticles();
    return externalPosts;
  } catch (error) {
    console.error('❌ Failed to fetch external posts:', error.message);
    return [];
  }
}

// メイン処理
async function generateBlogData() {
  try {
    // 内部記事取得
    const internalPosts = getInternalPosts();

    // 外部記事取得（Phase 2）
    const externalPosts = await getExternalPosts();

    // 統合とソート
    const allPosts = [...internalPosts, ...externalPosts];
    const sortedPosts = allPosts.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    // 出力ディレクトリの確保
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // JSONファイルへの出力
    fs.writeFileSync(outputPath, JSON.stringify(sortedPosts, null, 2), 'utf8');

    console.log(`✅ Generated blog data: ${sortedPosts.length} posts`);
    console.log(`📁 Output: ${outputPath}`);

    // 統計情報
    const stats = sortedPosts.reduce((acc, post) => {
      acc[post.source] = (acc[post.source] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Statistics:');
    Object.entries(stats).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} posts`);
    });
  } catch (error) {
    console.error('❌ Failed to generate blog data:', error.message);
    process.exit(1);
  }
}

// 実行
generateBlogData();
