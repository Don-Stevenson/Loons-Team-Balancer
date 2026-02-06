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

export const getMeetDate = (meetdate) => {
  // If no meetdate is provided, show today's date
  const formattedMeetDate = new Date(meetdate).toLocaleDateString(
    'en-US',
    dateFormatOptions
  )

  if (!formattedMeetDate) {
    return todaysDate
  }

  // If meetdate is wednesday, december 31, 1969, show today's date
  if (formattedMeetDate === 'Wednesday, December 31, 1969') {
    return todaysDate
  }

  // If meetdate is the same as today, show the meetdate
  return formattedMeetDate
}

export default function GameMeetDate({ meetdate }) {
  return <p className="mt-1 text-lg text-gray-700">{getMeetDate(meetdate)}</p>
}
