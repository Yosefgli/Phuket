'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Heart,
  Users,
  AlertCircle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'דשבורד', icon: LayoutDashboard },
  { href: '/shabbatot', label: 'שבתות', icon: Calendar },
  { href: '/registrations', label: 'הרשמות', icon: ClipboardList },
  { href: '/donations', label: 'תרומות', icon: Heart },
  { href: '/people', label: 'אנשים', icon: Users },
  { href: '/payloads', label: 'שגיאות', icon: AlertCircle },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 end-0 z-50 w-64 bg-white border-s border-border flex flex-col transition-transform duration-200',
          'md:relative md:translate-x-0 md:z-auto',
          open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="text-lg font-bold text-foreground">מערכת ניהול</span>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md hover:bg-accent"
            aria-label="סגור תפריט"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">מערכת ניהול פנימית</p>
        </div>
      </aside>
    </>
  )
}
