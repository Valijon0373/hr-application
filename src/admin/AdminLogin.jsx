import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isAdminAuthed, setAdminAuthed } from './RequireAdmin'
import urspiLogo from '../assets/urspi.jpg'

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const from = useMemo(() => {
    const p = location.state?.from
    return typeof p === 'string' && p.startsWith('/admin') ? p : '/admin/dashboard'
  }, [location.state])

  useEffect(() => {
    if (!isAdminAuthed()) return
    navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')

    const ok = login.trim() === 'admin' && password === 'admin'
    if (!ok) {
      setError("Login yoki parol noto'g'ri.")
      return
    }

    setAdminAuthed(true)
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <div className="mx-auto flex min-h-screen max-w-[1100px] items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] border border-slate-200 bg-white shadow-sm">
          <div className="px-10 pb-8 pt-10">
            <div className="flex flex-col items-center text-center">
              <img
                src={urspiLogo}
                alt="UrSPI"
                className="h-16 w-16 rounded-full border border-slate-200 object-cover"
              />
              <div className="mt-4 text-2xl font-semibold text-slate-900">UrSPI Admin</div>
              <div className="mt-1 text-xs text-slate-500">
                Admin foydalanuvchining hisobini kiriting
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Login</span>
                <input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  type="text"
                  placeholder="Loginni kiriting"
                  className="h-10 w-full border border-slate-200 px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Parol</span>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Parolni kiriting"
                    className="h-10 w-full border border-slate-200 px-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    </svg>
                  </button>
                </div>
              </label>

              {error ? (
                <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-2 h-10 w-full bg-[#2463eb] text-sm font-semibold text-white transition hover:bg-[#1e56d2]"
              >
                Kirish
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

