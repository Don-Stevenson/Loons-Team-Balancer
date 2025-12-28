export const MobileMenuButton = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden flex flex-col gap-1.5 p-2 rounded border-2 border-loonsRed bg-loonsBrown hover:bg-red-900 transition-colors flex-shrink-0"
      aria-label="Mobile navigation menu button"
      aria-expanded={isMobileMenuOpen}
    >
      <span
        className={`block w-6 h-0.5 bg-loonsBeige transition-transform ${
          isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-loonsBeige transition-opacity ${
          isMobileMenuOpen ? 'opacity-0' : ''
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-loonsBeige transition-transform ${
          isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
        }`}
      />
    </button>
  )
}
