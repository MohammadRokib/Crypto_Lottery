import Image from 'next/image'
import { Inter } from 'next/font/google'
import Navbar from '/components/Navbar';
import Dashboard from '/components/Dashboard';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div>
      <Navbar />
      <Dashboard />
    </div>
  )
}
