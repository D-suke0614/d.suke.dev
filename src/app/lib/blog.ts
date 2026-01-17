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
  source: 'internal' | 'zenn' | 'note' | 'qiita';
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
