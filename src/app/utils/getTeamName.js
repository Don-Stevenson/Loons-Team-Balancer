export const getTeamName = (
  index,
  balancedTeams,
  parsedCustomColours,
  customColourInput
) => {
  const totalTeams = balancedTeams.length

  // Determine the colour for this team (whether custom or default)
  let currentColour = ''

  if (parsedCustomColours.length > 0 && parsedCustomColours[index]) {
    // This team has a custom colour
    const colourNames = customColourInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
    currentColour = colourNames[index]?.toLowerCase()
  } else {
    // This team uses default colours
    if (totalTeams === 3) {
      const colourIndex = index % 3
      currentColour =
        colourIndex === 0 ? 'red' : colourIndex === 1 ? 'black' : 'white'
    } else if (totalTeams === 2) {
      currentColour = index === 0 ? 'red' : 'black'
    } else {
      currentColour = index % 2 === 0 ? 'red' : 'black'
    }
  }

  // Now count ALL teams (custom + default) that share this colour
  let totalOccurrences = 0
  let occurrenceNumber = 0

  for (let i = 0; i < totalTeams; i++) {
    let teamColour = ''

    if (parsedCustomColours.length > 0 && parsedCustomColours[i]) {
      const colourNames = customColourInput
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
      teamColour = colourNames[i]?.toLowerCase()
    } else {
      if (totalTeams === 3) {
        const colourIndex = i % 3
        teamColour =
          colourIndex === 0 ? 'red' : colourIndex === 1 ? 'black' : 'white'
      } else if (totalTeams === 2) {
        teamColour = i === 0 ? 'red' : 'black'
      } else {
        teamColour = i % 2 === 0 ? 'red' : 'black'
      }
    }

    if (teamColour === currentColour) {
      totalOccurrences++
      if (i === index) {
        occurrenceNumber = totalOccurrences
      }
    }
  }

  // Format the name
  const capitalizedColour =
    currentColour.charAt(0).toUpperCase() + currentColour.slice(1)

  return totalOccurrences > 1
    ? `${capitalizedColour} Team ${occurrenceNumber}`
    : `${capitalizedColour} Team`
}
