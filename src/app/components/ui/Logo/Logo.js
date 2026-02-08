import LoonsBadge from '../../../assets/img/TWSC.webp'
import Image from 'next/image'

export const Logo = ({ classes }) => {
  return (
    <div className={`${classes} flex flex-col items-center`}>
      <div className="relative top-[1.25rem] z-10 h-[7.8125rem] w-[6.25rem]">
        <Image
          src={LoonsBadge}
          width={100}
          height={120.24}
          alt="Toronto Walking Soccer Loons Club Logo"
          priority
        />
      </div>
      <div className="z-0 mb-4 flex h-[4.375rem] w-[17.8125rem] items-center justify-center bg-loonsDarkBrown">
        <div className="z-10 flex h-[3.875rem] w-[17.3125rem] items-center justify-center border-[0.3125rem] border-loonsRed bg-loonsBrown text-center font-oswald text-2xl font-[400] uppercase tracking-wider text-loonsBeige">
          Loons Team Balancer
        </div>
      </div>
    </div>
  )
}
