import Head from 'next/head'
import NavBar from '../../layout/NavBar'
import Footer from '../Footer/Footer'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen print:m-0">
      <Head>
        <title>Loons Team Balancer App</title>
        <link rel="icon" href="/TWSC_Badge.webp" type="image/webp" />
      </Head>
      <NavBar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
