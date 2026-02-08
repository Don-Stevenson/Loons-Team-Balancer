'use client'
import Link from 'next/link'
import { useAuthCheck } from '../hooks/useApi'
import { Logo } from '../components/ui/Logo/Logo'
import { BackArrow } from '../components/ui/BackArrow/BackArrow'
import Layout from '../components/ui/Layout/Layout'

function AboutPage() {
  const { data: loggedIn } = useAuthCheck()

  return (
    <Layout loggedIn={loggedIn}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {/* Header Section */}
          {loggedIn ? null : <Logo />}

          {/* Content Section */}
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl bg-white p-6 sm:p-8 lg:p-12">
              {/* Introduction */}
              <div className="mb-8 sm:mb-12">
                <h2 className="mb-4 text-2xl font-semibold text-loonsBrown sm:text-3xl">
                  What is Loons Team Balancer?
                </h2>
                <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
                  Loons Team Balancer is a Next.js-based solution designed to
                  create fair and well-balanced soccer teams each week. The app
                  takes into account player skills, gender, and other attributes
                  to ensure a fun and competitive experience for everyone. It is
                  ideal for recurring games with a mix of players of different
                  abilities and positions, making it easy to shuffle teams
                  fairly every time.
                </p>
              </div>

              {/* Algorithm Section */}
              <div className="mb-8 sm:mb-12">
                <h2 className="mb-4 text-2xl font-semibold text-loonsBrown sm:text-3xl">
                  How It Works
                </h2>
                <div className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-6 sm:p-8">
                  <p className="text-base mb-4 leading-relaxed text-gray-700 sm:text-lg">
                    At the core of the app is a sophisticated team balancing
                    algorithm. It evaluates the players available each week
                    based on their:
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="sm:text-base text-sm text-gray-700">
                        Game Knowledge
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="sm:text-base text-sm text-gray-700">
                        Goal Scoring
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="sm:text-base text-sm text-gray-700">
                        Attack
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="sm:text-base text-sm text-gray-700">
                        Midfield
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="sm:text-base text-sm text-gray-700">
                        Defense
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="sm:text-base text-sm text-gray-700">
                        Mobility/Stamina
                      </span>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
                    Players are sorted primarily by gender and then by overall
                    score. Using a modified serpentine draft method, the
                    algorithm distributes players across teams while keeping the
                    overall skill levels balanced. It even introduces slight
                    randomness to ensure that teams vary week to week.
                  </p>
                </div>
              </div>

              {/* Usage Section */}
              <div className="mb-8 sm:mb-12">
                <h2 className="mb-4 text-2xl font-semibold text-loonsBrown sm:text-3xl">
                  Getting Started
                </h2>
                <div className="rounded-xl border-l-4 border-green-500 bg-green-50 p-6 sm:p-8">
                  <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
                    Simply select who's playing and choose how many teams you'd
                    like to create. You can use the upcoming games dropdown
                    button to automatically select the players depending on
                    their RSVPs on Heja's attendance tracking app. If you're not
                    quite happy with the results, you can manually drag and drop
                    players, and or you can click
                    <code className="rounded bg-gray-200 px-2 py-1 font-mono text-sm">
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
                <h2 className="mb-4 text-2xl font-semibold text-loonsBrown sm:text-3xl">
                  Site Info
                </h2>
                <div className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-6 sm:p-8">
                  <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
                    Loons Team Balancer is created and maintained by{' '}
                    <a
                      href="https://www.linkedin.com/in/don-stevenson416/"
                      className="font-bold text-loonsRed transition-colors duration-300 hover:text-[#f38686]"
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
                className="flex h-10 items-center justify-center gap-2 text-center text-loonsRed"
              >
                <BackArrow />
                <p>Return to Login</p>
              </Link>
            )}
            {loggedIn && (
              <Link
                href={'/create-teams'}
                className="flex h-10 items-center justify-center gap-2 text-center text-loonsRed"
              >
                <BackArrow />
                <p>return to Create Teams</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AboutPage
