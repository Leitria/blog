// features/visits/services/github.ts
import { octokit, REPO_OWNER, REPO_NAME } from '@/features/shared/github';

const VISITS_FILE = 'visits.json';
const BRANCH = 'main';
const FLUSH_INTERVAL_MS = 10000;     // 10秒批量写入一次
const MAX_RETRIES = 3;               // 写入失败时的重试次数

interface VisitData {
  [slug: string]: {
    total: number;
    referrers: Record<string, number>;
  };
}

// ---------- 内存缓存结构 ----------
interface PendingEntry {
  delta: number;                     // 待增加的 total 数量
  referrers: Map<string, number>;    // 待增加的 referrers
}

let pendingVisits = new Map<string, PendingEntry>();
let flushTimer: NodeJS.Timeout | null = null;
let isFlushing = false;               // 防止并发 flush

// ---------- 工具函数 ----------
function parseDomain(referrer: string): string {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return 'direct';
  }
}

// 从 GitHub 读取当前 visits 数据
export async function getVisits(): Promise<VisitData> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: VISITS_FILE,
    });
    const content = Buffer.from((data as any).content, 'base64').toString();
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// 将内存中的 pending 数据合并到已有的 visits 对象中
function mergePending(visits: VisitData): void {
  for (const [slug, entry] of pendingVisits.entries()) {
    if (!visits[slug]) {
      visits[slug] = { total: 0, referrers: {} };
    }
    visits[slug].total += entry.delta;
    for (const [domain, count] of entry.referrers.entries()) {
      visits[slug].referrers[domain] = (visits[slug].referrers[domain] || 0) + count;
    }
  }
}

// 带重试机制的 GitHub 写入
async function writeVisitsWithRetry(visits: VisitData, retries = MAX_RETRIES): Promise<void> {
  // 获取当前文件的 SHA（如果存在）
  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: VISITS_FILE,
    });
    sha = (data as any).sha;
  } catch {
    // 文件不存在，sha 留空
  }

  const content = Buffer.from(JSON.stringify(visits, null, 2)).toString('base64');
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: VISITS_FILE,
      message: `Update visits (${new Date().toISOString()})`,
      content,
      sha,
      branch: BRANCH,
    });
    // 写入成功，清除对应的 pending 数据
    pendingVisits.clear();
  } catch (error: any) {
    // 409 Conflict 表示远程文件已被修改，需要重新读取并合并
    if (error.status === 409 && retries > 0) {
      console.warn(`[visits] Conflict detected, retrying... (${retries} left)`);
      // 重新获取最新的远程数据
      const latestVisits = await getVisits();
      // 将当前要写入的 visits 与最新远程数据合并（保留远程中尚未被当前写入覆盖的计数）
      // 简单策略：以 latestVisits 为基础，加上 visits 中的增量（但 visits 已经包含了之前的 pending）
      // 更准确的做法：只将 pendingVisits 中的增量合并到 latestVisits 中
      const merged = { ...latestVisits };
      for (const [slug, entry] of pendingVisits.entries()) {
        if (!merged[slug]) merged[slug] = { total: 0, referrers: {} };
        merged[slug].total += entry.delta;
        for (const [domain, count] of entry.referrers.entries()) {
          merged[slug].referrers[domain] = (merged[slug].referrers[domain] || 0) + count;
        }
      }
      // 递归重试
      await writeVisitsWithRetry(merged, retries - 1);
    } else {
      console.error('[visits] Failed to write to GitHub:', error);
      throw error; // 让上层捕获，但至少不会丢失 pending 数据（下次 flush 会重试）
    }
  }
}

// 将内存缓存 flush 到 GitHub
async function flushToGitHub(): Promise<void> {
  if (pendingVisits.size === 0) return;
  if (isFlushing) return;
  isFlushing = true;

  try {
    // 读取当前远程数据
    let currentVisits = await getVisits();
    // 合并 pending 数据
    mergePending(currentVisits);
    // 写入（内部会处理冲突并清空 pendingVisits）
    await writeVisitsWithRetry(currentVisits);
  } catch (err) {
    console.error('[visits] Flush failed, pending data remains:', err);
    // 不清空 pendingVisits，下次 flush 会重试
  } finally {
    isFlushing = false;
  }
}

// 定时 flush
function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    await flushToGitHub();
    // 继续调度（如果还有 pending 数据）
    if (pendingVisits.size > 0) {
      scheduleFlush();
    }
  }, FLUSH_INTERVAL_MS);
}

// 公开的记录访问函数（由 API 路由调用）
export async function recordVisit(slug: string, referrer: string): Promise<void> {
  const domain = parseDomain(referrer);

  // 更新内存缓存
  if (!pendingVisits.has(slug)) {
    pendingVisits.set(slug, { delta: 0, referrers: new Map() });
  }
  const entry = pendingVisits.get(slug)!;
  entry.delta += 1;
  const prev = entry.referrers.get(domain) || 0;
  entry.referrers.set(domain, prev + 1);

  // 启动定时 flush
  scheduleFlush();

  // 立即返回，不等待 GitHub 写入
}

// 可选：在服务关闭前主动 flush（例如在 Next.js 的 `register` 或自定义 server 中调用）
export async function flushOnShutdown(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  await flushToGitHub();
}