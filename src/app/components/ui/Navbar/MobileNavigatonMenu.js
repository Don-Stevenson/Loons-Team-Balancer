import Link from 'next/link'
import Logout from '../Logout/Logout'

export const MobileNavigatonMenu = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  return (
    <nav
      aria-label="Mobile navigation menu"
      className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="flex flex-col gap-2 p-4 border-t-2 border-loonsRed bg-loonsBrown">
        <Link
          href="/create-teams"
          onClick={() => setIsMobileMenuOpen(false)}
          className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-3 px-4 rounded text-center transition-colors"
        >
          Create Teams
        </Link>
        <Link
          href="/players"
          onClick={() => setIsMobileMenuOpen(false)}
          className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-3 px-4 rounded text-center transition-colors"
        >
          Manage Players
        </Link>
        <Link
          href="/about"
          onClick={() => setIsMobileMenuOpen(false)}
          className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-3 px-4 rounded text-center transition-colors"
        >
          About
        </Link>
        <Logout variant="logout" />
      </div>
    </nav>
  )
}
