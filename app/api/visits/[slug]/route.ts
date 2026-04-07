import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/features/visits/services/github';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const {slug}= await params;
  const referrer = req.headers.get('referer') || '';
  await recordVisit(slug, referrer);
  return NextResponse.json({ success: true });
}