import { Button } from '../Button/Button'

export default function TeamGenerator({
  numTeams,
  isLoading,
  error,
  onNumTeamsChange,
  onBalanceTeams,
}) {
  return (
    <div className="mt-10 flex flex-col items-center">
      <div className="mb-4 flex flex-col items-center">
        <label
          className="mb-2 block text-sm font-bold text-gray-700 print:hidden"
          htmlFor="numTeams"
        >
          Number of Teams
        </label>
        <input
          className="w-15 focus:shadow-outline appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none print:hidden"
          id="numTeams"
          type="number"
          min="2"
          max="20"
          value={numTeams}
          onChange={(e) => onNumTeamsChange(e.target.value)}
        />
      </div>
      <div className="mb-4 mt-4 flex items-center justify-between print:hidden">
        <Button
          variant="primary"
          onClick={onBalanceTeams}
          text="Create Balanced Teams"
          isLoading={isLoading}
          loadingMessage="Creating teams"
          testId="create-balanced-teams-button"
        />
      </div>
      {error && <p className="mt-4 text-xs italic text-red-500">{error}</p>}
    </div>
  )
}
