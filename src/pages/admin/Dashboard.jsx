import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarClock, IndianRupee, Ticket, Users } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { Poster } from '@/components/admin/Poster'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { kpis, revenueSeries, topTitles } from '@/lib/analytics'
import { money, moneyCompact, num } from '@/lib/format'
import { useDb } from '@/store/db'
import { colors } from '@/tokens'

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="glass-strong rounded-xl px-3.5 py-2.5 text-xs shadow-xl">
      <p className="label-caps mb-1">{p.label}</p>
      <p className="font-display text-base text-primary">{money(p.revenue)}</p>
      <p className="text-muted-foreground">{num(p.bookings)} bookings</p>
    </div>
  )
}

export default function Dashboard() {
  const db = useDb()
  const [range, setRange] = useState('7')
  const k = useMemo(() => kpis(db), [db.bookings, db.shows, db.totalUsers])
  const series = useMemo(() => revenueSeries(db, Number(range)), [db.bookings, db.history, range])
  const top = useMemo(() => topTitles(db), [db.bookings, db.shows, db.history, db.screens, db.movies])
  const total = series.reduce((n, d) => n + d.revenue, 0)

  return (
    <>
      <PageHeader eyebrow="Overview" title="Executive Dashboard" description="The multiplex at a glance: sales, screens in play and the titles carrying the house." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Ticket} label="Today's bookings" value={num(k.bookings)} hint="Confirmed, made today" />
        <StatCard icon={IndianRupee} label="Today's revenue" value={money(k.revenue)} hint="Excludes cancellations" />
        <StatCard icon={Users} label="Total users" value={num(k.users)} hint="Registered patrons" />
        <StatCard icon={CalendarClock} label="Active shows today" value={num(k.activeShows)} hint="Across all screens" />
      </div>

      <section className="glass rise mt-6 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-caps">Revenue</p>
            <p className="mt-2 font-display text-3xl font-semibold">{money(total)}</p>
            <p className="text-xs text-muted-foreground">Last {range} days · avg {moneyCompact(total / series.length)} / day</p>
          </div>
          <Tabs value={range} onValueChange={setRange}>
            <TabsList>
              <TabsTrigger value="7">7 days</TabsTrigger>
              <TabsTrigger value="30">30 days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="brandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.charts.revenueFill} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colors.charts.revenueFill} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="brandLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors.charts.revenueLineStart} />
                  <stop offset="100%" stopColor={colors.charts.revenueLineEnd} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={colors.charts.gridStroke} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: colors.charts.axisTick, fontSize: 11 }} interval={range === '30' ? 3 : 0} />
              <YAxis tickLine={false} axisLine={false} width={52} tick={{ fill: colors.charts.axisTick, fontSize: 11 }} tickFormatter={moneyCompact} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: colors.charts.cursorStroke }} />
              <Area type="monotone" dataKey="revenue" stroke="url(#brandLine)" strokeWidth={2.5} fill="url(#brandFill)" activeDot={{ r: 5, fill: colors.charts.revenueLineStart, stroke: '#080c14', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="label-caps text-primary">Box office</p>
            <h2 className="mt-1 text-xl font-semibold">Top 5 performing titles</h2>
          </div>
          <p className="text-xs text-muted-foreground">Last 30 days · by tickets sold</p>
        </div>
        <DataTable
          rowKey={(r) => r.title}
          rows={top}
          columns={[
            {
              key: 'title',
              header: 'Title',
              cell: (r) => (
                <div className="flex items-center gap-3">
                  <Poster src={r.poster} title={r.title} className="h-14 w-10 shrink-0 rounded-md border border-border text-xs" />
                  <span className="font-medium">{r.title}</span>
                </div>
              ),
            },
            { key: 'tickets', header: 'Tickets sold', cell: (r) => <span className="tabular-nums">{num(r.tickets)}</span> },
            { key: 'revenue', header: 'Revenue', cell: (r) => <span className="tabular-nums font-semibold text-amber">{money(r.revenue)}</span> },
            {
              key: 'occupancy',
              header: 'Occupancy',
              className: 'min-w-44',
              cell: (r) => (
                <div className="flex items-center gap-3">
                  <Progress value={r.occupancy} className="h-1.5 flex-1 bg-muted [&>div]:bg-amber" />
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{r.occupancy}%</span>
                </div>
              ),
            },
          ]}
        />
      </section>
    </>
  )
}
