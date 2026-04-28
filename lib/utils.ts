import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}

export function toWhatsAppLink(phone: string | null | undefined): string {
  if (!phone) return '#'
  const cleaned = phone.replace(/\D/g, '').replace(/^0/, '972')
  return `https://wa.me/${cleaned}`
}

export function exportToCsv(
  filename: string,
  headers: Record<string, string>,
  rows: Record<string, unknown>[]
) {
  const headerKeys = Object.keys(headers)
  const headerRow = headerKeys.map((k) => headers[k]).join(',')
  const dataRows = rows.map((row) =>
    headerKeys
      .map((k) => {
        const val = row[k]
        if (val == null) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      })
      .join(',')
  )
  const csv = [headerRow, ...dataRows].join('\n')
  const bom = '\uFEFF' // UTF-8 BOM for Excel Hebrew support
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
