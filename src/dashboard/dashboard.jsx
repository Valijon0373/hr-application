import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAdminAuthed } from '../admin/RequireAdmin'
import { hasSupabaseEnv, supabase } from '../lib/supabaseClient'
import {
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiGrid,
  FiInbox,
  FiLogOut,
  FiMenu,
  FiSun,
  FiMoon,
  FiXCircle,
  FiEye,
  FiX,
} from 'react-icons/fi'

const THEME_KEY = 'urspi_theme'

function StatCard({ title, value, accentClass, isNight }) {
  const containerCls = isNight ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
  const titleCls = isNight ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className={`rounded-xl border ${containerCls} p-4 shadow-sm`}>
      <div className={`text-xs font-semibold ${titleCls}`}>{title}</div>
      <div className={`mt-2 text-2xl font-bold ${accentClass}`}>{value}</div>
    </div>
  )
}

function StatusCard({ title, value, icon, accentClass, isNight }) {
  const containerCls = isNight ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
  const titleCls = isNight ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className={`rounded-xl border ${containerCls} p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={`text-xs font-semibold ${titleCls}`}>{title}</div>
        <div className={`text-lg ${accentClass}`}>{icon}</div>
      </div>
      <div className={`mt-2 text-2xl font-bold ${accentClass}`}>{value}</div>
    </div>
  )
}

function StatusPill({ statusKey }) {
  const map = {
    yangi: { text: 'Yangi', cls: 'bg-blue-50 text-blue-700 ring-blue-100', icon: <FiPlusCircle /> },
    qabul: { text: 'Qabul qilingan', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100', icon: <FiCheckCircle /> },
    jarayonda: { text: 'Jarayonda', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-100', icon: <FiClock /> },
    rad: { text: 'Rad etilgan', cls: 'bg-red-50 text-red-700 ring-red-100', icon: <FiXCircle /> },
  }

  const item = map[statusKey] ?? map.jarayonda

  return (
    <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold ring-1 ${item.cls}`}>
      <span className="text-sm">{item.icon}</span>
      {item.text}
    </span>
  )
}

