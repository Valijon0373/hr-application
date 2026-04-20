import { useEffect, useState } from 'react'
import { copy } from './lang'
import Navbar from './components/navbar'
import Footer from './components/footer'
import { hasSupabaseEnv, supabase } from './lib/supabaseClient'

// Format phone number as +998 XX XXX XX XX
const formatPhoneNumber = (input) => {
  const digits = String(input ?? '').replace(/\D/g, '')

  // Keep UI prefix always visible: "+998 "
  const COUNTRY = '998'

  // Strip possible country prefix from user typing/paste
  let local = digits
  if (local.startsWith(COUNTRY)) local = local.slice(COUNTRY.length)

  // Keep only 9 local digits (XX XXX XX XX)
  local = local.slice(0, 9)

  const a = local.slice(0, 2)
  const b = local.slice(2, 5)
  const c = local.slice(5, 7)
  const d = local.slice(7, 9)

  const parts = [a, b, c, d].filter(Boolean)
  return parts.length ? `+${COUNTRY} ${parts.join(' ')}` : `+${COUNTRY} `
}

function PublicForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [lang, setLang] = useState('uz')
  const [formData, setFormData] = useState({
    fio: '',
    dob: '',
    region: '',
    district: '',
    phone: '',
    email: '',
    higherEd: '',
    gradYear: '',
    bachelorFile: null,
    masterFile: null,
    phdFile: null,
    langCertFile: null,
    cvFile: null,
  })
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)

  const c = copy[lang]
  const requiredFields = ['fio', 'dob', 'region', 'district', 'phone', 'email', 'higherEd', 'gradYear', 'bachelorFile']

  useEffect(() => {
    if (!submitError) return
    const timer = setTimeout(() => setSubmitError(''), 5000)
    return () => clearTimeout(timer)
  }, [submitError])

  const steps = [
    { id: 1, title: c.step1Title },
    { id: 2, title: c.step2Title },
    { id: 3, title: c.step3Title },
    { id: 4, title: c.step4Title },
  ]

  const stepInfo = {
    1: {
      title: c.step1Title,
      subtitle: c.step1Subtitle,
      progressText: c.step1Progress,
      fields: (
        <>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.fioLabel} <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={formData.fio}
              onChange={(e) => setFormData((prev) => ({ ...prev, fio: e.target.value }))}
              placeholder="Familiya Ism Otasining ismi"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.dobLabel} <span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
              placeholder={c.dobPlaceholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            />
          </label>
        </>
      ),
    },
    2: {
      title: c.step2Title,
      subtitle: c.step2Subtitle,
      progressText: c.step2Progress,
      fields: (
        <>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.regionLabel} <span className="text-red-500">*</span>
            </span>
            <select
              value={formData.region}
              onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            >
              <option value="">{c.regionSelectPlaceholder}</option>
              {c.regionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.districtLabel} <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
              placeholder={c.districtPlaceholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.phoneLabel} <span className="text-red-500">*</span>
            </span>
            <input
              type="tel"
              value={formData.phone}
              inputMode="numeric"
              autoComplete="tel"
              onFocus={() =>
                setFormData((prev) => ({
                  ...prev,
                  phone: prev.phone?.trim() ? prev.phone : '+998 ',
                }))
              }
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
              placeholder={c.phonePlaceholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.emailLabel} <span className="text-red-500">*</span>
            </span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={c.emailPlaceholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            />
          </label>
        </>
      ),
    },
    3: {
      title: c.step3Title,
      subtitle: c.step3Subtitle,
      progressText: c.step3Progress,
      fields: (
        <>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.higherEdLabel} <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={formData.higherEd}
              onChange={(e) => setFormData((prev) => ({ ...prev, higherEd: e.target.value }))}
              placeholder={c.higherEdPlaceholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.gradYearLabel} <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={formData.gradYear}
              onChange={(e) => setFormData((prev) => ({ ...prev, gradYear: e.target.value }))}
              placeholder={c.gradYearPlaceholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-[#22b8ff] focus:ring-2 focus:ring-[#22b8ff]/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              {c.bachelorLabel} <span className="text-red-500">*</span>
            </span>
            <input
              key={`bachelor-${fileInputKey}`}
              type="file"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bachelorFile: e.target.files?.[0] || null,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="text-sm text-slate-400">{c.bachelorTip}</p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">{c.masterLabel}</span>
            <input
              key={`master-${fileInputKey}`}
              type="file"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  masterFile: e.target.files?.[0] || null,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="text-sm text-slate-400">{c.masterTip}</p>
          </label>
        </>
      ),
    },
    4: {
      title: c.step4Title,
      subtitle: c.step4Subtitle,
      progressText: c.step4Progress,
      fields: (
        <>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">{c.phdLabel}</span>
            <input
              key={`phd-${fileInputKey}`}
              type="file"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phdFile: e.target.files?.[0] || null,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="text-sm text-slate-400">{c.phdTip}</p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">{c.langCertLabel}</span>
            <input
              key={`lang-${fileInputKey}`}
              type="file"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  langCertFile: e.target.files?.[0] || null,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="text-sm text-slate-400">{c.langCertTip}</p>
          </label>

          <label className="space-y-2 md:col-span-1">
            <span className="text-sm font-semibold text-slate-800">{c.cvLabel}</span>
            <input
              key={`cv-${fileInputKey}`}
              type="file"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cvFile: e.target.files?.[0] || null,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className="text-sm text-slate-400">{c.cvTip}</p>
          </label>
        </>
      ),
    },
  }

  const active = stepInfo[currentStep]

  const isPhoneComplete = (value) => {
    const digits = String(value ?? '').replace(/\D/g, '')
    return digits.startsWith('998') && digits.length === 12
  }

  const getMissingRequired = (step = null) => {
    const mapByStep = {
      1: ['fio', 'dob'],
      2: ['region', 'district', 'phone', 'email'],
      3: ['higherEd', 'gradYear', 'bachelorFile'],
      4: [],
      all: requiredFields,
    }

    const keys = step ? mapByStep[step] : mapByStep.all
    return keys.filter((field) => {
      const value = formData[field]
      if (field === 'bachelorFile') return !(value instanceof File)
      if (field === 'phone') return !isPhoneComplete(value)
      return typeof value === 'string' ? value.trim().length === 0 : !value
    })
  }

  const goNext = () => {
    const missing = getMissingRequired(currentStep)
    if (missing.length > 0) {
      setSubmitError("Majburiy maydonlarni to'ldiring.")
      return
    }
    setSubmitError('')
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const goPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const uploadFile = async (file, folder) => {
    if (!(file instanceof File) || !supabase) return ''
    const safeName = file.name.replace(/\s+/g, '_')
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('applications')
      .upload(filePath, file, { upsert: false })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('applications').getPublicUrl(filePath)
    return data?.publicUrl ?? ''
  }

  const saveApplication = async () => {
    const missing = getMissingRequired()
    if (missing.length > 0) {
      setSubmitError("Majburiy maydonlarni to'ldiring.")
      return
    }

    if (!hasSupabaseEnv || !supabase) {
      setSubmitError('Supabase sozlamalari topilmadi. .env faylni to‘ldiring.')
      return
    }

    setSaving(true)
    setSubmitError('')

    try {
      const bachelorFile = await uploadFile(formData.bachelorFile, 'bachelor')
      const masterFile = await uploadFile(formData.masterFile, 'master')
      const phdFile = await uploadFile(formData.phdFile, 'phd')
      const langCertFile = await uploadFile(formData.langCertFile, 'language')
      const cvFile = await uploadFile(formData.cvFile, 'cv')

      const payload = {
        fio: formData.fio.trim(),
        dob: formData.dob,
        region: formData.region.trim(),
        district: formData.district.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        higherEd: formData.higherEd.trim(),
        gradYear: formData.gradYear.trim(),
        bachelorFile,
        masterFile,
        phdFile,
        langCertFile,
        cvFile,
        statusKey: 'yangi',
        createdAt: new Date().toISOString(),
      }

      const { error } = await supabase.from('applications').insert(payload)
      if (error) throw error

      setSuccessModalOpen(true)
      setCurrentStep(1)
      setFormData({
        fio: '',
        dob: '',
        region: '',
        district: '',
        phone: '',
        email: '',
        higherEd: '',
        gradYear: '',
        bachelorFile: null,
        masterFile: null,
        phdFile: null,
        langCertFile: null,
        cvFile: null,
      })
      setFileInputKey((v) => v + 1)
    } catch (err) {
      const details = err instanceof Error ? err.message : ''
      setSubmitError(
        details
          ? `Saqlashda xatolik: ${details}`
          : "Saqlashda xatolik bo'ldi. Supabase jadval va bucket sozlamasini tekshiring.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#d9e3f2]">
      <Navbar lang={lang} setLang={setLang} c={c} />

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[24px] bg-white shadow-[0_22px_44px_rgba(25,45,78,0.2)]">
          <div className="grid min-h-[620px] grid-cols-1 md:grid-cols-[300px_1fr]">
            <aside className="relative overflow-hidden bg-gradient-to-b from-[#10b9ff] via-[#075b9d] to-[#062447] p-7 text-white">
              <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_left,_#4ee5ff,_transparent_45%),radial-gradient(circle_at_bottom_right,_#32b7ff,_transparent_40%)]" />
              <div className="relative z-10">
                <h1 className="text-3xl font-semibold leading-tight">{c.sidebarTitle}</h1>
                <p className="mt-2 text-sm text-white/80">{c.sidebarSubtitle}</p>

                <ul className="mt-10 space-y-3">
                  {steps.map((step) => (
                    <li
                      key={step.id}
                      className={`flex items-center gap-3 rounded-full border px-4 py-3 transition ${
                        step.id === currentStep
                          ? 'border-transparent bg-[#0a305a] text-white shadow-lg'
                          : step.id < currentStep
                            ? 'border-transparent bg-white/10 text-white/90'
                            : 'border-white/20 bg-white/5 text-white/70'
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                          step.id === currentStep
                            ? 'bg-[#23b9ff] text-white'
                            : step.id < currentStep
                              ? 'bg-[#23d36b] text-white'
                              : 'bg-white/10 text-white/80'
                        }`}
                      >
                        {step.id}
                      </span>
                      <span className="text-sm font-medium">{step.title}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-14">
                  <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                    <span>{c.bosqichlarLabel}</span>
                    <span>{currentStep} / 4</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/20">
                    <div
                      className="h-2 rounded-full bg-cyan-300 transition-all duration-300"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </aside>

            <section className="p-6 md:p-9">
              <h2 className="text-3xl font-semibold text-slate-900">{active.title}</h2>
              <p className="mt-2 text-slate-500">{active.subtitle}</p>

              <form className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">{active.fields}</form>

              <div className="mt-12 border-t border-slate-200 pt-5">
                {submitError ? (
                  <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {submitError}
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentStep === 1}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-7 py-3 font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span aria-hidden="true">←</span>
                    {c.back}
                  </button>

                  <p className="text-sm text-slate-400">{active.progressText}</p>

                  <button
                    type="button"
                    onClick={currentStep === 4 ? () => void saveApplication() : goNext}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16cbff] to-[#10c968] px-8 py-3 font-semibold text-white shadow-[0_8px_18px_rgba(23,196,171,0.35)] transition hover:brightness-105"
                  >
                    {currentStep === 4 ? (saving ? 'Saqlanmoqda...' : c.finish) : c.next}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>

                {successModalOpen ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold text-slate-900">{c.successModalTitle}</div>
                          <div className="mt-2 text-sm font-medium text-slate-600">{c.successModalBody}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSuccessModalOpen(false)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                          aria-label="Close"
                        >
                          ×
                        </button>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSuccessModalOpen(false)}
                          className="rounded-full bg-gradient-to-r from-[#16cbff] to-[#10c968] px-6 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(23,196,171,0.35)] transition hover:brightness-105"
                        >
                          {c.modalOk ?? 'OK'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PublicForm

