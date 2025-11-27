export default function HoverPlayerStats({ hoveredPlayer }) {
  return (
    <div
      className="absolute top-[110%] lg:left-full lg:top-0 lg:ml-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 w-64 print:hidden 
    hidden md:block"
    >
      <h3 className="text-sm font-bold mb-2 text-gray-800">
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
