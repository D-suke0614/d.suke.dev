import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Edge Runtime設定
export const runtime = 'edge';

// 型定義
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

interface PostsResponse {
  posts: BlogPostSummary[];
  total: number;
  hasMore: boolean;
}

// 静的データ取得（Edge Runtime対応）
async function fetchBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    // publicディレクトリの静的ファイルを取得
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://d.suke.dev'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/blog-posts.json`);

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.status}`);
    }

    const posts: BlogPostSummary[] = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // パラメータの取得
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const category = searchParams.get('category') || '';
    const source = searchParams.get('source') || '';

    // 記事データの取得
    const allPosts = await fetchBlogPosts();

    // フィルタリング
    let filteredPosts = allPosts;

    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter((post) => post.category === category);
    }

    if (source && source !== 'all') {
      filteredPosts = filteredPosts.filter((post) => post.source === source);
    }

    // ページネーション
    const total = filteredPosts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    const response: PostsResponse = {
      posts: paginatedPosts,
      total,
      hasMore,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in /api/posts:', error);

    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
