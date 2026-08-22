import { NavLink, useNavigate } from 'react-router-dom'
import {
  Globe, LayoutDashboard, Map, PlusCircle, Compass,
  User, Settings, LogOut, ShieldCheck, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { clsx } from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trips', icon: Map, label: 'My Trips' },
  { to: '/trips/new', icon: PlusCircle, label: 'New Trip' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-navy-800/80 border-r border-white/8 backdrop-blur-sm flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center transition-all group-hover:shadow-glow-teal">
            <Globe className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-none">GlobeTrotter</div>
            <div className="text-xs text-slate-500 mt-0.5">Travel Planner</div>
          </div>
        </NavLink>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/trips'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-teal-500/10 text-teal-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-white')} style={{ width: '18px', height: '18px' }} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-1',
                isActive ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <ShieldCheck style={{ width: '18px', height: '18px' }} className="text-amber-500 flex-shrink-0" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/8 space-y-1">
        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
          <Settings style={{ width: '14px', height: '14px' }} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
