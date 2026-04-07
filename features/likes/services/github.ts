import { octokit, REPO_OWNER, REPO_NAME } from '@/features/shared/github';
// 点赞模块（基于 GitHub 仓库文件）
// 思路：在数据仓库中存放一个 likes.json 文件，内容为 { "slug1": 123, "slug2": 456 }。每次点赞通过 API 读取、增加、写回。
// 服务：features/likes/services/github.ts
const LIKES_FILE = 'likes.json';
const BRANCH = 'main'; // 或你的默认分支

export async function getLikes(): Promise<Record<string, number>> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: LIKES_FILE,
    });
    const content = Buffer.from((data as any).content, 'base64').toString();
    return JSON.parse(content);
  } catch {
    // 文件不存在则返回空对象
    return {};
  }
}

export async function updateLike(slug: string): Promise<number> {
  // 获取当前文件
  let fileData: any;
  try {
    fileData = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: LIKES_FILE,
    });
  } catch {
    // 文件不存在，创建
    const newLikes = { [slug]: 1 };
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: LIKES_FILE,
      message: `Initialize likes.json`,
      content: Buffer.from(JSON.stringify(newLikes, null, 2)).toString('base64'),
    });
    return 1;
  }

  const sha = (fileData.data as any).sha;
  const content = Buffer.from((fileData.data as any).content, 'base64').toString();
  const likes = JSON.parse(content);
  const newCount = (likes[slug] || 0) + 1;
  likes[slug] = newCount;

  await octokit.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: LIKES_FILE,
    message: `Update likes for ${slug}`,
    content: Buffer.from(JSON.stringify(likes, null, 2)).toString('base64'),
    sha,
  });

  return newCount;
}