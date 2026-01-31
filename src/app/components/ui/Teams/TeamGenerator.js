import { Button } from '../Button/Button'

export default function TeamGenerator({
  numTeams,
  isLoading,
  error,
  onNumTeamsChange,
  onBalanceTeams,
}) {
  return (
    <div className="flex flex-col mt-10 items-center">
      <div className="flex flex-col items-center mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 print:hidden"
          htmlFor="numTeams"
        >
          Number of Teams
        </label>
        <input
          className="shadow appearance-none border rounded w-15 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline print:hidden"
          id="numTeams"
          type="number"
          min="2"
          max="10"
          value={numTeams}
          onChange={(e) => onNumTeamsChange(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between print:hidden mt-4 mb-4">
        <Button
          variant="primary"
          onClick={onBalanceTeams}
          text="Create Balanced Teams"
          isLoading={isLoading}
          loadingMessage="Creating teams"
          testId="create-balanced-teams-button"
        />
      </div>
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
    </div>
  )
}
