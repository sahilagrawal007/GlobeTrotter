import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { loginSchema, type LoginInput } from '@globetrotter/shared'
import { useLogin } from '../hooks/useAuth'
import { ApiError } from '../api/apiClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      await login.mutateAsync(data)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError('root', { message: err.message })
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-slate-400">Sign in to your GlobeTrotter account</p>
      </div>

      {/* Demo credentials hint */}
      <div className="mb-6 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
        <p className="text-xs text-teal-400 font-medium">🔑 Demo: demo@globetrotter.app / password123</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input pl-10"
              id="login-email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-teal-400 hover:text-teal-300">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="input pl-10"
              id="login-password"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {errors.root && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{errors.root.message}</p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2 h-11">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-medium">Create one</Link>
      </p>
    </div>
  )
}