function StatusSelect({ value, onChange }) {
  const options = [
    { key: 'yangi', label: 'Yangi', icon: <FiPlusCircle aria-hidden="true" /> },
    { key: 'jarayonda', label: 'Jarayonda', icon: <FiClock aria-hidden="true" /> },
    { key: 'qabul', label: 'Qabul qilindi', icon: <FiCheckCircle aria-hidden="true" /> },
    { key: 'rad', label: 'Rad etilgan', icon: <FiXCircle aria-hidden="true" /> },
  ]

  const active = options.find((o) => o.key === value) ?? options[0]
  const activeMap = {
    yangi: 'bg-blue-50 text-blue-700 ring-blue-100',
    qabul: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    jarayonda: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
    rad: 'bg-red-50 text-red-700 ring-red-100',
  }
  const activeCls = activeMap[value] ?? activeMap.yangi

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ${activeCls}`}>
      <span className="text-sm">{active.icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-auto bg-transparent text-xs font-semibold text-current outline-none"
      >
        {options.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard') // dashboard | arizalar

  const [applications, setApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [dataError, setDataError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [isNight, setIsNight] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'night'
    } catch {
      return false
    }
  })

  useEffect(() => {
    let activeReq = true

    const loadApplications = async () => {
      if (!hasSupabaseEnv || !supabase) {
        setDataError('Supabase sozlamalari topilmadi.')
        setApplications([])
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('createdAt', { ascending: false })

      if (!activeReq) return
      if (error) {
        setDataError("Ma'lumotlarni yuklashda xatolik bo'ldi.")
        setApplications([])
        return
      }

      setDataError('')
      setApplications(Array.isArray(data) ? data : [])
    }

    void loadApplications()
    return () => {
      activeReq = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isNight ? 'night' : 'light')
    } catch {
      // ignore
    }

    try {
      document.documentElement.classList.toggle('dark', isNight)
    } catch {
      // ignore
    }
  }, [isNight])

  const statusCounts = useMemo(() => {
    const total = applications.length
    const qabul = applications.filter((a) => a.statusKey === 'qabul').length
    const jarayonda = applications.filter((a) => a.statusKey === 'jarayonda').length
    const rad = applications.filter((a) => a.statusKey === 'rad').length
    return { total, qabul, jarayonda, rad }
  }, [applications])

  const pieAndBarData = useMemo(() => {
    const qabul = statusCounts.qabul
    const jarayonda = statusCounts.jarayonda
    const rad = statusCounts.rad

    const pieTotal = qabul + jarayonda + rad
    const isEmpty = pieTotal === 0

    const qabulPct = isEmpty ? 0 : (qabul / pieTotal) * 100
    const jarayondaPct = isEmpty ? 0 : (jarayonda / pieTotal) * 100
    const radPct = isEmpty ? 0 : (rad / pieTotal) * 100

    const toDeg = (pct) => (pct / 100) * 360
    const degQabul = isEmpty ? 0 : toDeg(qabulPct)
    const degJarayonda = isEmpty ? 0 : toDeg(jarayondaPct)

    const gradient = isEmpty
      ? 'conic-gradient(#94a3b8_0_360deg)'.replaceAll('_', ' ')
      : `conic-gradient(#10c968_0_${degQabul}deg,#f59e0b_${degQabul}deg_${degQabul + degJarayonda}deg,#ef4444_${degQabul + degJarayonda}deg_360deg)`.replaceAll(
          '_',
          ' ',
        )

    // Oyma-oy arizalar soni (so‘nggi 6 oy)
    const monthKeyUTC = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const monthLabelUTC = (d) => `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCFullYear()).slice(-2)}`
    const monthsBack = 6
    const now = new Date()

    const countsByMonth = applications.reduce((acc, a) => {
      if (!a?.createdAt) return acc
      const dt = new Date(a.createdAt)
      if (Number.isNaN(dt.getTime())) return acc

      const key = monthKeyUTC(dt)
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    const monthlyItems = Array.from({ length: monthsBack }, (_, idx) => {
      const monthsAgo = monthsBack - 1 - idx
      const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1))
      const key = monthKeyUTC(dt)
      return { key, label: monthLabelUTC(dt), value: countsByMonth[key] ?? 0 }
    })

    const maxBarValue = Math.max(...monthlyItems.map((i) => i.value), 1)

    return {
      gradient,
      pieItems: [
        { key: 'rad', label: 'Rad etilgan', value: rad, pct: Math.round(radPct) },
        { key: 'qabul', label: 'Qabul qilingan', value: qabul, pct: Math.round(qabulPct) },
        { key: 'jarayonda', label: 'Jarayonda', value: jarayonda, pct: Math.round(jarayondaPct) },
      ],
      monthlyItems,
      maxBarValue,
    }
  }, [statusCounts, applications])

  const headerTitle = useMemo(() => {
    return active === 'dashboard' ? 'Admin Dashboard' : 'Arizalar'
  }, [active])

  const handleStatusChange = async (id, next) => {
    if (!supabase) return

    const { error } = await supabase.from('applications').update({ statusKey: next }).eq('id', id)
    if (error) return

    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, statusKey: next } : a)))
    setSelectedApplication((prev) => (prev && prev.id === id ? { ...prev, statusKey: next } : prev))
  }

  const onLogout = () => {
    setAdminAuthed(false)
    navigate('/login', { replace: true })
  }

  const pageBg = isNight ? 'bg-slate-950' : 'bg-[#f3f6fb]'
  const panelBorder = isNight ? 'border-slate-800' : 'border-slate-200'
  const panelBg = isNight ? 'bg-slate-900' : 'bg-white'
  const headerBorder = panelBorder
  const headerBg = panelBg
  const inactiveNavText = isNight ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
  const activeNavCls = isNight ? 'bg-emerald-900/40 text-emerald-200 ring-1 ring-emerald-800' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <div className="flex min-h-screen">
        <aside
          id="admin-sidebar"
          className={`flex flex-col ${sidebarOpen ? 'w-[260px] border-r' : 'w-0 border-r-0'} ${panelBorder} ${panelBg} overflow-hidden transition-all duration-300`}
        >
          <div className="px-6 py-6">
            <div className={`text-sm font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>UrSPI Admin</div>
            <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Admin Panel</div>
          </div>

          <nav className="px-3">
            <button
              type="button"
              onClick={() => setActive('dashboard')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                active === 'dashboard'
                  ? activeNavCls
                  : inactiveNavText
              }`}
            >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${isNight ? 'bg-emerald-900/60 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  <FiGrid className="text-lg" aria-hidden="true" />
                </span>
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActive('arizalar')}
              className={`mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                active === 'arizalar'
                  ? activeNavCls
                  : inactiveNavText
              }`}
            >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${isNight ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                >
                  <FiFileText className="text-lg" aria-hidden="true" />
                </span>
              Arizalar
            </button>
          </nav>

          <div className="mt-auto px-3 pb-4">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <FiLogOut className="mr-2 inline-block translate-y-[-1px]" aria-hidden="true" />
              Chiqish
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className={`border-b ${headerBorder} ${headerBg}`}>
            <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`grid h-10 w-10 place-items-center rounded-xl border ${panelBorder} ${panelBg} ${
                    isNight ? 'text-slate-200' : 'text-slate-700'
                  } shadow-sm`}
                  aria-label="Menu"
                  aria-expanded={sidebarOpen}
                  aria-controls="admin-sidebar"
                  onClick={() => setSidebarOpen((v) => !v)}
                >
                  <FiMenu className="text-lg" aria-hidden="true" />
                </button>
                <div className={`text-lg font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>
                  {headerTitle}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`grid h-10 w-10 place-items-center rounded-xl border ${panelBorder} ${panelBg} ${
                    isNight ? 'text-slate-200' : 'text-slate-700'
                  } shadow-sm`}
                  aria-label="Tungi rejim"
                  onClick={() => setIsNight((v) => !v)}
                >
                  {isNight ? <FiSun className="text-lg" aria-hidden="true" /> : <FiMoon className="text-lg" aria-hidden="true" />}
                </button>

                <div
                  className={`flex items-center gap-2 rounded-xl border ${panelBorder} ${panelBg} px-3 py-2 shadow-sm`}
                >
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-full ${
                      isNight ? 'bg-indigo-900/40 text-sm font-bold text-indigo-200' : 'bg-indigo-100 text-sm font-bold text-indigo-700'
                    }`}
                  >
                    AD
                  </div>
                  <div className={`text-sm font-semibold ${isNight ? 'text-slate-200' : 'text-slate-700'}`}>admin</div>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1200px] px-6 py-6">
            {dataError ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {dataError}
              </div>
            ) : null}
            {active === 'dashboard' ? (
              <>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <StatusCard
                    title="Jami"
                    value={statusCounts.total}
                    icon={<FiInbox aria-hidden="true" />}
                    accentClass={isNight ? 'text-slate-200' : 'text-slate-700'}
                    isNight={isNight}
                  />
                  <StatusCard
                    title="Qabul qilingan"
                    value={statusCounts.qabul}
                    icon={<FiCheckCircle aria-hidden="true" />}
                    accentClass={isNight ? 'text-emerald-300' : 'text-emerald-700'}
                    isNight={isNight}
                  />
                  <StatusCard
                    title="Jarayonda"
                    value={statusCounts.jarayonda}
                    icon={<FiClock aria-hidden="true" />}
                    accentClass={isNight ? 'text-yellow-300' : 'text-yellow-700'}
                    isNight={isNight}
                  />
                  <StatusCard
                    title="Rad etilgan"
                    value={statusCounts.rad}
                    icon={<FiXCircle aria-hidden="true" />}
                    accentClass={isNight ? 'text-red-300' : 'text-red-700'}
                    isNight={isNight}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className={`rounded-xl border ${panelBorder} ${panelBg} p-5 shadow-sm`}>
                    <div className={`text-sm font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>
                      Arizalar holati taqsimoti
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      <div className="relative h-44 w-44 rounded-full bg-emerald-400/90">
                        <div className="absolute inset-0 rounded-full" style={{ background: pieAndBarData.gradient }} />
                        <div className={`absolute inset-0 m-[18px] rounded-full ${isNight ? 'bg-slate-900' : 'bg-white'}`} />
                      </div>
                    </div>
                    <div
                      className={`mt-4 flex items-center justify-between text-xs ${
                        isNight ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {pieAndBarData.pieItems.map((it) => (
                        <div key={it.key} className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              background:
                                it.key === 'qabul' ? '#10c968' : it.key === 'jarayonda' ? '#f59e0b' : '#ef4444',
                            }}
                          />
                          <span>
                            {it.label}: {it.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-xl border ${panelBorder} ${panelBg} p-5 shadow-sm`}>
                    <div className={`text-sm font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>
                      Oyma-oy arizalar soni
                    </div>
                    <div className="mt-5 grid grid-cols-6 items-end gap-3">
                      {pieAndBarData.monthlyItems.map((it) => {
                        const maxBarHeight = 130
                        const height =
                          it.value === 0 ? 0 : Math.max(8, (it.value / pieAndBarData.maxBarValue) * maxBarHeight)

                        return (
                          <div key={it.key} className="flex flex-col items-center gap-2">
                            <div
                              className={`w-full rounded-lg ${it.value ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-700'}`}
                              style={{ height }}
                            />
                            <div className={`text-center text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{it.label}</div>
                            <div className={`text-center text-[12px] font-semibold ${isNight ? 'text-emerald-300' : 'text-emerald-700'}`}>
                              {it.value}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={`rounded-xl border ${panelBorder} ${panelBg} p-5 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>Arizalar</div>
                    <div className={`mt-1 text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {applications.length ? 'Arizalar ro‘yxati' : "Hozircha arizalar yo'q"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <StatusCard
                    title="Jami"
                    value={statusCounts.total}
                    icon={<FiInbox aria-hidden="true" />}
                    accentClass={isNight ? 'text-slate-200' : 'text-slate-700'}
                    isNight={isNight}
                  />
                  <StatusCard
                    title="Qabul qilingan"
                    value={statusCounts.qabul}
                    icon={<FiCheckCircle aria-hidden="true" />}
                    accentClass={isNight ? 'text-emerald-300' : 'text-emerald-700'}
                    isNight={isNight}
                  />
                  <StatusCard
                    title="Jarayonda"
                    value={statusCounts.jarayonda}
                    icon={<FiClock aria-hidden="true" />}
                    accentClass={isNight ? 'text-yellow-300' : 'text-yellow-700'}
                    isNight={isNight}
                  />
                  <StatusCard
                    title="Rad etilgan"
                    value={statusCounts.rad}
                    icon={<FiXCircle aria-hidden="true" />}
                    accentClass={isNight ? 'text-red-300' : 'text-red-700'}
                    isNight={isNight}
                  />
                </div>

                <div className={`mt-5 overflow-hidden rounded-xl border ${panelBorder}`}>
                  <table className="w-full text-left text-sm">
                    <thead
                      className={`text-xs font-semibold ${
                        isNight ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      <tr>
                        <th className="px-4 py-3">F.I.O</th>
                        <th className="px-4 py-3">Telefon</th>
                        <th className="px-4 py-3 text-center">Ma'lumot</th>
                        <th className="px-4 py-3">Holat</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${isNight ? 'divide-slate-700 text-slate-200' : 'divide-slate-200 text-slate-700'}`}
                    >
                      {applications.map((row) => (
                        <tr
                          key={row.id}
                          className={isNight ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}
                        >
                          <td className="px-4 py-3 font-semibold">{row.fio}</td>
                          <td className="px-4 py-3">{row.phone}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedApplication(row)}
                              className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                isNight
                                  ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <FiEye className="mr-1" aria-hidden="true" />
                              Ko‘rish
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill statusKey={row.statusKey} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>

          {selectedApplication && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
              onClick={() => setSelectedApplication(null)}
            >
              <div
                className={`max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border ${panelBorder} ${panelBg} p-6 shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`text-base font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>
                      {selectedApplication.fio}
                    </div>
                    <div className={`mt-1 text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                      ID: {selectedApplication.id ?? '-'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    aria-label="Yopish"
                    className={`grid h-8 w-8 place-items-center rounded-full border ${
                      isNight
                        ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <FiX className="text-base" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">F.I.O</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.fio}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Tug‘ilgan sanasi</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.dob || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Viloyat</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.region || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Tuman / shahar</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.district || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Telefon raqami</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.phone || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">E-mail</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.email || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Oliy ta’lim muassasasi</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.higherEd || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Tugatgan yili</div>
                    <div className={isNight ? 'text-slate-100' : 'text-slate-800'}>
                      {selectedApplication.gradYear || '-'}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Bakalavr diplomi</div>
                    {selectedApplication.bachelorFile ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        <a
                          href={selectedApplication.bachelorFile}
                          download
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Yuklab olish
                        </a>
                        <a
                          href={selectedApplication.bachelorFile}
                          target="_blank"
                          rel="noreferrer"
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            isNight
                              ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Ko‘rish
                        </a>
                      </div>
                    ) : (
                      <div className={isNight ? 'text-slate-500' : 'text-slate-400'}>-</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Magistr diplomi (ixtiyoriy)</div>
                    {selectedApplication.masterFile ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        <a
                          href={selectedApplication.masterFile}
                          download
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Yuklab olish
                        </a>
                        <a
                          href={selectedApplication.masterFile}
                          target="_blank"
                          rel="noreferrer"
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            isNight
                              ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Ko‘rish
                        </a>
                      </div>
                    ) : (
                      <div className={isNight ? 'text-slate-500' : 'text-slate-400'}>-</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">PHD yoki DSC diplomi (ixtiyoriy)</div>
                    {selectedApplication.phdFile ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        <a
                          href={selectedApplication.phdFile}
                          download
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Yuklab olish
                        </a>
                        <a
                          href={selectedApplication.phdFile}
                          target="_blank"
                          rel="noreferrer"
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            isNight
                              ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Ko‘rish
                        </a>
                      </div>
                    ) : (
                      <div className={isNight ? 'text-slate-500' : 'text-slate-400'}>-</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Til sertifikat (fayl)</div>
                    {selectedApplication.langCertFile ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        <a
                          href={selectedApplication.langCertFile}
                          download
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Yuklab olish
                        </a>
                        <a
                          href={selectedApplication.langCertFile}
                          target="_blank"
                          rel="noreferrer"
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            isNight
                              ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Ko‘rish
                        </a>
                      </div>
                    ) : (
                      <div className={isNight ? 'text-slate-500' : 'text-slate-400'}>-</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Ob'ektivka / CV (fayl)</div>
                    {selectedApplication.cvFile ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        <a
                          href={selectedApplication.cvFile}
                          download
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Yuklab olish
                        </a>
                        <a
                          href={selectedApplication.cvFile}
                          target="_blank"
                          rel="noreferrer"
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            isNight
                              ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Ko‘rish
                        </a>
                      </div>
                    ) : (
                      <div className={isNight ? 'text-slate-500' : 'text-slate-400'}>-</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <div className="mb-2 text-xs font-semibold text-slate-400">Statusni o‘zgartirish</div>
                  <StatusSelect
                    value={selectedApplication.statusKey || 'yangi'}
                    onChange={(next) => handleStatusChange(selectedApplication.id, next)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

