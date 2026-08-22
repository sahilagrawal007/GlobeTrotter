import { Outlet } from 'react-router-dom'
import { Globe } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left - decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600">
        {/* Animated background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-teal-400" />
            </div>
            <span className="text-2xl font-bold text-white">GlobeTrotter</span>
          </div>

          {/* Hero */}
          <div className="animate-float">
            <div className="text-6xl mb-6">🌍</div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Plan your perfect<br />
            <span className="text-gradient">adventure</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-sm">
            Build detailed itineraries, track budgets in ₹, and discover the world one stop at a time.
          </p>

          {/* Stats */}
          <div className="mt-12 flex gap-8">
            {[
              { value: '20+', label: 'Destinations' },
              { value: '60+', label: 'Activities' },
              { value: '₹', label: 'INR Budget' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-teal-400">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-navy-900">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Globe className="w-6 h-6 text-teal-400" />
            <span className="text-xl font-bold text-white">GlobeTrotter</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
