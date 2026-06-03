import { BlogSidebar } from "@/components/blog-sidebar"
import { PostList } from "@/components/post-list"
import { RightSidebar } from "@/components/right-sidebar"
import { DiaryProvider } from "@/context/diary-context"
import { BlogPageCenter } from "@/components/blog-page-center"
import { CommentSection } from "@/components/comment-section"

export default function PagesHome() {
  return (
    <DiaryProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <BlogSidebar />
          <main className="flex min-h-0 flex-1 overflow-hidden">
            <BlogPageCenter>
              <PostList />
            </BlogPageCenter>
            <RightSidebar />
          </main>
        </div>
        <CommentSection maxWidthClass="max-w-6xl" className="shrink-0 border-t border-border/60 bg-muted/20 py-8" />
      </div>
    </DiaryProvider>
  )
}
