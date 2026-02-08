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
    <div className="mx-auto mb-3 max-w-2xl px-4 print:hidden">
      <label
        htmlFor="customColours"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Customize Team Colours (Optional)
      </label>
      <input
        id="customColours"
        type="text"
        value={customColourInput}
        onChange={handleColourInputChange}
        placeholder="e.g., blue, yellow, green, purple"
        className="w-full rounded-lg border border-gray-300 px-4 py-2"
      />
      <p className="mt-2 text-sm text-gray-500">
        Enter colour names separated by commas. Available colours: red, blue,
        green, yellow, purple, orange, pink, black, white.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        For example, if you want to create 6 teams with two blue teams, enter:
        <code className="rounded-md bg-gray-100 px-1 py-1 font-bold">
          blue, blue
        </code>
        and the rest will default to red and black. Alternatively, you can
        enter:
        <code className="rounded-md bg-gray-100 px-1 py-1 font-bold">
          blue, blue, red, black, red, black
        </code>
        for the same result.
      </p>
      <p
        className={`mt-2 min-h-[1.5rem] text-lg leading-tight ${getColourStatusMessage()?.charAt(0) === '✓' ? 'text-green-600' : 'text-orange-400'}`}
      >
        {getColourStatusMessage()}
      </p>
    </div>
  )
}
