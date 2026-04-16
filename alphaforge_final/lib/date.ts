const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
  timeZone: "UTC",
})

function safeDate(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value
  const parsed = new Date(normalized)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

export function formatDateLabel(value: string) {
  const parsed = safeDate(value)
  return parsed ? dateFormatter.format(parsed) : value
}

export function formatDateTimeLabel(value: string) {
  const parsed = safeDate(value)
  return parsed ? dateTimeFormatter.format(parsed) : value
}

export function getTodayIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
