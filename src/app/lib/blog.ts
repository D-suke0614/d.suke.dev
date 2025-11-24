import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

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

const postsDirectory = path.join(process.cwd(), 'src/app/content/blog');

export function getAllPostSlugs() {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        return {
          params: {
            slug: fileName.replace(/\.md$/, ''),
          },
        };
      });
  } catch (e) {
    console.error('Error reading post slugs:', e);
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
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
      source: 'internal',
      tags: data.tags || [],
    };
  } catch (e) {
    console.error(`Error reading post ${slug}:`, e);
    return null;
  }
}

export function getAllPosts(): BlogPost[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPosts = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const post = getPostBySlug(slug);
        return post;
      })
      .filter((post): post is BlogPost => post !== null);

    // Sort posts by date
    return allPosts.sort((a, b) => {
      if (new Date(a.date) < new Date(b.date)) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error('Error reading all posts:', error);
    return [];
  }
}

// 静的データからの記事取得（ビルド時生成された blog-data.json を使用）
export function getStaticBlogData(): BlogPost[] {
  try {
    const dataPath = path.join(process.cwd(), 'public/blog-data.json');
    if (!fs.existsSync(dataPath)) {
      console.warn('Blog data file not found:', dataPath);
      return [];
    }

    const fileContents = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading static blog data:', error);
    return [];
  }
}

// 静的データから特定の記事を取得
export function getPostBySlugFromStatic(slug: string): BlogPost | null {
  const posts = getStaticBlogData();
  return posts.find((post) => post.slug === slug) || null;
}

// API経由でのデータ取得関数（Edge Runtime対応）

// 新しいAPI Response型定義
export interface PostsResponse {
  posts: BlogPost[];
  total: number;
  hasMore: boolean;
}

// 一覧用データ取得（API経由）
export async function fetchPostsFromAPI(
  page: number = 1,
  limit: number = 10,
  category?: string,
  source?: string,
): Promise<PostsResponse> {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://d.suke.dev'
        : 'http://localhost:3000';

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category && category !== 'all') {
      params.append('category', category);
    }

    if (source && source !== 'all') {
      params.append('source', source);
    }

    const response = await fetch(`${baseUrl}/api/posts?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching posts from API:', error);
    return { posts: [], total: 0, hasMore: false };
  }
}

// 個別記事取得（API経由）
export async function fetchPostBySlugFromAPI(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://d.suke.dev'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/posts/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching post ${slug} from API:`, error);
    return null;
  }
}

// 一覧用データ取得（静的ファイル）- Edge Runtime対応
export async function fetchPostsSummaryFromStatic(): Promise<
  Omit<BlogPost, 'content'>[]
> {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://d.suke.dev'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/blog-posts.json`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts summary: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching posts summary from static:', error);
    return [];
  }
}

// 個別記事取得（静的ファイル）- Edge Runtime対応
export async function fetchPostContentFromStatic(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://d.suke.dev'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/blog-content/${slug}.json`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post content: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching post content ${slug} from static:`, error);
    return null;
  }
}
