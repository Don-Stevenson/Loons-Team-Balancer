import Link from 'next/link'
import Logout from './Logout'

export default function NavBar() {
  return (
    <div className="flex z-0 bg-loonsDarkBrown items-center justify-center min-w-[auto]">
      <nav className="flex justify-between border-[5px] m-2 w-full border-loonsRed rounded bg-loonsBrown text-loonsBeige p-4 print:hidden items-center">
        <div className="flex bg-loonsRed text-loonsBeige border border-red-900 font-semibold py-1 px-2 md:w-[240px] rounded text-center md:h-[77px] justify-center items-center mr-2 ">
          <h1 className="text-2xl font-bold">Loons Team Balancer</h1>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link
            href="/create-teams"
            className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
          >
            Create Teams
          </Link>
          <Link
            href="/players"
            className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
          >
            Manage Players
          </Link>
          <Link
            href="/about"
            className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900  font-semibold py-1 px-2 w-full sm:w-auto min-w-[150px] rounded text-center items-center h-[35px] flex justify-center"
          >
            About
          </Link>
          <Logout />
        </div>
      </nav>
    </div>
  )
}
