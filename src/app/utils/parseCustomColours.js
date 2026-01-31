// Parse custom colours from input string
export const parseCustomColours = (input) => {
  if (!input || input.trim() === '') return []

  // Split by comma and clean up
  const colourNames = input.split(',').map((c) => c.trim().toLowerCase())

  // Map common colour names to Tailwind classes
  const colourMap = {
    red: 'border-loonsRed bg-red-200 print:bg-white',
    blue: 'border-blue-500 bg-blue-200 print:bg-white',
    green: 'border-green-500 bg-green-200 print:bg-white',
    yellow: 'border-yellow-400 bg-yellow-100 print:bg-white',
    purple: 'border-purple-400 bg-purple-200 print:bg-white',
    orange: 'border-orange-500 bg-orange-200 print:bg-white',
    pink: 'border-pink-300 bg-pink-100 print:bg-white',
    black: 'border-gray-800 bg-gray-200 print:bg-white',
    white: 'border-gray-500 bg-white print:bg-white',
  }

  return colourNames.map((name) => colourMap[name] || null).filter(Boolean)
}
