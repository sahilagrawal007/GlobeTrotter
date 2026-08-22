import { useParams, Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { BarChart2, ArrowLeft, TrendingUp } from 'lucide-react'
import { useTripBudget, useTrip } from '../hooks/useTrips'
import { formatCurrency } from '../lib/formatters'

const CATEGORY_COLORS = {
  transport: '#14B8A6',
  stay: '#F59E0B',
  meals: '#8B5CF6',
  activities: '#F87171',
}
const CATEGORY_LABELS = { transport: 'Transport', stay: 'Stay', meals: 'Meals', activities: 'Activities' }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-elevated px-3 py-2 rounded-xl text-xs">
      {label && <div className="text-slate-400 mb-1">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.name} className="text-white font-semibold">{formatCurrency(p.value)}</div>
      ))}
    </div>
  )
}

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { data: trip } = useTrip(tripId)
  const { data: budget, isLoading } = useTripBudget(tripId)

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
    </div>
  )
  if (!budget) return <div className="text-center py-20 text-slate-400">No budget data</div>

  const pieData = Object.entries(budget.byCategory).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key,
    value,
    color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] ?? '#94A3B8',
  })).filter((d) => d.value > 0)

  const barData = budget.byStop.map((s) => ({ name: s.cityName, total: s.total }))

  const lineData = budget.byDay.map((d) => ({
    date: d.date.slice(5),
    spend: d.total,
  }))

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/trips/${tripId}`} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-teal-400" /> Budget Breakdown
          </h1>
          {trip && <p className="text-slate-400 text-sm mt-0.5">{trip.name}</p>}
        </div>
      </div>

      {/* Total hero */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400 mb-1">Total Estimated Cost</div>
          <div className="text-4xl font-bold text-gradient">{formatCurrency(budget.totalCost)}</div>
          <div className="text-xs text-slate-500 mt-1">{budget.byStop.length} cities · {budget.byDay.length} days</div>
        </div>
        <div className="hidden sm:flex gap-6">
          {pieData.map((d) => (
            <div key={d.name} className="text-center">
              <div className="text-lg font-bold text-white">{Math.round((d.value / budget.totalCost) * 100)}%</div>
              <div className="text-xs text-slate-500">{d.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart - by category */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">By Category</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-xs text-white font-semibold">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart - by city */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">By City</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#14B8A6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line chart - daily spend */}
      {lineData.length > 1 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" /> Daily Spend Trend
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="spend" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-slate-300">Category Breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Category</th>
              <th className="text-right p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
              <th className="text-right p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">% of total</th>
            </tr>
          </thead>
          <tbody>
            {pieData.map((d) => (
              <tr key={d.name} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="p-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300">{d.name}</span>
                </td>
                <td className="p-3 text-right text-white font-semibold">{formatCurrency(d.value)}</td>
                <td className="p-3 text-right text-slate-400">{Math.round((d.value / budget.totalCost) * 100)}%</td>
              </tr>
            ))}
            <tr className="bg-white/3">
              <td className="p-3 text-white font-bold">Total</td>
              <td className="p-3 text-right text-teal-400 font-bold text-base">{formatCurrency(budget.totalCost)}</td>
              <td className="p-3 text-right text-slate-400">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
