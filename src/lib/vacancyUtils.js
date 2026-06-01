/** Butun sonni bo‘shliq bilan formatlash: 1338000 → "1 338 000" */
export function formatAmountDisplay(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n) || n <= 0) return ''
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Raqamni kiritish maydonida ko‘rsatish: 5000 → "5 000" */
export function formatSalaryInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return formatAmountDisplay(Number(digits))
}

export function parseSalaryNumber(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) ? n : null
}

function normalizeSalaryValue(value) {
  const n = parseSalaryNumber(value)
  return n != null && n > 0 ? n : null
}

export function buildVacancyPayload(form) {
  const title = String(form.title ?? '').trim()
  const payload = { title }

  const rate = String(form.rate ?? '').trim()
  if (rate) payload.rate = rate

  const salaryMin = parseSalaryNumber(form.salaryMin)
  if (salaryMin != null) payload.salaryMin = salaryMin

  if (form.hasSalaryMax) {
    const salaryMax = parseSalaryNumber(form.salaryMax)
    if (salaryMax != null) payload.salaryMax = salaryMax
  } else {
    payload.salaryMax = null
  }

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
  const minN = normalizeSalaryValue(min)
  const maxN = normalizeSalaryValue(max)
  if (minN == null && maxN == null) return ''

  const a = minN != null ? formatAmountDisplay(minN) : ''
  const b = maxN != null ? formatAmountDisplay(maxN) : ''

  if (a && b) return `${a} – ${b} ${currency}`
  if (a) return `${a}+ ${currency}`
  if (b) return `${b} gacha ${currency}`
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

export function getApplicationVacancyLabel(app, vacancyTitleById = null) {
  const stored = String(app?.vacancyTitle ?? '').trim()
  if (stored) return stored
  const id = app?.vacancyId
  if (id != null && vacancyTitleById?.has?.(id)) return vacancyTitleById.get(id)
  if (id != null) return `Vakansiya #${id}`
  return '-'
}

export function isApplicationVacancyColumnError(error) {
  const msg = String(error?.message ?? error ?? '').toLowerCase()
  return msg.includes('vacancyid') || msg.includes('vacancytitle') || msg.includes('vacancy')
}

export function isStatusNoteColumnError(error) {
  const msg = String(error?.message ?? error ?? '').toLowerCase()
  return msg.includes('statusnote') || msg.includes('status note')
}
