const dateFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

export const todaysDate = new Date().toLocaleDateString(
  'en-US',
  dateFormatOptions
)

const isDateOnlyString = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

export const fromInputDate = (yyyyMmDd) => {
  const [year, month, day] = yyyyMmDd.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const parseMeetDate = (value) => {
  if (value instanceof Date) return value
  if (isDateOnlyString(value)) return fromInputDate(value)
  return new Date(value)
}

const isInvalidOrEpochDate = (date) => {
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return true
  }

  const formatted = date.toLocaleDateString('en-US', dateFormatOptions)
  return (
    formatted === 'Wednesday, December 31, 1969' ||
    formatted === 'Thursday, January 1, 1970'
  )
}

export const toInputDate = (value) => {
  const date = parseMeetDate(value)
  const usableDate = isInvalidOrEpochDate(date) ? new Date() : date
  const year = usableDate.getFullYear()
  const month = String(usableDate.getMonth() + 1).padStart(2, '0')
  const day = String(usableDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getMeetDate = (meetdate) => {
  const date = parseMeetDate(meetdate)

  if (isInvalidOrEpochDate(date)) {
    return todaysDate
  }

  return date.toLocaleDateString('en-US', dateFormatOptions)
}

export default function GameMeetDate({ meetdate, onDateChange }) {
  const handleDateChange = (event) => {
    const value = event.target.value
    if (!value || !onDateChange) return
    onDateChange(fromInputDate(value))
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center gap-2">
        <p className="mt-1 text-lg text-gray-700">{getMeetDate(meetdate)}</p>
        {onDateChange && (
          <input
            type="date"
            value={toInputDate(meetdate)}
            onChange={handleDateChange}
            aria-label="Change game date"
            title="Change game date"
            className="mt-1 cursor-pointer rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 print:hidden"
          />
        )}
      </div>
      {onDateChange && (
        <p className="mt-1 text-xs text-gray-500 print:hidden">
          If you want to change the date for printout, use the date picker
          above.
        </p>
      )}
    </div>
  )
}
