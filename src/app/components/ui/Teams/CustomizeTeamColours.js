export default function CustomizeTeamColours({
  customColourInput,
  handleColourInputChange,
  parsedCustomColours,
  balancedTeams,
}) {
  const getColourStatusMessage = () => {
    if (parsedCustomColours.length > balancedTeams.length) {
      return `Warning: you have more colours than teams; ${parsedCustomColours.length - balancedTeams.length} team colour(s) cannot be applied`
    } else if (
      parsedCustomColours.length > 0 &&
      parsedCustomColours.length <= balancedTeams.length
    ) {
      return `✓ ${parsedCustomColours.length} custom colour(s) applied`
    }
  }

  return (
    <div className="print:hidden max-w-2xl mx-auto mb-6 px-4">
      <label
        htmlFor="customColours"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Customize Team Colours (Optional)
      </label>
      <input
        id="customColours"
        type="text"
        value={customColourInput}
        onChange={handleColourInputChange}
        placeholder="e.g., blue, yellow, green, purple"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <p className="mt-1 text-xs text-gray-500">
        Enter colour names separated by commas. Available: red, blue, green,
        yellow, purple, orange, pink, black, white
      </p>
      <p
        className={`mt-2 text-lg leading-tight min-h-[2.5rem] ${getColourStatusMessage()?.charAt(0) === '✓' ? 'text-green-600' : 'text-orange-400'}`}
      >
        {getColourStatusMessage()}
      </p>
    </div>
  )
}
