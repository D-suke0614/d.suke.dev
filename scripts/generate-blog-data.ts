import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

// 型定義
interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content?: string;
  url: string;
  source: 'internal' | 'zenn' | 'note';
  tags: string[];
}

interface BlogPostSummary {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  url: string;
  source: 'internal' | 'zenn' | 'note';
  tags: string[];
}

// 引数の解析
const isDev = process.argv.includes('--dev');
const _isProd = process.argv.includes('--prod');

console.log(`🚀 Generating blog data (${isDev ? 'development' : 'production'} mode)...`);

// ディレクトリパス
const postsDirectory = path.join(process.cwd(), 'src/app/content/blog');
const outputDir = path.join(process.cwd(), 'public');
const summaryOutputPath = path.join(outputDir, 'blog-posts.json');
const contentOutputDir = path.join(outputDir, 'blog-content');

// 内部記事の取得
function getInternalPosts(): BlogPost[] {
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
            content,
            url: `/blog/${slug}`,
            source: 'internal' as const,
            tags: data.tags || [],
          } as BlogPost;
        } catch (error) {
          console.error(`❌ Error processing ${fileName}:`, (error as Error).message);
          return null;
        }
      })
      .filter((post): post is BlogPost => post !== null);

    console.log(`📝 Found ${posts.length} internal posts`);
    return posts;
  } catch (error) {
    console.error('❌ Error reading internal posts:', (error as Error).message);
    return [];
  }
}

// 外部記事の取得（フェーズ4で実装予定）
function getExternalPosts(): BlogPost[] {
  if (isDev) {
    // 開発環境では外部記事を取得しない（高速起動のため）
    console.log('⚡ Skipping external posts in development mode');
    return [];
  }

  // フェーズ4で実装予定
  console.log('🔄 External posts integration (Phase 4) - coming soon');
  return [];
}

// 一覧用データ生成（contentフィールドを除外）
function generateSummaryData(posts: BlogPost[]): BlogPostSummary[] {
  return posts.map(({ content: _content, ...post }) => post);
}

// 個別記事データ生成
function generateContentData(posts: BlogPost[]): void {
  // 出力ディレクトリの作成
  if (!fs.existsSync(contentOutputDir)) {
    fs.mkdirSync(contentOutputDir, { recursive: true });
  }

  posts.forEach((post) => {
    const contentPath = path.join(contentOutputDir, `${post.slug}.json`);
    fs.writeFileSync(contentPath, JSON.stringify(post, null, 2), 'utf8');
  });

  console.log(`📁 Generated ${posts.length} individual content files`);
}

// メイン処理
async function generateBlogData(): Promise<void> {
  try {
    // 内部記事取得
    const internalPosts = getInternalPosts();

    // 外部記事取得（フェーズ4）
    const externalPosts = getExternalPosts();

    // 統合とソート
    const allPosts = [...internalPosts, ...externalPosts];
    const sortedPosts = allPosts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 出力ディレクトリの確保
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 一覧用データ生成
    const summaryData = generateSummaryData(sortedPosts);
    fs.writeFileSync(summaryOutputPath, JSON.stringify(summaryData, null, 2), 'utf8');

    // 個別記事データ生成
    generateContentData(sortedPosts);

    console.log(`✅ Generated blog data: ${sortedPosts.length} posts`);
    console.log(`📁 Summary output: ${summaryOutputPath}`);
    console.log(`📁 Content output: ${contentOutputDir}`);

    // 統計情報
    const stats = sortedPosts.reduce(
      (acc, post) => {
        acc[post.source] = (acc[post.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('📊 Statistics:');
    Object.entries(stats).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} posts`);
    });
  } catch (error) {
    console.error('❌ Failed to generate blog data:', (error as Error).message);
    process.exit(1);
  }
}

// 実行
generateBlogData().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
