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
    <header className="bg-loonsDarkBrown print:hidden overflow-x-hidden">
      <div className="flex items-center justify-between px-2 py-2 sm:px-4 lg:px-6 gap-2 max-w-full">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0"
        >
          <div className="relative w-10 h-14 sm:w-12 sm:h-16 md:w-16 md:h-20 flex-shrink-0">
            <Image
              src={LoonsBadge}
              alt="Toronto Walking Soccer Loons Club Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center justify-center text-xs lg:text-sm xl:text-base border-2 lg:border-4 border-loonsRed bg-loonsBrown px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 text-loonsBeige font-oswald font-normal uppercase tracking-wide lg:tracking-wider whitespace-nowrap">
            Loons Team Balancer
          </div>
        </Link>
        {/* Navigation Section */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 border-4 border-loonsRed rounded bg-loonsBrown p-2 flex-shrink-0">
            <Link
              href="/create-teams"
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-2 px-3 rounded text-center whitespace-nowrap transition-colors text-sm"
            >
              Create Teams
            </Link>
            <Link
              href="/players"
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-2 px-3 rounded text-center whitespace-nowrap transition-colors text-sm"
            >
              Manage Players
            </Link>
            <Link
              href="/about"
              className="bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-2 px-3 rounded text-center whitespace-nowrap transition-colors text-sm"
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
