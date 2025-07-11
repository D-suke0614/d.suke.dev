import { getPostBySlugFromStatic, getStaticBlogData } from '@/app/lib/blog';
import BlogPostClient from './BlogPostClient';

export function generateStaticParams() {
  const posts = getStaticBlogData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type BlogProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogProps) {
  const { slug } = await params;
  // Pre-fetch the post data from static data
  const post = getPostBySlugFromStatic(slug);

  // Pass the post data to the client component
  return <BlogPostClient post={post} />;
}
