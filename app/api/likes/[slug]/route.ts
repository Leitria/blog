import { NextRequest, NextResponse } from 'next/server';
import { getLikes, updateLike } from '@/features/likes/services/github';
//API 路由：app/api/likes/[slug]/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const {slug}= await params;
  const likes = await getLikes();
  return NextResponse.json({ count: likes[slug] || 0 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const{slug}=await params;
  const newCount = await updateLike(slug);
  return NextResponse.json({ count: newCount });
}