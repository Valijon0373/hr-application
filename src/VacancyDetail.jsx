import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from './components/navbar'
import Footer from './components/footer'
import { copy } from './lang'
import { hasSupabaseEnv, supabase } from './lib/supabaseClient'
import { formatCreatedAt, mapVacancyToView } from './lib/vacancyUtils'

function DetailBlock({ label, value }) {
  if (!value) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{value}</div>
    </div>
  )
}

function VacancyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lang, setLang] = useState('uz')
  const [vacancy, setVacancy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const c = copy[lang]
  const v = mapVacancyToView(vacancy)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')

      if (!hasSupabaseEnv || !supabase) {
        if (!active) return
        setVacancy(null)
        setLoading(false)
        setError('Supabase sozlamalari topilmadi.')
        return
      }

      const { data, error: err } = await supabase.from('vacancies').select('*').eq('id', id).maybeSingle()
      if (!active) return

      if (err || !data || data.isActive === false) {
        setVacancy(null)
        setLoading(false)
        setError(err ? "Vakansiyani yuklashda xatolik bo'ldi." : 'Vakansiya topilmadi.')
        return
      }

      setVacancy(data)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [id])

  const hasDetails = v && (v.description || v.requirements)

  return (
    <div className="flex min-h-screen flex-col bg-[#d9e3f2]">
      <Navbar lang={lang} setLang={setLang} c={c} />

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-[900px]">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-8 space-y-3">
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          ) : error || !v ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700">{error}</div>
          ) : (
            <>
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#10b9ff] via-[#075b9d] to-[#062447] p-6 text-white shadow-[0_18px_36px_rgba(25,45,78,0.18)] md:p-8">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/70">{c.vacancyInfoTitle}</div>
                <h1 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">{v.title}</h1>
                {v.createdAt ? (
                  <p className="mt-2 text-sm text-white/80">
                    {c.createdAtLabel}: {formatCreatedAt(v.createdAt)}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {v.workSchedule ? (
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                      {c.workScheduleLabel}: {v.workSchedule}
                    </span>
                  ) : null}
                  {v.rate ? (
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                      {c.rateLabel}: {v.rate}
                    </span>
                  ) : null}
                  {v.salaryText ? (
                    <span className="inline-flex rounded-full bg-emerald-400/25 px-3 py-1.5 text-sm font-semibold ring-1 ring-white/20">
                      {c.salaryLabel}: {v.salaryText}
                    </span>
                  ) : null}
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm md:p-8">
                <div className="text-lg font-semibold text-slate-900">{c.vacancyDetailsTitle}</div>
                <div className="mt-4 space-y-3">
                  <DetailBlock label={c.descriptionLabel} value={v.description} />
                  <DetailBlock label={c.requirementsLabel} value={v.requirements} />
                </div>
                {!hasDetails ? <p className="mt-4 text-sm text-slate-500">{c.vacancyDetailsEmpty}</p> : null}
              </section>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {c.back}
                </Link>
                <button
                  type="button"
                  onClick={() => navigate(`/apply/${v.id}`, { state: { vacancyTitle: v.title } })}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#16cbff] to-[#10c968] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(23,196,171,0.35)] transition hover:brightness-105"
                >
                  {c.apply}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default VacancyDetail
