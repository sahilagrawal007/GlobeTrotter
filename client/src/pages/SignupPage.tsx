import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react'
import { signupSchema, type SignupInput } from '@globetrotter/shared'
import { useSignup } from '../hooks/useAuth'
import { ApiError } from '../api/apiClient'

export default function SignupPage() {
  const navigate = useNavigate()
  const signup = useSignup()

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    try {
      await signup.mutateAsync(data)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'CONFLICT') setError('email', { message: 'Email already registered' })
        else setError('root', { message: err.message })
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
        <p className="text-slate-400">Start planning your next adventure</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input {...register('name')} placeholder="Sahil Agrawal" className="input pl-10" id="signup-name" />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-10" id="signup-email" />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input {...register('password')} type="password" placeholder="Min 6 characters" className="input pl-10" id="signup-password" />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {errors.root && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{errors.root.message}</p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2 h-11">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create account</span><ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
