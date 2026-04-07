import { NextRequest, NextResponse } from 'next/server';
import { octokit, REPO_OWNER, REPO_NAME, ensureIssue } from '@/features/shared/github';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('[API] GET comments for slug:', slug);
    const issueNumber = await ensureIssue(slug);
    console.log('[API] issueNumber:', issueNumber);
    console.log('GITHUB_TOKEN exists?', !!process.env.GITHUB_TOKEN);
    const { data } = await octokit.issues.listComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: issueNumber,
    });
    console.log('[API] comments count:', data.length);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GET /api/comments/[slug] error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { author, content } = await req.json();

    if (!author || !content) {
      return NextResponse.json({ error: 'Missing author or content' }, { status: 400 });
    }

    const issueNumber = await ensureIssue(slug);
    const comment = `**${author}** said:\n\n${content}`;
    await octokit.issues.createComment({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: issueNumber,
      body: comment,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/comments/[slug] error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}