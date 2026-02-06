import { PulseLoader } from 'react-spinners'

export default function LoadingPlayers() {
  return (
    <p className="flex items-center justify-center gap-2 py-4 text-xl text-gray-700">
      Loading players
      <PulseLoader color="black" size={6} />
    </p>
  )
}
