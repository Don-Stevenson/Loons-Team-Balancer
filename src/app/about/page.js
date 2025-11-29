'use client'

import Link from 'next/link'
import { useAuthCheck } from '../hooks/useApi'
import { Logo } from '../components/ui/Logo/Logo'
import { BackArrow } from '../components/ui/BackArrow/BackArrow'

function AboutPage() {
  const { data: authResult } = useAuthCheck()
  const loggedIn = authResult

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header Section */}
        <Logo />

        {/* Content Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12">
            {/* Introduction */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-loonsBrown">
                What is Loons Team Balancer?
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-gray-700">
                Loons Team Balancer is a Next.js-based solution designed to
                create fair and well-balanced soccer teams each week. The app
                takes into account player skills, gender, and other attributes
                to ensure a fun and competitive experience for everyone. It is
                ideal for recurring games with a mix of players of different
                abilities and positions, making it easy to shuffle teams fairly
                every time.
              </p>
            </div>

            {/* Algorithm Section */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-loonsBrown">
                How It Works
              </h2>
              <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border-l-4 border-blue-500">
                <p className="text-base sm:text-lg leading-relaxed text-gray-700 mb-4">
                  At the core of the app is a sophisticated team balancing
                  algorithm. It evaluates the players available each week based
                  on their:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm sm:text-base text-gray-700">
                      Game Knowledge
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm sm:text-base text-gray-700">
                      Goal Scoring
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm sm:text-base text-gray-700">
                      Attack
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm sm:text-base text-gray-700">
                      Midfield
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm sm:text-base text-gray-700">
                      Defense
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm sm:text-base text-gray-700">
                      Mobility/Stamina
                    </span>
                  </div>
                </div>
                <p className="text-base sm:text-lg leading-relaxed text-gray-700">
                  Players are sorted primarily by gender and then by overall
                  score. Using a modified serpentine draft method, the algorithm
                  distributes players across teams while keeping the overall
                  skill levels balanced. It even introduces slight randomness to
                  ensure that teams vary week to week.
                </p>
              </div>
            </div>

            {/* Usage Section */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-loonsBrown">
                Getting Started
              </h2>
              <div className="bg-green-50 rounded-xl p-6 sm:p-8 border-l-4 border-green-500">
                <p className="text-base sm:text-lg leading-relaxed text-gray-700">
                  Simply select who's playing and choose how many teams you'd
                  like to create. You can use the upcoming games dropdown button
                  to automatically select the players depending on their RSVPs
                  on Heja's attendance tracking app. If you're not quite happy
                  with the results, you can manually drag and drop players, and
                  or you can click
                  <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                    create teams
                  </code>{' '}
                  again to re-generate the teams. When you're happy with the
                  teams, you can print the teams in the default,
                  printer-friendly format.
                </p>
              </div>
            </div>

            {/* Usage Section */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-loonsBrown">
                Site Info
              </h2>
              <div className="bg-orange-50 rounded-xl p-6 sm:p-8 border-l-4 border-orange-500">
                <p className="text-base sm:text-lg leading-relaxed text-gray-700">
                  Loons Team Balancer is created and maintained by{' '}
                  <a
                    href="https://www.linkedin.com/in/don-stevenson416/"
                    className="text-loonsRed hover:text-[#f38686] transition-colors duration-300 font-bold"
                  >
                    Don Stevenson
                  </a>
                  . Please feel free to reach out with any questions or
                  feedback.
                </p>
              </div>
            </div>
          </div>
          {!loggedIn && (
            <Link
              href={'/login'}
              className="flex gap-2 justify-center text-center items-center text-loonsRed h-10"
            >
              <BackArrow />
              <p>Return to Login</p>
            </Link>
          )}
          {loggedIn && (
            <Link
              href={'/create-teams'}
              className="flex gap-2 justify-center text-center items-center text-loonsRed h-10"
            >
              <BackArrow />
              <p>return to Create Teams</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default AboutPage
