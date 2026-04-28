'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Search, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface TopBarProps {
  onMenuOpen: () => void
}

export function TopBar({ onMenuOpen }: TopBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border h-16 flex items-center px-4 gap-4">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuOpen}
        aria-label="פתח תפריט"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Global search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="חיפוש לפי שם, טלפון, אימייל, payment_id..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ps-9"
          />
        </div>
      </form>

      <div className="flex-1" />

      {/* Logout */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">התנתקות</span>
      </Button>
    </header>
  )
}
