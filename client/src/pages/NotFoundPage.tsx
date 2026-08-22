import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-8">
      <div className="text-center animate-fade-in">
        <div className="text-7xl font-black text-gradient mb-4">404</div>
        <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8">Looks like this destination doesn't exist on the map.</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
