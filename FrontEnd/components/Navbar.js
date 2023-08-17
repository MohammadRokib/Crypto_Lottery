import { ConnectButton } from "web3uikit"
import logo from "../assets/lottery.png"

export default function Navbar() {
  return (
    <nav class="bg-gray-800 mb-20">
      <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between">

          {/* Logo & Title */}
          <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div class="flex flex-shrink-0 items-center">
              <img class="h-8 w-auto" src={logo.src} alt="Your Company" />{' '}
            </div>

            <div class="hidden sm:ml-6 sm:block">
              <div class="flex space-x-4">
                <a href="#" class="text-gray-300 rounded-md px-3 py-2 font-medium text-3xl">Decentralized Lottery</a>
              </div>
            </div>
          </div>
          {/* Logo & Title */}

          <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <ConnectButton moralisAuth={false} />
          </div>
        </div>
      </div>


      <div class="sm:hidden" id="mobile-menu">
        <div class="space-y-1 px-2 pb-3 pt-2">

          <a href="#" class="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium" aria-current="page">Dashboard</a>
          <a href="#" class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Team</a>
          <a href="#" class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Projects</a>
          <a href="#" class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Calendar</a>
        </div>
      </div>
    </nav>
  );
}
