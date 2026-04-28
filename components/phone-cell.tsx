'use client'

import { useState } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { toWhatsAppLink } from '@/lib/utils'

interface PhoneCellProps {
  phone: string | null | undefined
}

export function PhoneCell({ phone }: PhoneCellProps) {
  const [copied, setCopied] = useState(false)

  if (!phone) return <span className="text-muted-foreground">—</span>

  function handleCopy() {
    navigator.clipboard.writeText(phone!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm" dir="ltr">{phone}</span>
        <Tooltip open={copied}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
              aria-label="העתק מספר"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>הועתק!</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-green-600 hover:text-green-700"
          asChild
        >
          <a
            href={toWhatsAppLink(phone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="פתח WhatsApp"
          >
            <MessageCircle className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </TooltipProvider>
  )
}
