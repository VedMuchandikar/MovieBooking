import { useState } from 'react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'

/** Poster image that degrades to a gold monogram tile when the URL is empty or dead. */
export function Poster({ src, title, className }) {
  const [failed, setFailed] = useState(null)
  const broken = !src || failed === src
  return broken ? (
    <div className={cn('grid place-items-center bg-gradient-to-br from-[#2a2417] via-[#14110a] to-[#0d0f14] font-display text-gold/80', className)} aria-label={title}>
      {initials(title) || '—'}
    </div>
  ) : (
    <img src={src} alt={title} loading="lazy" onError={() => setFailed(src)} className={cn('object-cover', className)} />
  )
}
