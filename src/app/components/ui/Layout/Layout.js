import Head from 'next/head'
import Footer from '../../ui/Footer/Footer'
import NavBar from '../Navbar/NavBar'

export default function Layout({ children, loggedIn }) {
  return (
    <div className="flex flex-col min-h-screen print:m-0">
      <Head>
        <title>Loons Team Balancer App</title>
        <link rel="icon" href="/TWSC_Badge.webp" type="image/webp" />
      </Head>
      {loggedIn ? <NavBar /> : null}
      <main className="flex-grow">{children}</main>
      {/* <Footer /> */}
    </div>
  )
}
