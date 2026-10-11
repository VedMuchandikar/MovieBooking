import { useState } from 'react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'

/** Poster image that degrades to a gold monogram tile when the URL is empty or dead. */
export function Poster({ src, title, className }) {
  const [failed, setFailed] = useState(null)
  const broken = !src || failed === src
  return broken ? (
    <div className={cn('grid place-items-center bg-[#ede7da] border border-border font-display text-primary/80 font-bold', className)} aria-label={title}>
      {initials(title) || '—'}
    </div>
  ) : (
    <img src={src} alt={title} loading="lazy" onError={() => setFailed(src)} className={cn('object-cover', className)} />
  )
}
