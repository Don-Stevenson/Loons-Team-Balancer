'use client'
import Link from 'next/link'
import Logout from '../Logout/Logout'
import LoonsBadge from '../../../assets/img/TWSC.webp'
import Image from 'next/image'
import { useState } from 'react'
import { MobileNavigatonMenu } from './MobileNavigatonMenu'
import { MobileMenuButton } from './MobileMenuButton'

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="overflow-x-hidden bg-loonsDarkBrown print:hidden">
      <div className="flex max-w-full items-center justify-between gap-2 px-2 py-2 sm:px-4 lg:px-6">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex min-w-0 flex-shrink items-center gap-2 sm:gap-3"
        >
          <div className="relative h-14 w-10 flex-shrink-0 sm:h-16 sm:w-12 md:h-20 md:w-16">
            <Image
              src={LoonsBadge}
              alt="Toronto Walking Soccer Loons Club Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="xl:text-base flex items-center justify-center whitespace-nowrap border-2 border-loonsRed bg-loonsBrown px-2 py-1.5 font-oswald text-xs font-normal uppercase tracking-wide text-loonsBeige lg:border-4 lg:px-3 lg:py-2 lg:text-sm lg:tracking-wider xl:px-4">
            Loons Team Balancer
          </div>
        </Link>
        {/* Navigation Section */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <nav className="hidden flex-shrink-0 items-center gap-2 rounded border-4 border-loonsRed bg-loonsBrown p-2 md:flex">
            <Link
              href="/create-teams"
              className="whitespace-nowrap rounded border border-red-900 bg-loonsRed px-3 py-2 text-center text-sm font-semibold text-loonsBeige transition-colors hover:bg-red-900"
            >
              Create Teams
            </Link>
            <Link
              href="/players"
              className="whitespace-nowrap rounded border border-red-900 bg-loonsRed px-3 py-2 text-center text-sm font-semibold text-loonsBeige transition-colors hover:bg-red-900"
            >
              Manage Players
            </Link>
            <Link
              href="/about"
              className="whitespace-nowrap rounded border border-red-900 bg-loonsRed px-3 py-2 text-center text-sm font-semibold text-loonsBeige transition-colors hover:bg-red-900"
            >
              About
            </Link>
            <Logout variant="logout" />
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenuButton
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <MobileNavigatonMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </header>
  )
}
