"use client";

import { CommentSection } from "@/components/comment-section";

export default function AnotherPagesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">anatherpages</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          独立页面示例。评论区固定在页面最下方，版式与音乐页、博文页一致。
        </p>
      </main>
      <CommentSection maxWidthClass="max-w-3xl" className="mt-auto" />
    </div>
  );
}
