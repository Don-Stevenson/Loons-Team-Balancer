import Link from 'next/link'

export default function Footer() {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-xs print:hidden">
      <Link
        href={'/about'}
        className="flex h-8 items-center justify-center text-center text-xs font-bold uppercase text-loonsRed transition-colors duration-300 hover:cursor-pointer hover:text-[#f38686]"
      >
        Learn more about Loons Team Balancer
      </Link>
      <p>
        © {new Date(Date.now()).getFullYear().toString()} Loons Team Balancer.
        All rights reserved.
      </p>
    </div>
  )
}
