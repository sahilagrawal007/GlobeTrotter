import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useForgotPassword } from '../hooks/useAuth'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>()
  const forgotPassword = useForgotPassword()
  const [sent, setSent] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const onSubmit = async ({ email }: { email: string }) => {
    const result = await forgotPassword.mutateAsync({ email })
    setToken(result.resetToken)
    setSent(true)
  }

  if (sent) return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-10 h-10 text-teal-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Check your email</h1>
          <p className="text-slate-400 text-sm">Password reset instructions sent</p>
        </div>
      </div>
      {token && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
          <p className="text-xs text-amber-400 font-medium mb-1">🔧 Dev mode - reset token:</p>
          <code className="text-xs text-white break-all">{token}</code>
        </div>
      )}
      <Link to="/reset-password" className="btn-primary w-full block text-center">
        Go to Reset Password
      </Link>
    </div>
  )

  return (
    <div>
      <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">Forgot password?</h1>
      <p className="text-slate-400 text-sm mb-8">Enter your email and we'll send a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-10" id="forgot-email" required />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-11">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
