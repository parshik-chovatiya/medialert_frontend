'use client'

import {
  LayoutDashboard,
  PillBottle,
  TrendingUp,
  ClipboardList,
  Settings,
  LogOut,
  User
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


export function Sidebar() {
  const pathname = usePathname()

  const top = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: PillBottle, label:'Add Medicine Reminder', href: '/reminder' },
    { icon: TrendingUp, label: 'Progress', href: '/progress' },
    { icon: ClipboardList, label: 'Medicine Reminder List', href: '/medicine-list' },
  ]

  const bottom = [
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: LogOut, label: 'Logout', href: '/logout' },
  ]

  return (
    <aside
      className="left-0 top-20 h-[calc(100vh-10rem)] flex flex-col items-center bg-white z-40 m-5 rounded-4xl px-2"
    >
      {/* TOP */}
      <div className="flex flex-col gap-3 pt-2">
        {top.map(item => (
          <Item key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>

      <div className="flex-1" />

      {/* BOTTOM */}
      <div className="flex flex-col gap-3 ">
        {bottom.map(item => (
          <Item key={item.href} {...item} active={pathname === item.href} />
        ))}

        <div className="mt-4 mb-2">
          <Item
            icon={User}
            label="Profile"
            href="/profile"
            active={pathname === '/profile'}
          />
        </div>
      </div>
    </aside>
  )
}

function Item({ icon: Icon, label, href, active }: any) {
  return (
    <Link
      href={href}
      className="
        group relative
        w-11 h-11
        flex items-center justify-center
        rounded-xl
        transition
      "
    >
      <span
        className={`
          absolute inset-0 rounded-4xl
          ${active ? 'bg-[#5669fe]' : 'group-hover:bg-[#5669fe]/30'}
        `}
      />

      <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-white' : ''}`} />

      {/* Tooltip */}
      <span
        className="
          absolute left-full ml-3
          px-3 py-1.5
          text-xs rounded-md
          bg-black text-white
          opacity-0 invisible
          group-hover:opacity-100 group-hover:visible
          whitespace-nowrap
        "
      >
        {label}
      </span>
    </Link>
  )
}
