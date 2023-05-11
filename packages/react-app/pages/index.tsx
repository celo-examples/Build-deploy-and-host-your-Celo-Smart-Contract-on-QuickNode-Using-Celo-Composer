import React, {FormEvent, useCallback, useEffect, useState} from "react"
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import contractAbi from "../Storage.json" 
import { useAccount } from "wagmi"

export default function Home() {
  const [update, setUpdate] = useState<string>('')
  const { address } = useAccount()
  const [loading, setLoading] = useState<boolean>(false)
  const [number, setNumber] = useState<number>(0)
  const contractAddress = "0xa2d9D757B1459173f2A98BdF9548043F51c8eF5F";


  const handleUpdate = (e: FormEvent<HTMLInputElement>) => {
    setUpdate(e.currentTarget.value)
  }
  // Config store
    const { config } = usePrepareContractWrite({
      address: contractAddress,
      abi: contractAbi.abi,
      functionName: 'store',
      args: [update],
    })

    // handle store state
    const { data, write } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })
  
  // Get retrieve status
  
  const retrieve : any = useContractRead({
    address: contractAddress,
    abi: contractAbi.abi,
    functionName: 'retrieve',
    chainId: 44787,
    args: []
  })
  
  const updateNumber = async () => {
    if (!update) {
      return alert("Field required")
    }
    if (!address) return alert("Please connect your wallet")
    setLoading(true)
    setUpdate(" ")
    write?.()
    setLoading(false)
    fetchNumber()
  }

  const fetchNumber = useCallback(() => {
    setLoading(true)
    setNumber(parseInt(retrieve.data._hex, 16))  
    setLoading(false)
  },[retrieve])

  useEffect(() => {
    fetchNumber()
  },[fetchNumber, retrieve])

  return (
    <div>
      <div className="h1 text-2xl text-center font-bold">SIMPLE STORAGE DAPP WITH QUICKNODE</div>

      <p className="text-center text-2xl">{ loading ?  "loading..." : number}</p>
      <input className="border w-full p-2 my-4" type="number" placeholder="Update number" value={update} onChange={handleUpdate}/>
      <button onClick={updateNumber} className="bg-yellow-300 p-2 w-full">{isLoading ? "Loading..." : "Update Number"}</button>
      {isSuccess ? <a className="text-blue-500 my-4 text-lg" href={`https://explorer.celo.org/mainnet/tx/${data?.hash}`}>https://explorer.celo.org/mainnet/tx/${data?.hash}</a> : null}
    </div>
  )
}