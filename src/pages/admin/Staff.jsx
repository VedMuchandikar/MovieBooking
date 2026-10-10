import { useState, useMemo } from 'react'
import { Plus, Shield, Search, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable } from '@/components/admin/DataTable'
import { StatusPill } from '@/components/admin/StatusPill'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDb } from '@/store/db'

function StaffDialog({ open, onOpenChange, staffMember }) {
  const { saveStaff } = useDb()
  const [f, setF] = useState(
    staffMember ? { name: staffMember.name, email: staffMember.email, role: staffMember.role } : { name: '', email: '', role: 'guard' }
  )

  const errors = {
    name: !f.name.trim() && 'Name is required',
    email: !f.email.includes('@') && 'Valid email is required',
  }
  const invalid = Object.values(errors).some(Boolean)

  const submit = (e) => {
    e.preventDefault()
    if (invalid) return
    saveStaff({ ...f, name: f.name.trim(), email: f.email.trim() }, staffMember?.id)
    toast.success(staffMember ? 'Staff member updated' : 'Staff member added')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{staffMember ? 'Edit Staff' : 'Add Staff Member'}</DialogTitle>
          <DialogDescription>Add team members and assign their access level.</DialogDescription>
        </DialogHeader>
        
        {open && (
          <form onSubmit={submit} className="grid gap-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="label-caps mb-2 block">Name</Label>
                <Input value={f.name} onChange={e => setF({...f, name: e.target.value})} placeholder="Jane Doe" autoFocus />
                {errors.name && <p className="mt-1 text-xs text-crimson">{errors.name}</p>}
              </div>
              
              <div>
                <Label className="label-caps mb-2 block">Email</Label>
                <Input type="email" value={f.email} onChange={e => setF({...f, email: e.target.value})} placeholder="jane@cineverse.in" />
                {errors.email && <p className="mt-1 text-xs text-crimson">{errors.email}</p>}
              </div>

              <div>
                <Label className="label-caps mb-2 block">Role</Label>
                <Select value={f.role} onValueChange={r => setF({...f, role: r})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                    <SelectItem value="guard">Gate Guard (Scanner App Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={invalid}>Save</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function Staff() {
  const { staff, toggleStaff } = useDb()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)

  const rows = useMemo(() => {
    return staff.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()))
  }, [staff, q])

  const triggerReset = (s) => {
    toast.success(`Password reset link sent to ${s.email}`)
  }

  return (
    <>
      <PageHeader eyebrow="Security" title="Team & Staff Roster" description="Manage access to the admin dashboard and gate scanner app.">
        <Button onClick={() => setEditing('new')}><Plus /> Add Staff</Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/70" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email..." className="pl-9" />
        </div>
      </div>

      <DataTable
        rows={rows}
        empty="No staff members found."
        columns={[
          {
            key: 'name',
            header: 'Staff Member',
            cell: (s) => (
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.04] border border-white/10">
                  <span className="font-semibold text-xs text-muted-foreground">{s.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            cell: (s) => (
              <span className="flex items-center gap-1.5 text-sm">
                {s.role === 'admin' ? <Shield className="size-3.5 text-gold" /> : <div className="size-3.5 rounded-sm bg-white/10" />}
                <span className="capitalize">{s.role}</span>
              </span>
            )
          },
          {
            key: 'status',
            header: 'Status',
            cell: (s) => <StatusPill status={s.active ? 'active' : 'inactive'} />
          },
          {
            key: 'actions',
            header: '',
            className: 'w-48 text-right',
            cell: (s) => (
              <div className="flex items-center justify-end gap-4">
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-white" onClick={() => triggerReset(s)} title="Send Password Reset">
                  <KeyRound className="size-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{s.active ? 'Active' : 'Suspended'}</span>
                  <Switch checked={s.active} onCheckedChange={() => toggleStaff(s.id)} />
                </div>
              </div>
            )
          },
        ]}
      />

      <StaffDialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)} staffMember={editing === 'new' ? null : editing} />
    </>
  )
}
