export const MobileMenuButton = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="flex flex-shrink-0 flex-col gap-1.5 rounded border-2 border-loonsRed bg-loonsBrown p-2 transition-colors hover:bg-red-900 md:hidden"
      aria-label="Mobile navigation menu button"
      aria-expanded={isMobileMenuOpen}
    >
      <span
        className={`block h-0.5 w-6 bg-loonsBeige transition-transform ${
          isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-6 bg-loonsBeige transition-opacity ${
          isMobileMenuOpen ? 'opacity-0' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-6 bg-loonsBeige transition-transform ${
          isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
        }`}
      />
    </button>
  )
}
