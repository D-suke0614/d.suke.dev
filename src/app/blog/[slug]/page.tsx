import { getAllPostSlugs, getPostBySlug } from '@/app/lib/blog';
import BlogPostClient from './BlogPostClient';

export function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths.map((path) => path.params);
}

type BlogProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogProps) {
  const { slug } = await params;
  // Pre-fetch the post data on the server
  const post = getPostBySlug(slug);

  // Pass the post data to the client component
  return <BlogPostClient post={post} />;
}
