import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../store/AuthContext'
import toast from 'react-hot-toast'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950/40 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/30">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────
export function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: 'test@dashboard.com', password: 'Admin@123' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Commerce Analytics" subtitle="Sign in to your dashboard">
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {/* Demo credentials hint */}
        <p className="text-center text-xs text-slate-500">
          Demo: test@dashboard.com / Admin@123
        </p>
        <p className="text-center text-xs text-teal-500 font-bold mt-2">
          Verify Build: v8a801d7
        </p>

        <div className="divider my-4" />

        <p className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ── REGISTER ──────────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]     = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password })
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    className: 'w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent',
  })

  return (
    <AuthLayout title="Create Account" subtitle="Start analyzing your commerce data">
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
          <input type="text" placeholder="Jane Doe" required {...field('full_name')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
          <input type="email" placeholder="you@company.com" required {...field('email')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" required {...field('password')} />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <input type="password" placeholder="Repeat password" required {...field('confirm')} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
