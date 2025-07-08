import { getAllPosts } from '@/app/lib/blog';
import { NextResponse } from 'next/server';

export const runtime = 'edge'

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json(posts);
}
