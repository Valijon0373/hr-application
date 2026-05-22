/** Raqamni kiritish maydonida ko‘rsatish: 5000 → "5 000" */
export function formatSalaryInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const n = Number(digits)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('uz-UZ')
}

export function parseSalaryNumber(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const n = Number(raw.replace(/[\s\u00A0\u202F]/g, '').replaceAll(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function buildVacancyPayload(form) {
  const title = String(form.title ?? '').trim()
  const payload = { title }

  const rate = String(form.rate ?? '').trim()
  if (rate) payload.rate = rate

  const salaryMin = parseSalaryNumber(form.salaryMin)
  if (salaryMin != null) payload.salaryMin = salaryMin

  const salaryMax = parseSalaryNumber(form.salaryMax)
  if (salaryMax != null) payload.salaryMax = salaryMax

  const workSchedule = String(form.workSchedule ?? '').trim()
  if (workSchedule) payload.workSchedule = workSchedule

  const description = String(form.description ?? '').trim()
  if (description) payload.description = description

  const requirements = String(form.requirements ?? '').trim()
  if (requirements) payload.requirements = requirements

  return payload
}

export function isVacancySchemaError(message) {
  const m = String(message ?? '').toLowerCase()
  return (
    m.includes('workschedule') ||
    m.includes('description') ||
    m.includes('requirements') ||
    m.includes('isactive') ||
    m.includes('schema cache')
  )
}

export function formatSalaryRange({ min, max, currency = "so'm" }) {
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

export function formatCreatedAt(value) {
  if (!value) return ''
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return ''
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

export function mapVacancyToView(v) {
  if (!v) return null
  return {
    id: v.id,
    title: v.title ?? '-',
    rate: v.rate ?? '',
    salaryText: formatSalaryRange({ min: v.salaryMin, max: v.salaryMax }),
    workSchedule: v.workSchedule ?? '',
    description: v.description ?? '',
    requirements: v.requirements ?? '',
    createdAt: v.createdAt ?? '',
  }
}
