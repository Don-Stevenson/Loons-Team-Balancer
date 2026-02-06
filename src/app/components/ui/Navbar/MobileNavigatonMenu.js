import Link from 'next/link'
import Logout from '../Logout/Logout'

export const MobileNavigatonMenu = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  return (
    <nav
      aria-label="Mobile navigation menu"
      className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="flex flex-col gap-2 border-t-2 border-loonsRed bg-loonsBrown p-4">
        <Link
          href="/create-teams"
          onClick={() => setIsMobileMenuOpen(false)}
          className="rounded border border-red-900 bg-loonsRed px-4 py-3 text-center font-semibold text-loonsBeige transition-colors hover:bg-red-900"
        >
          Create Teams
        </Link>
        <Link
          href="/players"
          onClick={() => setIsMobileMenuOpen(false)}
          className="rounded border border-red-900 bg-loonsRed px-4 py-3 text-center font-semibold text-loonsBeige transition-colors hover:bg-red-900"
        >
          Manage Players
        </Link>
        <Link
          href="/about"
          onClick={() => setIsMobileMenuOpen(false)}
          className="rounded border border-red-900 bg-loonsRed px-4 py-3 text-center font-semibold text-loonsBeige transition-colors hover:bg-red-900"
        >
          About
        </Link>
        <Logout variant="logout" />
      </div>
    </nav>
  )
}
