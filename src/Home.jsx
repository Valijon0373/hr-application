import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './components/navbar'
import Footer from './components/footer'
import { copy } from './lang'
import { hasSupabaseEnv, supabase } from './lib/supabaseClient'

function formatSalaryRange({ min, max, currency = "so'm" }) {
  const fmt = (v) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return ''
    return n.toLocaleString('uz-UZ')
  }

  const a = fmt(min)
  const b = fmt(max)
  if (a && b) return `${a} – ${b} ${currency}`
  if (a) return `${a}+ ${currency}`
  if (b) return `0 – ${b} ${currency}`
  return ''
}

function formatCreatedAt(value) {
  if (!value) return ''
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return ''
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function Home() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('uz')
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const c = copy[lang]
  const workScheduleText = '6/1, 08:00 - 17:00'

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')

      if (!hasSupabaseEnv || !supabase) {
        if (!active) return
        setVacancies([])
        setLoading(false)
        setError('Supabase sozlamalari topilmadi. .env faylni to‘ldiring.')
        return
      }

      const { data, error: err } = await supabase.from('vacancies').select('*').order('createdAt', { ascending: false })
      if (!active) return

      if (err) {
        setVacancies([])
        setLoading(false)
        setError("Vakansiyalarni yuklashda xatolik bo'ldi.")
        return
      }

      setVacancies(Array.isArray(data) ? data : [])
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const cards = useMemo(() => {
    return vacancies
      .filter((v) => v?.isActive !== false)
      .map((v) => {
      const salaryText = formatSalaryRange({ min: v.salaryMin, max: v.salaryMax })
      return {
        id: v.id,
        title: v.title ?? '-',
        rate: v.rate ?? '',
        salaryText,
        createdAt: v.createdAt ?? '',
      }
    })
  }, [vacancies])

  return (
    <div className="flex min-h-screen flex-col bg-[#d9e3f2]">
      <Navbar lang={lang} setLang={setLang} c={c} />

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[24px] bg-white shadow-[0_22px_44px_rgba(25,45,78,0.2)]">
          <div className="grid grid-cols-1 md:grid-cols-[360px_1fr]">
            <aside className="relative overflow-hidden bg-gradient-to-b from-[#10b9ff] via-[#075b9d] to-[#062447] p-8 text-white">
              <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_left,_#4ee5ff,_transparent_45%),radial-gradient(circle_at_bottom_right,_#32b7ff,_transparent_40%)]" />
              <div className="relative z-10">
                <h1 className="text-3xl font-semibold leading-tight">{c.homeTitle}</h1>
                <p className="mt-3 text-sm text-white/80">{c.homeSubtitle}</p>

                <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5">
                  <div className="text-center text-sm font-semibold">{c.quickApplyTitle}</div>
                  <div className="mt-2 text-center text-xs text-white/80">{c.quickApplyBody}</div>
                  <button
                    type="button"
                    onClick={() => navigate('/apply')}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#16cbff] to-[#10c968] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(23,196,171,0.35)] transition hover:brightness-105"
                  >
                    {c.applyNow}
                  </button>
                </div>
              </div>
            </aside>

            <section className="p-6 md:p-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold text-slate-900">{c.vacanciesTitle}</div>
                  <div className="mt-1 text-sm text-slate-500">{c.vacanciesSubtitle}</div>
                </div>
              </div>

              {error ? (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
              ) : null}

              {loading ? (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="mt-6 h-10 w-36 animate-pulse rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : cards.length ? (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {cards.map((v) => (
                    <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-lg font-semibold text-slate-900">{v.title}</div>
                          {v.createdAt ? (
                            <div className="mt-1 text-sm font-medium text-slate-500">
                              {c.createdAtLabel}: {formatCreatedAt(v.createdAt)}
                            </div>
                          ) : null}
                          <div className="mt-2 flex flex-wrap items-center gap-2 font-semibold text-slate-600">
                            <div className="flex flex-wrap items-center gap-2">
                              {v.rate ? (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm">
                                  {c.rateLabel}: {v.rate}
                                </span>
                              ) : null}
                              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-sm text-sky-700">
                                {c.workScheduleLabel}: {workScheduleText}
                              </span>
                            </div>

                            {v.salaryText ? (
                              <div className="w-full">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-base font-semibold text-emerald-700">
                                  {c.salaryLabel}: {v.salaryText}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => navigate('/apply', { state: { vacancyId: v.id, vacancyTitle: v.title } })}
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#16cbff] to-[#10c968] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(23,196,171,0.35)] transition hover:brightness-105"
                        >
                          {c.apply}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-medium text-slate-600">
                  {c.vacanciesEmpty}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Home

