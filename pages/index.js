import {ethers} from 'ethers';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from "web3modal"
import { nftaddress, nftmarketaddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import Image from 'next/image'
import Web3 from "web3";
import { TransactionContext } from "../components/Connection";



export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const { currentAccount } = useContext(TransactionContext);

  useEffect(()=>{
    loadNFTs();

  }, []);

  async function loadNFTs(){

let web3=new Web3(new Web3.providers.HttpProvider("https://eth-ropsten.alchemyapi.io/v2/KGFvNnL9smRBOFsDHk8z0-lWJ-PwtbmH"));

let nftContract=new web3.eth.Contract(NFT.abi,nftaddress);
let marketContract=new web3.eth.Contract(Market.abi,nftmarketaddress);


    //return an array of unsold market items
    const data = await marketContract.methods.fetchMarketItems().call();

    const items = await Promise.all(data.map(async i => {
       const tokenUri = await nftContract.methods.tokenURI(i.tokenId).call();
       const meta = await axios.get(tokenUri);

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
       return item;
    }));

    setNfts(items);
    setLoadingState('loaded')
  }

  async function buyNFT(nft){

    const web3=new Web3(window.ethereum);

    //sign the transaction
    let marketContract=new web3.eth.Contract(Market.abi,nftmarketaddress);
    

    //set the price
    const price = web3.utils.toWei(nft.price.toString(), 'ether');
    
    //make the sale
    console.log(nftaddress)
    const transaction = await marketContract.methods.createMarketSale(nftaddress, nft.tokenId).send({
      from: currentAccount,
      value: price
    });
     
   
    loadNFTs()
  }

  if(loadingState === 'loaded' && !nfts.length) return (
    <h1 className="px-20 py-10 text-3xl">No items in market place</h1>
  )

  return (
   <div className="flex justify-center flex-wrap">
     <div className="px-4" style={{ maxWidth: '1600px'}}>
   {!currentAccount && <div className="mt-4 text-3xl">
       Please login to see buy option
       </div>}
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
                {currentAccount &&  <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                onClick={() => buyNFT(nft)}>Buy NFT</button>}
            </div>
            </div>
          ))
        }
      </div>
     </div>
   </div>
  )
}