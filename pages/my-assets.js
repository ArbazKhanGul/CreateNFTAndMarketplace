import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import Web3 from "web3"
import Image from 'next/image'
import { TransactionContext } from "../components/Connection";
import { useRouter } from 'next/router'
import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const { currentAccount } = useContext(TransactionContext);
  const router = useRouter();


  useEffect(() => {
    loadNFTs()
  }, [])


  useState(()=>{
    if(!router.isReady) return;
    if(!currentAccount){

router.push('/');
    }
},[router.isReady])

  async function loadNFTs() {

    let web3=new Web3(window.ethereum);
   let nftContract=new web3.eth.Contract(NFT.abi,nftaddress);
    let marketContract=new web3.eth.Contract(Market.abi,nftmarketaddress);


    const data = await marketContract.methods.fetchMyNFTs().call({from :currentAccount});
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await nftContract.methods.tokenURI(i.tokenId).call();
      const meta = await axios.get(tokenUri)
      let price = web3.utils.fromWei(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId,
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  if(!currentAccount){
    return <div className="text-3xl">Loading</div>
}

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  
  return (
    <div className="flex justify-center flex-wrap">
    <div className="px-4" style={{ maxWidth: '1600px'}}>
     <div className="flex justify-center pt-4 flex-wrap">
       {
         nfts.map((nft, i) =>(
           <div key={i} className="border shadow sm:mr-8 mt-6 rounded-xl overflow-hidden">
            
             <Image
                 src={nft.image}
                 alt="Error in loading image"
                 width={250}
                 height={200}
                 // blurDataURL="data:..." automatically provided
                 // placeholder="blur" // Optional blur-up while loading
               />
                       <div className="p-4">
               <p  className="text-2xl font-semibold">
                 {nft.name}
               </p>
               <div style={{ overflow: 'hidden'}}>
                 <p className="text-gray-400">{nft.description}</p>
               </div>
             </div>
             <div className="p-4 bg-black">
               <p className="text-2xl mb-4 font-bold text-white">
                 {nft.price} ETH
               </p>
           </div>
           </div>
         ))
       }
     </div>
    </div>
  </div>
  )
}