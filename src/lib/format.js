const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })

export const money = (n) => inr.format(n || 0)
export const moneyCompact = (n) => `₹${compact.format(n || 0)}`
export const num = (n) => new Intl.NumberFormat('en-IN').format(n || 0)
export const time = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
export const dateShort = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
export const dateTime = (d) => `${dateShort(d)}, ${time(d)}`
export const runtime = (min) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`
export const initials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
