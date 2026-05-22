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
