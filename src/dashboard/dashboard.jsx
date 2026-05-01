import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAdminAuthed } from '../admin/RequireAdmin'
import { hasSupabaseEnv, supabase } from '../lib/supabaseClient'
import { clearStoredPasskey, isPasskeyEnabled, isPasskeySupported, registerAdminPasskey } from '../lib/passkey'
import { MdFingerprint } from 'react-icons/md'
import {
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiGrid,
  FiBriefcase,
  FiInbox,
  FiLogOut,
  FiMenu,
  FiSun,
  FiMoon,
  FiEdit2,
  FiTrash2,
  FiXCircle,
  FiEye,
  FiX,
} from 'react-icons/fi'

const THEME_KEY = 'urspi_theme'
const PASSKEY_UI_KEY = 'admin_passkey_ui'

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

function PasskeyPanel({ isNight, panelBorder, panelBg, passkeyEnabled, passkeyLoading, passkeyError, onTogglePasskey }) {
  const titleCls = isNight ? 'text-slate-100' : 'text-slate-900'
  const subCls = isNight ? 'text-slate-400' : 'text-slate-500'
  const badgeOn = isNight ? 'bg-emerald-900/40 text-emerald-200 ring-1 ring-emerald-800' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
  const badgeOff = isNight ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  const toggleDisabled = passkeyLoading || !isPasskeySupported()

  return (
    <div className={`rounded-xl border ${panelBorder} ${panelBg} p-5 shadow-sm`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                isNight ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <MdFingerprint className="text-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className={`text-sm font-semibold ${titleCls}`}>Barmoq izi</div>
              <div className={`mt-0.5 text-xs ${subCls}`}>Login sahifasida “Barmoq izi bilan kirish” funksiyasini yoqadi.</div>
            </div>

            <span
              className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                passkeyEnabled ? badgeOn : badgeOff
              }`}
            >
              {passkeyEnabled ? <FiCheckCircle aria-hidden="true" /> : <FiXCircle aria-hidden="true" />}
              {passkeyEnabled ? 'Yoqilgan' : 'O‘chirilgan'}
            </span>
          </div>

          {!isPasskeySupported() ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Bu brauzer/qurilmada passkey qo‘llab-quvvatlanmaydi yoki HTTPS/localhost kerak.
            </div>
          ) : null}

          {passkeyError ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {passkeyError}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
          <button
            type="button"
            disabled={toggleDisabled}
            onClick={() => void onTogglePasskey()}
            className={`relative inline-flex h-10 w-[72px] items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
              passkeyEnabled
                ? 'border-emerald-200 bg-emerald-500'
                : `border-slate-200 ${isNight ? 'bg-slate-800' : 'bg-slate-100'}`
            }`}
            aria-pressed={passkeyEnabled}
            aria-label="Barmoq izini yoqish/o‘chirish"
            title={toggleDisabled ? 'Bu qurilmada qo‘llab-quvvatlanmaydi' : undefined}
          >
            <span
              className={`absolute left-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm transition-transform ${
                passkeyEnabled ? 'translate-x-[32px]' : 'translate-x-0'
              }`}
            >
              {passkeyEnabled ? (
                <FiCheckCircle className="text-emerald-600" aria-hidden="true" />
              ) : (
                <FiXCircle className="text-slate-300" aria-hidden="true" />
              )}
            </span>
          </button>

          <div className={`text-[11px] font-semibold ${subCls}`}>
            {passkeyLoading ? 'Tekshirilmoqda…' : passkeyEnabled ? 'Faol' : 'Nofaol'}
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard') // dashboard | arizalar | vakansiyalar | passkey

  const [applications, setApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [dataError, setDataError] = useState('')

  const [vacancies, setVacancies] = useState([])
  const [vacancyError, setVacancyError] = useState('')
  const [vacancySaving, setVacancySaving] = useState(false)
  const [vacancyDialog, setVacancyDialog] = useState(null) // { mode: 'create'|'view'|'edit', value: vacancy }
  const [vacancyForm, setVacancyForm] = useState({ title: '', rate: '', salaryMin: '', salaryMax: '' })

  const [passkeyError, setPasskeyError] = useState('')
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return window.matchMedia?.('(min-width: 768px)')?.matches ?? true
    } catch {
      return true
    }
  })

  const [isNight, setIsNight] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'night'
    } catch {
      return false
    }
  })

  const [passkeyEnabled, setPasskeyEnabledUI] = useState(() => {
    try {
      const v = localStorage.getItem(PASSKEY_UI_KEY)
      if (v === '1' || v === '0') return v === '1'
    } catch {
      // ignore
    }
    return isPasskeyEnabled()
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
    let activeReq = true

    const loadVacancies = async () => {
      setVacancyError('')
      if (!hasSupabaseEnv || !supabase) {
        if (!activeReq) return
        setVacancies([])
        setVacancyError('Supabase sozlamalari topilmadi.')
        return
      }

      const { data, error } = await supabase.from('vacancies').select('*').order('createdAt', { ascending: false })
      if (!activeReq) return
      if (error) {
        setVacancies([])
        setVacancyError("Vakansiyalarni yuklashda xatolik bo'ldi.")
        return
      }

      setVacancies(Array.isArray(data) ? data : [])
    }

    void loadVacancies()
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

  useEffect(() => {
    try {
      localStorage.setItem(PASSKEY_UI_KEY, passkeyEnabled ? '1' : '0')
    } catch {
      // ignore
    }
  }, [passkeyEnabled])

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
    if (active === 'dashboard') return 'Admin Dashboard'
    if (active === 'arizalar') return 'Arizalar'
    if (active === 'vakansiyalar') return 'Vakansiyalar'
    return 'Biometrik kirish'
  }, [active])

  const salaryRangeText = (row) => {
    const toNum = (v) => {
      const n = typeof v === 'string' && v.trim() ? Number(v) : Number(v)
      return Number.isFinite(n) ? n : null
    }
    const min = toNum(row?.salaryMin)
    const max = toNum(row?.salaryMax)
    const fmt = (v) => (v == null ? '' : v.toLocaleString('uz-UZ'))
    if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} so'm`
    if (min != null) return `${fmt(min)}+ so'm`
    if (max != null) return `0 – ${fmt(max)} so'm`
    return '-'
  }

  const openVacancyDialog = (mode, value = null) => {
    setVacancyError('')
    setVacancyDialog({ mode, value })
    if (mode === 'create') {
      setVacancyForm({ title: '', rate: '', salaryMin: '', salaryMax: '' })
      return
    }

    const v = value ?? {}
    setVacancyForm({
      title: v.title ?? '',
      rate: v.rate ?? '',
      salaryMin: v.salaryMin ?? '',
      salaryMax: v.salaryMax ?? '',
    })
  }

  const closeVacancyDialog = () => {
    setVacancyDialog(null)
    setVacancySaving(false)
    setVacancyError('')
  }

  const saveVacancy = async () => {
    setVacancyError('')
    if (!supabase) return

    const title = String(vacancyForm.title ?? '').trim()
    if (!title) {
      setVacancyError("Vakansiya nomini kiriting.")
      return
    }

    const normNumOrNull = (v) => {
      const raw = String(v ?? '').trim()
      if (!raw) return null
      const n = Number(raw.replaceAll(' ', '').replaceAll(',', '.'))
      return Number.isFinite(n) ? n : null
    }

    const payload = {
      title,
      rate: String(vacancyForm.rate ?? '').trim() || null,
      salaryMin: normNumOrNull(vacancyForm.salaryMin),
      salaryMax: normNumOrNull(vacancyForm.salaryMax),
    }

    setVacancySaving(true)
    try {
      if (vacancyDialog?.mode === 'edit' && vacancyDialog?.value?.id != null) {
        const id = vacancyDialog.value.id
        const { data, error } = await supabase.from('vacancies').update(payload).eq('id', id).select('*').single()
        if (error) throw error
        setVacancies((prev) => prev.map((v) => (v.id === id ? data : v)))
        setVacancyDialog({ mode: 'view', value: data })
        return
      }

      const { data, error } = await supabase.from('vacancies').insert(payload).select('*').single()
      if (error) throw error
      setVacancies((prev) => [data, ...prev])
      setVacancyDialog({ mode: 'view', value: data })
    } catch (err) {
      const details = err instanceof Error ? err.message : ''
      setVacancyError(details ? `Saqlashda xatolik: ${details}` : "Saqlashda xatolik bo'ldi.")
    } finally {
      setVacancySaving(false)
    }
  }

  const deleteVacancy = async (row) => {
    if (!supabase) return
    const ok = window.confirm(`Vakansiyani o‘chirasizmi?\n\n${row?.title ?? ''}`)
    if (!ok) return

    setVacancyError('')
    const { error } = await supabase.from('vacancies').delete().eq('id', row.id)
    if (error) {
      setVacancyError("O‘chirishda xatolik bo'ldi.")
      return
    }

    setVacancies((prev) => prev.filter((v) => v.id !== row.id))
    if (vacancyDialog?.value?.id === row.id) closeVacancyDialog()
  }

  const toggleVacancyActive = async (row) => {
    if (!supabase) return
    if (!row?.id) return

    setVacancyError('')
    const next = !(row?.isActive ?? true)

    const { data, error } = await supabase
      .from('vacancies')
      .update({ isActive: next })
      .eq('id', row.id)
      .select('*')
      .single()

    if (error) {
      setVacancyError(
        error?.message
          ? `Holatni o‘zgartirishda xatolik: ${error.message}`
          : "Holatni o‘zgartirishda xatolik bo'ldi.",
      )
      return
    }

    setVacancies((prev) => prev.map((v) => (v.id === row.id ? data : v)))
    if (vacancyDialog?.value?.id === row.id) setVacancyDialog((prev) => (prev ? { ...prev, value: data } : prev))
  }

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

  const selectNav = (next) => {
    setActive(next)
    try {
      if (window.innerWidth < 768) setSidebarOpen(false)
    } catch {
      // ignore
    }
  }

  const onTogglePasskey = async () => {
    setPasskeyError('')
    if (!passkeyEnabled) {
      if (!isPasskeySupported()) {
        setPasskeyError('Bu qurilmada/passkey (barmoq izi) qo‘llab-quvvatlanmaydi.')
        return
      }

      setPasskeyLoading(true)
      try {
        await registerAdminPasskey({ username: 'admin' })
        setPasskeyEnabledUI(true)
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg === 'PASSKEY_NOT_SUPPORTED') setPasskeyError('Passkey qo‘llab-quvvatlanmaydi.')
        else setPasskeyError('Passkey yaratishda xatolik. Qayta urinib ko‘ring.')
        setPasskeyEnabledUI(false)
      } finally {
        setPasskeyLoading(false)
      }
      return
    }

    clearStoredPasskey()
    setPasskeyEnabledUI(false)
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
      <div className="relative flex min-h-screen">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Sidebar yopish"
          />
        ) : null}
        <aside
          id="admin-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r ${panelBorder} ${panelBg} overflow-hidden transition-transform duration-300 sm:w-[260px] md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-6 py-6">
            <div className={`text-sm font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>UrSPI Admin</div>
            <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Admin Panel</div>
          </div>

          <nav className="px-3">
            <button
              type="button"
              onClick={() => selectNav('dashboard')}
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
              onClick={() => selectNav('arizalar')}
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

            <button
              type="button"
              onClick={() => selectNav('vakansiyalar')}
              className={`mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                active === 'vakansiyalar'
                  ? activeNavCls
                  : inactiveNavText
              }`}
            >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${isNight ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                >
                  <FiBriefcase className="text-lg" aria-hidden="true" />
                </span>
              Vakansiyalar
            </button>

            <button
              type="button"
              onClick={() => selectNav('passkey')}
              className={`mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                active === 'passkey'
                  ? activeNavCls
                  : inactiveNavText
              }`}
            >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${isNight ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                >
                  <MdFingerprint className="text-lg" aria-hidden="true" />
                </span>
                Biometrik kirish
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
            <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6">
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

          <main className="mx-auto max-w-[1200px] px-4 py-6 md:px-6">
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
                    <div className="mt-5 grid grid-cols-3 items-end gap-3 sm:grid-cols-6">
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
            ) : active === 'arizalar' ? (
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
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[640px] w-full text-left text-sm">
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
              </div>
            ) : active === 'vakansiyalar' ? (
              <div className={`rounded-xl border ${panelBorder} ${panelBg} p-5 shadow-sm`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className={`text-sm font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>Vakansiyalar</div>
                    <div className={`mt-1 text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {vacancies.length ? 'Vakansiyalar ro‘yxati' : "Hozircha vakansiyalar yo'q"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openVacancyDialog('create')}
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <FiPlusCircle className="mr-2" aria-hidden="true" />
                    Qo‘shish
                  </button>
                </div>

                {vacancyError ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{vacancyError}</div>
                ) : null}

                <div className={`mt-5 overflow-hidden rounded-xl border ${panelBorder}`}>
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[860px] w-full text-left text-sm">
                      <thead
                        className={`text-xs font-semibold ${isNight ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}
                      >
                        <tr>
                          <th className="px-4 py-3">Nom</th>
                          <th className="px-4 py-3">Stavka</th>
                          <th className="px-4 py-3">Maosh</th>
                          <th className="px-4 py-3">Holat</th>
                          <th className="px-4 py-3 text-right">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isNight ? 'divide-slate-700 text-slate-200' : 'divide-slate-200 text-slate-700'}`}>
                        {vacancies.map((row) => (
                          <tr key={row.id} className={isNight ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}>
                            <td className="px-4 py-3 font-semibold">{row.title}</td>
                            <td className="px-4 py-3">{row.rate || '-'}</td>
                            <td className="px-4 py-3">{salaryRangeText(row)}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => void toggleVacancyActive(row)}
                                aria-pressed={!(row?.isActive === false)}
                                className={`relative inline-flex h-7 w-[52px] items-center rounded-full border transition ${
                                  row?.isActive === false
                                    ? isNight
                                      ? 'border-slate-700 bg-slate-900'
                                      : 'border-slate-200 bg-slate-100'
                                    : 'border-emerald-200 bg-emerald-500'
                                }`}
                                title={row?.isActive === false ? 'O‘chirilgan' : 'Yoqilgan'}
                              >
                                <span
                                  className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                                    row?.isActive === false ? 'translate-x-0' : 'translate-x-[22px]'
                                  }`}
                                />
                              </button>
                              <span
                                className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  row?.isActive === false
                                    ? isNight
                                      ? 'bg-slate-800 text-slate-200'
                                      : 'bg-slate-100 text-slate-700'
                                    : isNight
                                      ? 'bg-emerald-900/40 text-emerald-200 ring-1 ring-emerald-800'
                                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                }`}
                              >
                                {row?.isActive === false ? 'O‘chirilgan' : 'Yoqilgan'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openVacancyDialog('view', row)}
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                    isNight
                                      ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <FiEye className="mr-1" aria-hidden="true" />
                                  Ko‘rish
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openVacancyDialog('edit', row)}
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                    isNight
                                      ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <FiEdit2 className="mr-1" aria-hidden="true" />
                                  Tahrirlash
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deleteVacancy(row)}
                                  className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                                >
                                  <FiTrash2 className="mr-1" aria-hidden="true" />
                                  O‘chirish
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {!vacancies.length ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                              Vakansiya yo‘q.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <PasskeyPanel
                isNight={isNight}
                panelBorder={panelBorder}
                panelBg={panelBg}
                passkeyEnabled={passkeyEnabled}
                passkeyLoading={passkeyLoading}
                passkeyError={passkeyError}
                onTogglePasskey={onTogglePasskey}
              />
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

          {vacancyDialog ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" onClick={closeVacancyDialog}>
              <div
                className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${panelBorder} ${panelBg} p-6 shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className={`text-base font-semibold ${isNight ? 'text-slate-100' : 'text-slate-900'}`}>
                      {vacancyDialog.mode === 'create'
                        ? 'Vakansiya qo‘shish'
                        : vacancyDialog.mode === 'edit'
                          ? 'Vakansiyani tahrirlash'
                          : 'Vakansiya'}
                    </div>
                    <div className={`mt-1 text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {vacancyDialog.value?.id != null ? `ID: ${vacancyDialog.value.id}` : 'Yangi'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeVacancyDialog}
                    aria-label="Yopish"
                    className={`grid h-8 w-8 place-items-center rounded-full border ${
                      isNight ? 'border-slate-600 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <FiX className="text-base" aria-hidden="true" />
                  </button>
                </div>

                {vacancyError ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{vacancyError}</div>
                ) : null}

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className={`text-xs font-semibold ${isNight ? 'text-slate-300' : 'text-slate-600'}`}>
                      Vakansiya nomi <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={vacancyForm.title}
                      disabled={vacancyDialog.mode === 'view'}
                      onChange={(e) => setVacancyForm((p) => ({ ...p, title: e.target.value }))}
                      className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition ${
                        isNight ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-400' : 'border-slate-200 bg-white focus:border-emerald-500'
                      }`}
                      placeholder="Masalan: Dasturchi"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className={`text-xs font-semibold ${isNight ? 'text-slate-300' : 'text-slate-600'}`}>Stavka</span>
                    <input
                      type="text"
                      value={vacancyForm.rate}
                      disabled={vacancyDialog.mode === 'view'}
                      onChange={(e) => setVacancyForm((p) => ({ ...p, rate: e.target.value }))}
                      className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition ${
                        isNight ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-400' : 'border-slate-200 bg-white focus:border-emerald-500'
                      }`}
                      placeholder="Masalan: 1.0"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className={`text-xs font-semibold ${isNight ? 'text-slate-300' : 'text-slate-600'}`}>Maosh (min)</span>
                    <input
                      type="text"
                      value={vacancyForm.salaryMin}
                      disabled={vacancyDialog.mode === 'view'}
                      onChange={(e) => setVacancyForm((p) => ({ ...p, salaryMin: e.target.value }))}
                      className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition ${
                        isNight ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-400' : 'border-slate-200 bg-white focus:border-emerald-500'
                      }`}
                      placeholder="Masalan: 3000000"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className={`text-xs font-semibold ${isNight ? 'text-slate-300' : 'text-slate-600'}`}>Maosh (max)</span>
                    <input
                      type="text"
                      value={vacancyForm.salaryMax}
                      disabled={vacancyDialog.mode === 'view'}
                      onChange={(e) => setVacancyForm((p) => ({ ...p, salaryMax: e.target.value }))}
                      className={`w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition ${
                        isNight ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-400' : 'border-slate-200 bg-white focus:border-emerald-500'
                      }`}
                      placeholder="Masalan: 6000000"
                    />
                  </label>

                  <div className="md:col-span-2">
                    <div className={`text-[11px] font-semibold ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>Ko‘rinishi</div>
                    <div className={`mt-1 rounded-xl border px-4 py-3 text-sm ${isNight ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                      <div className="font-semibold">{String(vacancyForm.title || '-')}</div>
                      <div className="mt-1 text-xs opacity-80">
                        {vacancyForm.rate ? `Stavka: ${vacancyForm.rate} • ` : ''}
                        {salaryRangeText({ salaryMin: vacancyForm.salaryMin, salaryMax: vacancyForm.salaryMax })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    {vacancyDialog.mode === 'view' && vacancyDialog.value ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openVacancyDialog('edit', vacancyDialog.value)}
                          className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold ${
                            isNight ? 'border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <FiEdit2 className="mr-2" aria-hidden="true" />
                          Tahrirlash
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteVacancy(vacancyDialog.value)}
                          className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <FiTrash2 className="mr-2" aria-hidden="true" />
                          O‘chirish
                        </button>
                      </>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closeVacancyDialog}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        isNight ? 'border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Yopish
                    </button>

                    {vacancyDialog.mode !== 'view' ? (
                      <button
                        type="button"
                        onClick={() => void saveVacancy()}
                        disabled={vacancySaving}
                        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {vacancySaving ? 'Saqlanmoqda…' : 'Saqlash'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

