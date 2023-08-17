import { contractAddresses } from '../constants/'
import LotteryEntrance from "./LotteryEntrance";
import { useMoralis } from 'react-moralis';
import Header from './Header.js'

export default function Dashboard() {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  return (
    <div className="mx-10">
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          {raffleAddress ? (
            <div>
              <LotteryEntrance />
            </div>
          ) : (
            <div className='grid grid-rows-1 grid-flow-col gap-4 border-4 rounded'>
              <div className='py-16'>

                <div className='mb-4'>
                  <span className='font-sans text-3xl leading-relaxed'>
                    Link your wallet now<br />
                    for an exclusive shot<br />
                    at lottery luck!
                  </span>
                </div>

                <div className='flex flex-col justify-center items-center'>
                  <Header />
                </div>

              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center items-center">
          <span className="font-sans text-5xl leading-relaxed">
            Instant Riches<br />Awaits: Unlock Your Luck<br />with Our Exclusive<br />Lottery App!
          </span>
        </div>
      </div>

    </div>
  );
}
