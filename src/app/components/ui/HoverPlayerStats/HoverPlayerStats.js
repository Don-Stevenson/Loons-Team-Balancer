export default function HoverPlayerStats({ hoveredPlayer }) {
  return (
    <div className="absolute top-[110%] z-10 hidden w-64 rounded-lg border border-gray-300 bg-white p-3 shadow-lg md:block lg:left-full lg:top-0 lg:ml-2 print:hidden">
      <h3 className="mb-2 text-sm font-bold text-gray-800">
        {hoveredPlayer.name}
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Game Knowledge:</span>
          <span className="font-medium">
            {hoveredPlayer?.gameKnowledgeScore || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Goal Scoring:</span>
          <span className="font-medium">
            {hoveredPlayer?.goalScoringScore || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Attack:</span>
          <span className="font-medium">
            {hoveredPlayer?.attackScore || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Midfield:</span>
          <span className="font-medium">
            {hoveredPlayer?.midfieldScore || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Defense:</span>
          <span className="font-medium">
            {hoveredPlayer?.defenseScore || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Mobility/Stamina:</span>
          <span className="font-medium">
            {hoveredPlayer?.fitnessScore || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}
