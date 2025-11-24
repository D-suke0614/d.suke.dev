import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Edge Runtime設定
export const runtime = 'edge';

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

// 個別記事データ取得（Edge Runtime対応）
async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // publicディレクトリの静的ファイルを取得
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://d.suke.dev'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/blog-content/${slug}.json`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch blog post: ${response.status}`);
    }

    const post: BlogPost = await response.json();
    return post;
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}

// 全記事一覧を取得して存在確認（フォールバック）
async function checkPostExists(slug: string): Promise<boolean> {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://d.suke.dev'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/blog-posts.json`);

    if (!response.ok) {
      return false;
    }

    const posts: BlogPost[] = await response.json();
    return posts.some((post) => post.slug === slug);
  } catch (error) {
    console.error(`Error checking post existence ${slug}:`, error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // 記事データの取得
    const post = await fetchBlogPost(slug);

    if (!post) {
      // フォールバック: 記事が存在するかチェック
      const exists = await checkPostExists(slug);

      if (!exists) {
        return NextResponse.json(
          { error: 'Post not found' },
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      }

      // 記事は存在するが内容が取得できない場合
      return NextResponse.json(
        { error: 'Post content not available' },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return NextResponse.json(post, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in /api/posts/[slug]:', error);

    return NextResponse.json(
      { error: 'Failed to fetch post' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
