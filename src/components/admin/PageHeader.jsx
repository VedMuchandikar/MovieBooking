import { cn } from '@/lib/utils'

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="rise flex flex-wrap items-end justify-between gap-4 pb-6 pt-8">
      <div className="min-w-0">
        {eyebrow && <p className="label-caps mb-2 text-gold/80">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}

export function StatCard({ icon: Icon, label, value, hint, className }) {
  return (
    <div className={cn('rise glass group relative overflow-hidden rounded-2xl p-5 transition-colors hover:border-gold/25', className)}>
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gold/10 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="label-caps">{label}</span>
        {Icon && <Icon className="size-4 text-gold/80" />}
      </div>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
