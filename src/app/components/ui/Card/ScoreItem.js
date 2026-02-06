export const ScoreItem = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-1 rounded bg-gray-100">
    <span className="text-[0.75rem] text-gray-400">{label}:</span>
    <span className="text-[0.75rem] font-medium text-black">{value}</span>
  </div>
)
