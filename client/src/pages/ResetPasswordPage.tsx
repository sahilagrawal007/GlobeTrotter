import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import { useResetPassword } from '../hooks/useAuth'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const resetPassword = useResetPassword()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ resetToken: string; newPassword: string }>()
  const [done, setDone] = useState(false)

  const onSubmit = async (data: { resetToken: string; newPassword: string }) => {
    await resetPassword.mutateAsync(data)
    setDone(true)
    setTimeout(() => navigate('/login'), 2000)
  }

  if (done) return (
    <div className="text-center">
      <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white">Password reset!</h2>
      <p className="text-slate-400 mt-2">Redirecting to login…</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
      <p className="text-slate-400 text-sm mb-8">Enter the reset token from your email and a new password.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Reset token</label>
          <input {...register('resetToken')} placeholder="Paste your reset token" className="input" id="reset-token" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input {...register('newPassword')} type="password" placeholder="Min 6 characters" className="input pl-10" id="reset-password" required minLength={6} />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-11">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset password'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="text-teal-400 hover:text-teal-300">Back to login</Link>
      </p>
    </div>
  )
}
