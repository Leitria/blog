"use client"

import Link from "next/link"
import { 
  Home, 
  User, 
  FileText, 
  UtensilsCrossed, 
  Star, 
  Link2, 
  Rss, 
  Search 
} from "lucide-react"

const navItems = [
  { icon: User, label: "关于 | About", href: "/about" },
  { icon: Home, label: "主页 | Home", href: "/" },
  { icon: FileText, label: "博文 | Archives", href: "/archives", active: true },
  { icon: UtensilsCrossed, label: "食谱 | Recipe", href: "/recipe" },
  { icon: Star, label: "测评 | Review", href: "/review" },
  { icon: Link2, label: "友链 | Friends", href: "/friends" },
  { icon: Rss, label: "订阅 | RSS/Email", href: "/rss" },
  { icon: Search, label: "搜索 | Search", href: "/search" },
]

const socialIcons = [
  { name: "mastodon", icon: "🐘" },
  { name: "rss", icon: "📡" },
  { name: "github", icon: "💻" },
  { name: "douban", icon: "📖" },
  { name: "steam", icon: "🎮" },
]

export function BlogSidebar() {
  return (
    <aside className="w-56 bg-sidebar text-sidebar-foreground flex flex-col p-6 min-h-screen shrink-0">
      {/* Avatar */}
      <div className="mb-4">
        <div className="w-20 h-20 bg-[#c9a0dc] rounded-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-16 h-16">
            {/* Cat silhouette */}
            <ellipse cx="50" cy="60" rx="30" ry="25" fill="#1a1825" />
            {/* Left ear */}
            <polygon points="25,45 20,15 40,35" fill="#1a1825" />
            {/* Right ear */}
            <polygon points="75,45 80,15 60,35" fill="#1a1825" />
            {/* Eyes */}
            <ellipse cx="38" cy="55" rx="8" ry="10" fill="#f5d742" />
            <ellipse cx="62" cy="55" rx="8" ry="10" fill="#f5d742" />
            {/* Pupils */}
            <ellipse cx="38" cy="55" rx="3" ry="8" fill="#1a1825" />
            <ellipse cx="62" cy="55" rx="3" ry="8" fill="#1a1825" />
          </svg>
        </div>
      </div>

      {/* Site Title */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-foreground">第三夏尔 | Third Shire</h1>
        <p className="text-sm text-muted-foreground">认真生活，积极摸鱼</p>
      </div>

      {/* Social Icons */}
      <div className="flex gap-2 mb-6">
        {socialIcons.map((social) => (
          <button
            key={social.name}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors text-sm"
            title={social.name}
          >
            {social.icon}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${
              item.active
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
