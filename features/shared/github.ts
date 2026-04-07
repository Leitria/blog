import { Octokit } from '@octokit/rest';
// 1. 评论区模块（基于 GitHub Issues）
// 思路：每个博客文章对应一个 Issue。评论就是 Issue 下的评论。通过 GitHub API 读取和创建评论。
// 创建 Issue 映射
// 在数据仓库中，为每篇文章创建一个 Issue（可通过脚本或手动创建），Issue 的 title 为文章的 slug（或自定义 ID）。后续评论都挂在这个 Issue 下。
// 核心服务：features/shared/github.ts
export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const REPO_OWNER = process.env.DATA_REPO_OWNER!;
export const REPO_NAME = process.env.DATA_REPO_NAME!;

// 获取某个 slug 对应的 Issue 编号
export async function getIssueNumberBySlug(slug: string): Promise<number | null> {
  const { data } = await octokit.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'all',
    per_page: 100,
  });
  const issue = data.find(issue => issue.title === slug);
  return issue?.number || null;
}

// 创建新 Issue（如果不存在）
export async function ensureIssue(slug: string): Promise<number> {
  const existing = await getIssueNumberBySlug(slug);
  if (existing) return existing;

  const { data } = await octokit.issues.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title: slug,
    body: `Comments for ${slug}`,
  });
  return data.number;
}