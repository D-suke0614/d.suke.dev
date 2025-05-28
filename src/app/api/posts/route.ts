import { getAllPosts } from '@/app/lib/blog';
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json(posts);
}
