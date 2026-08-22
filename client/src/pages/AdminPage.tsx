import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ShieldCheck, Users, Map, TrendingUp, Compass } from 'lucide-react'
import { useAdminStats, useAdminUsers, useAdminTrips } from '../hooks/useSearch'
import { formatCurrency, formatDate } from '../lib/formatters'
import { clsx } from 'clsx'

type Tab = 'overview' | 'users' | 'trips'

const COLORS = ['#14B8A6', '#F59E0B', '#8B5CF6', '#F87171', '#34D399', '#60A5FA']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-elevated px-3 py-2 rounded-xl text-xs">
      {label && <div className="text-slate-400 mb-1">{label}</div>}
      <div className="text-white font-semibold">{payload[0]?.value}</div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [usersPage, setUsersPage] = useState(1)
  const [tripsPage, setTripsPage] = useState(1)
  const { data: stats } = useAdminStats()
  const { data: usersData } = useAdminUsers(usersPage)
  const { data: tripsData } = useAdminTrips(tripsPage)

  const topCitiesData = stats?.topCities.map((c) => ({ name: c.cityName, value: c.count })) ?? []
  const topActivitiesData = stats?.topActivities.map((a) => ({ name: a.activityName, count: a.count })) ?? []

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-xs mt-0.5">Platform management & analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
        {([
          { key: 'overview', label: 'Overview', icon: TrendingUp },
          { key: 'users', label: 'Users', icon: Users },
          { key: 'trips', label: 'Trips', icon: Map },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:text-white'
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-teal-500/15 text-teal-400" />
            <StatCard label="Total Trips" value={stats.totalTrips} icon={Map} color="bg-amber-500/15 text-amber-400" />
            <StatCard label="Trips (7 days)" value={stats.tripsCreatedLast7d} icon={TrendingUp} color="bg-violet-500/15 text-violet-400" />
            <StatCard label="Destinations" value="20+" icon={Compass} color="bg-rose-500/15 text-rose-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Cities pie */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Popular Cities</h2>
              {topCitiesData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={topCitiesData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" strokeWidth={0}>
                        {topCitiesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {topCitiesData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-xs text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div className="text-slate-500 text-sm text-center py-8">No data yet</div>}
            </div>

            {/* Top Activities bar */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-300">Popular Activities</h2>
                <span className="text-xs text-slate-500">Top 5</span>
              </div>
              {topActivitiesData.length > 0 ? (
                <div className="space-y-3">
                  {topActivitiesData.map((a) => {
                    const maxCount = Math.max(...topActivitiesData.map((d) => d.count), 1)
                    const percent = Math.max(Math.round((a.count / maxCount) * 100), 10)
                    return (
                      <div key={a.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium truncate pr-2" title={a.name}>
                            {a.name}
                          </span>
                          <span className="text-amber-400 font-semibold flex-shrink-0">
                            {a.count} {a.count === 1 ? 'trip' : 'trips'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-slate-500 text-sm text-center py-8">No data yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      {tab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">All Users</h2>
            <span className="text-xs text-slate-500">{usersData?.total ?? 0} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Name', 'Email', 'Role', 'Trips', 'Joined'].map((h) => (
                    <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(usersData?.users as any[])?.map((u: any) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-3 text-white font-medium">{u.name}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3">
                      <span className={clsx('pill', u.role === 'admin' ? 'pill-ongoing' : 'pill-upcoming')}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{u.tripCount}</td>
                    <td className="p-3 text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                )) ?? null}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="p-3 flex justify-end gap-2">
            <button onClick={() => setUsersPage((p) => Math.max(1, p - 1))} disabled={usersPage === 1} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30">← Prev</button>
            <button onClick={() => setUsersPage((p) => p + 1)} disabled={!usersData || usersPage * 20 >= usersData.total} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}

      {/* Trips table */}
      {tab === 'trips' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">All Trips</h2>
            <span className="text-xs text-slate-500">{tripsData?.total ?? 0} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Trip Name', 'Owner', 'Dates', 'Stops', 'Public', 'Created'].map((h) => (
                    <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(tripsData?.trips as any[])?.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-3 text-white font-medium max-w-48 truncate">{t.name}</td>
                    <td className="p-3 text-slate-400">{t.owner?.name ?? '-'}</td>
                    <td className="p-3 text-slate-400 text-xs">{formatDate(t.startDate)} – {formatDate(t.endDate)}</td>
                    <td className="p-3 text-slate-300">{t.stopCount}</td>
                    <td className="p-3">{t.isPublic ? <span className="pill pill-ongoing">Public</span> : <span className="pill pill-done">Private</span>}</td>
                    <td className="p-3 text-slate-500 text-xs">{formatDate(t.createdAt)}</td>
                  </tr>
                )) ?? null}
              </tbody>
            </table>
          </div>
          <div className="p-3 flex justify-end gap-2">
            <button onClick={() => setTripsPage((p) => Math.max(1, p - 1))} disabled={tripsPage === 1} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30">← Prev</button>
            <button onClick={() => setTripsPage((p) => p + 1)} disabled={!tripsData || tripsPage * 20 >= tripsData.total} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  )
}
