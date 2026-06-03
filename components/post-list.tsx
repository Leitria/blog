import Image from "next/image"
import Link from "next/link"

interface Post {
  id: string
  title: string
  subtitle: string
  date: string
  image: string
}

const posts: Post[] = [
  {
    id: "1",
    title: "立夏 | 2026 年 4 月小结",
    subtitle: "在下雪的四月，试图做拿铁拉花",
    date: "May 05, 2026",
    image: "/images/latte-art.jpg",
  },
  {
    id: "2",
    title: "如何在 Mastodon 长毛象搬家到另一个实例并迁移 Neodb",
    subtitle: "赛博搬家竟如此简单",
    date: "Apr 23, 2026",
    image: "/images/tech-migration.jpg",
  },
  {
    id: "3",
    title: "清明 | 2026 年 3 月小结",
    subtitle: "雨纷纷的那天，吃起开心果冰淇淋",
    date: "Apr 05, 2026",
    image: "/images/spring-candy.jpg",
  },
  {
    id: "4",
    title: "惊蛰 | 2026 年 2 月小结",
    subtitle: "在大雪停歇之前",
    date: "Mar 07, 2026",
    image: "/images/chinese-new-year.jpg",
  },
  {
    id: "5",
    title: "立春 | 2026 年 1 月小结",
    subtitle: "新年的第一场雪",
    date: "Feb 03, 2026",
    image: "/images/winter-snow.jpg",
  },
]

export function PostList() {
  return (
    <div className="flex-1">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        2026
      </h2>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group flex items-start gap-4 rounded-xl border border-transparent bg-card/60 p-4 shadow-sm transition-all hover:border-border/80 hover:bg-card hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-lg font-medium text-primary group-hover:underline">
                {post.title}
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">{post.subtitle}</p>
              <time className="text-xs text-muted-foreground">{post.date}</time>
            </div>
            <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
              <Image
                src={post.image}
                alt={post.title}
                width={80}
                height={80}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
