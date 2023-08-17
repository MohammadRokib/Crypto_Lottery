import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants/'
import { useMoralis } from 'react-moralis';
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { useNotification } from 'web3uikit';


export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [numPlayers, setNumPlayers] = useState("0");
  const [entranceFee, setEntranceFee] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  const dispatch = useNotification();

  const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });


  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUI() {
    const contractEntranceFee = (await getEntranceFee()).toString();
    const players = (await getNumberOfPlayers()).toString();
    const winner = await getRecentWinner();

    setEntranceFee(contractEntranceFee);
    setNumPlayers(players);
    setRecentWinner(winner);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUI();
  }

  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction Complete",
      title: "Transaction Notification",
      position: "topR",
      icon: "🔔",
    });
  }


  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if(raffleAddress) {
      const raffle = new ethers.Contract(raffleAddress, abi, provider);

      const requestedRaffleWinnerFilter = raffle.filters.RequestedRaffleWinner();
      const newWinnerFilter = raffle.filters.NewWinner();
      
      const handleRequestedRaffleWinner = () => {
        updateUI();
      }
      const handleNewWinner = () => {
        updateUI();
      }

      raffle.on(requestedRaffleWinnerFilter, handleRequestedRaffleWinner);
      raffle.on(newWinnerFilter, handleNewWinner);

      return () => {
        raffle.off(requestedRaffleWinnerFilter, handleRequestedRaffleWinner);
        raffle.off(newWinnerFilter, handleNewWinner);
      }
    }
  }, [raffleAddress]);



  return (
    <div className='border-2 rounded-lg px-5 grid grid-rows-3 grid-flow-col'>
        
        {/* Enter Button */}
        <div className='px-12 py-5 flex flex-col gap-4 justify-center items-center'>
          <span className='text-xl'>
            Transform your destiny with a single ticket - seize the jackpot of lifetime!
            Enter the lottery with just {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </span>
          
          <button
            className='px-4 py-2 font-semibold text-sm bg-cyan-500 hover:bg-blue-500 text-white rounded-full shadow-sm'
            onClick={async () => {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className='animate-spin spinner-border h-8 w-8 border-b-2 rounded-full'></div>
            ) : (<div>Enter Lottery</div>)}
          </button>
        </div>

        {/* Number of participants */}
        <div className='border-t-2 border-b-2 flex justify-center items-center'>
          <span className='text-3xl'>Number of participants: {numPlayers}</span>
        </div>

        {/*Previous*/}
        <div className='flex flex-col justify-center items-center'>
          <span className='text-2xl'>New Winner</span>
          <span className='text-2xl'>{recentWinner}</span>
        </div>
    </div>
  )
}
