import React, {useEffect, useState} from "react"
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import contractAbi from "../Storage.json" 
import { useAccount } from "wagmi"
import { ethers, Signer } from "ethers"

export default function Home() {
  const [update, setUpdate] = useState<string>('')
  const { address } = useAccount()
  const [loading, setLoading] = useState<boolean>(false)
  
  // Quicknode setup and Integrations
  const QUICKNODE_HTTP_ENDPOINT = "https://withered-white-mound.celo-mainnet.discover.quiknode.pro/cbdff7c520a8112bb3cecb97398d3061923479d3/"
  const provider = new ethers.providers.JsonRpcProvider(QUICKNODE_HTTP_ENDPOINT);

  const contractAddress = "0x4d488C116094f68fF71B5937FCebd9bE123002d2"
  const contractInstance = new ethers.Contract(contractAddress, contractAbi.abi, provider)
  const wallet = new ethers.Wallet("48f2d4759746a68c8bdf8bc8cda316bc1ccc78cc63441a19de0e4bf787e2aed0", provider)


  const handleUpdate = (e: React.FormEvent<HTMLInputElement>) => {
    setUpdate(e.currentTarget.value)
  }


 async function getGasPrice() {
    let feeData = (await provider.getGasPrice()).toNumber()
    return feeData
}

  async function getNonce(signer : Signer) {
      let nonce = await provider.getTransactionCount(wallet.address)
      return nonce
  }

  async function store() {
    try {
        const nonce = await getNonce(wallet)
        const gasFee = await getGasPrice()
        let rawTxn = await contractInstance.populateTransaction.store(update, {
            gasPrice: gasFee, 
            nonce: nonce
        })
        console.log("...Submitting transaction with gas price of:", ethers.utils.formatUnits(gasFee, "gwei"), " - & nonce:", nonce)
        let signedTxn = (await wallet).sendTransaction(rawTxn)
        let reciept = (await signedTxn).wait()
        if (reciept) {
            console.log("Transaction is successful!!!" + '\n' + "Transaction Hash:", (await signedTxn).hash + '\n' + "Block Number: " + (await reciept).blockNumber + '\n' + "Navigate to https://explorer.celo.org/alfajores/tx/" + (await signedTxn).hash, "to see your transaction")
        } else {
            console.log("Error submitting transaction")
        }
    } catch (e) {
        console.log("Error Caught in Catch Statement: ", e)
    }
  }
  
    // Config update
  // const { config } = usePrepareContractWrite({
  //   address: CONTRACT_ADDRESS,
  //   abi: CONTRACT_ABI.abi,
  //   functionName: 'store',
  //   args: [update],
  // })

  //
  // const {  write } = useContractWrite(config)
  // const { isLoading, isSuccess } = useWaitForTransaction({
  //     // hash: data?.hash,
  // })

  // Retrieve 
  // const retriveNumber : any = useContractRead({
  //   abi: CONTRACT_ABI,
  //   address: CONTRACT_ADDRESS,
  //   functionName: 'retrieve',
  //   chainId: 44787,
  // })

  const updateNumber = async () => {
    if (!update) {
      return alert("Field required")
    }
    if (await !wallet.getAddress()) return alert("Please connect your wallet")
    // if(isSuccess) return alert("Successfully added")
    // write?.()
    setUpdate(" ")
  }

  console.log(wallet.getAddress()) 


  const formatTimestamp = (timeStamp: number) => {
    const date = new Date(timeStamp * 1000)
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  return (
    <div>
      <div className="h1 text-2xl text-center font-bold">SIMPLE STORAGE DAPP WITH QUICKNODE</div>
      <input className="border w-full p-2 my-4" type="number" placeholder="Update number" value={update} onChange={handleUpdate}/>
      <button onClick={store} className="bg-yellow-300 p-2 w-full">{"Update Number"}</button>
      <div>
        {loading ? "Fetching data..." :
          <div>
            <h1 className="text-2xl font-bold text-center p-4">User Updated List</h1>
            <div className="grid grid-cols-4 font-bold">
              <h1 className="border p-2">Id</h1>
              <h1 className="border p-2">Sender</h1>
              <h1 className="border p-2">Number</h1>
              <h1 className="border p-2">Time Stamp</h1>
            </div>
            {/* {retriveNumber.data} */}
            {/* {retriveNumber.data && retriveNumber.data.map((item: any) =>
              <div className="grid grid-cols-4" key={item.id}>
                <p className="border p-2">{item.id.substring(0,10)}</p>
                <p className="border p-2">{item.sender.substring(0,15)}</p>
                <p className="border p-2 text-center">{item.number}</p>
                <p className="border p-2">{formatTimestamp(item.timestamp)}</p>
              </div>
            )} */}
        </div>
        }


      </div>
    </div>
  )
}