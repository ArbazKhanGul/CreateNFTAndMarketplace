import {useState,useContext,useMemo } from 'react'
import { useRouter } from 'next/router'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Web3 from  "web3";

import {  nftaddress,nftmarketaddress} from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import Image from 'next/image'
import { TransactionContext } from "../components/Connection";
import { Web3Storage, getFilesFromPath } from 'web3.storage'
import Loader from '../components/Loader'
import { create as ipfsHttpClient } from 'ipfs-http-client'


const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
export default function CreateItem() {

    const { currentAccount } = useContext(TransactionContext);
   
          const[loading,setloading]=useState(false)
          const[loading2,setloading2]=useState(false)

    const [fileUrl, setFileUrl] = useState(null)
    
    const [formInput, updateFormInput] = useState({price: '', name: '', description:''})
    const router = useRouter();

    async function onChange(e) {

        const file = e.target.files[0]
        try{ //try uploading the file
          setloading(true);  
          toast("Wait for image upload to ipfs",{
            position: "top-center"
          })

          ///through web3 storage

            // const token = process.env.NEXT_PUBLIC_WEB3_API
            // const client = new Web3Storage({ token })
            // const rootCid = await client.put(e.target.files, {
            //     name: 'nft pics',
            //     maxRetries: 3
            //   })
         
            // const url = `https://dweb.link/ipfs/${rootCid}/${e.target.files[0].name}`
            // console.log("url is",url)
            // setFileUrl(url)
          
          //thorugh influra
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            //file saved in the url path below
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)

              setloading(false)
            
        }catch(e){
            toast.error(e.message,{
                position: "top-center"
              })
            console.log('Error uploading file: ', e)
        }
    }


useState(()=>{
    if(!router.isReady) return;
    if(!currentAccount){

router.push('/');
    }
},[router.isReady])


    //1. create item (image/video) and upload to ipfs
    async function createItem(){
        const {name, description, price} = formInput; //get the value from the form input
        
        //form validation
        if(!name || !description || !price || !fileUrl) {
            return toast.warn("Please fill all fields ",{
                position: "top-center"
            })
        }

     
///thorugh web3 storage
        // const blob = new Blob([JSON.stringify(data)], {type : 'application/json'})
      
        // const files = [
        //   new File([blob], 'nftData.json')
        // ]

        // const token = process.env.NEXT_PUBLIC_WEB3_API
        // const client = new Web3Storage({ token })
    
        const data = JSON.stringify({
            name, description, image: fileUrl
        });

        try{
            setloading2(true);
            // const rootCid = await client.put(files, {
            //     name: 'nft detail',
            //     maxRetries: 3
            //   })
    
            //   const url = `https://dweb.link/ipfs/${rootCid}/nftData.json`
            //   console.log("url is",url)
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
           

              // pass the url to sav eit on Polygon adter it has been uploaded to IPFS
            createSale(url)
        }catch(error){
            toast.error(error.message,{
                position: "top-center"
              })
            console.log(`Error uploading file: `, error)
        }
    }

    //2. List item for sale
async function createSale(url){

        let web3=new Web3(ethereum);

        let NFTContract=new web3.eth.Contract(NFT.abi,nftaddress);

        const tx =await NFTContract.methods.createToken(url).send({from:currentAccount});




    let tokenId=tx.events.Transfer.returnValues.tokenId;

    let MarketContract=new web3.eth.Contract(Market.abi,nftmarketaddress);

    let listingPrice = await MarketContract.methods.getListingPrice().call();
        listingPrice = listingPrice.toString()


    let price =web3.utils.toWei(formInput.price,"ether");
    

    const txMarket =await MarketContract.methods.createMarketItem(
            nftaddress, tokenId, price
        ).send({from:currentAccount,value: listingPrice });

        setloading2(false)

    
        //sign the transaction
        // const signer = provider.getSigner();
        // let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
        // let transaction = await contract.createToken(url);
        // let tx = await transaction.wait()

        // //get the tokenId from the transaction that occured above
        // //there events array that is returned, the first item from that event
        // //is the event, third item is the token id.
        // console.log('Transaction: ',tx)
        // console.log('Transaction events: ',tx.events[0])
        // let event = has.events[0]
        // let value = event.args[2]
        // let tokenId = value.toNumber() //we need to convert it a number

        // console.log("Return token id is ",tokenId)
        // //get a reference to the price entered in the form 
        // const price = ethers.utils.parseUnits(formInput.price, 'ether')

        // contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

        // //get the listing price
        // let listingPrice = await contract.getListingPrice()
        // listingPrice = listingPrice.toString()

        // transaction = await contract.createMarketItem(
        //     nftaddress, tokenId, price, {value: listingPrice }
        // )

        // await transaction.wait()

        router.push('/')

    }

if(!currentAccount){
    return <div className="text-3xl">Loading</div>
}


    return (

        
        <div className="flex justify-center">
             <ToastContainer />
            <div className="w-1/2 flex flex-col pb-12">
                <input 
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({...formInput, name: e.target.value})}
                    />
                <textarea
                     placeholder="Asset description"
                     className="mt-2 border rounded p-4"
                     onChange={e => updateFormInput({...formInput, description: e.target.value})}
                     />
                <input 
                    placeholder="Asset Price in Eth"
                    className="mt-8 border rounded p-4"
                    type="number"
                    onChange={e => updateFormInput({...formInput, price: e.target.value})}
                    />
                    <input
                        type="file"
                        name="Asset"
                        className="my-4"
                        onChange={onChange}
                    />

                    {
                        loading && (<Loader/>)
                    }
                    {
                        fileUrl && (
                       <div className="relative w-[200px] h-[200px]">                           
                            <Image
                            
                            src={fileUrl}
                            alt="error in showing image"
                            className="rounded mt-4"
                            layout="fill"
                            // width={150}
                            // height={300} 

                          />
                          </div>
                        )
                        }


                    <button onClick={createItem}
                    disabled={loading2 ? "diabled":""}
                     className="font-bold mt-4 mb-2 bg-pink-500 text-white rounded p-4 shadow-lg"
                     >Create NFT</button>

                  {loading2 && (<Loader />)}
            </div>
        </div>
    )
}