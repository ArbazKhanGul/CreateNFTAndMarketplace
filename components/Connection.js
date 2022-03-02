import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const TransactionContext = React.createContext();

function Connection({ children }) {
  const [currentAccount, setCurrentAccount] = useState("");

  // const network = {
  //   polygonMumbai: {
  //     chainId: `0x${Number(80001).toString(16)}`,
  //     chainName: "Mumbai",
  //     nativeCurrency: {
  //       name: "Matic",
  //       symbol: "Matic",
  //       decimals: 18,
  //     },
  //     rpcUrls: [
  //       "https://matic-mumbai.chainstacklabs.com",
  //       "https://rpc-mumbai.maticvigil.com",
  //       "https://matic-testnet-archive-rpc.bwarelabs.com",
  //     ],
  //     blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  //   },
  //   polygon: {
  //     chainId: `0x${Number(137).toString(16)}`,
  //     chainName: "Polygon Mainnet",
  //     nativeCurrency: {
  //       name: "Matic",
  //       symbol: "Matic",
  //       decimals: 18,
  //     },
  //     rpcUrls: ["https://polygon-rpc.com/"],
  //     blockExplorerUrls: ["https://polygonscan.com/"],
  //   },
  // };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum)
        return toast.warn("Please install MetaMask.", {
          position: "top-center",
        });

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        //  await ethereum.request({ method: "wallet_addEthereumChain",params:[
        //           network.polygonMumbai
        //     ]});
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${Number(3).toString(16)}` }],
        });

        ethereum.on("chainChanged", (chainId) => {
          if (chainId == 3) {
            setCurrentAccount(accounts[0]);
          } else {
            setCurrentAccount("");
          }
        });

        ethereum.on("accountsChanged", (account) => {
          if (account) {
           
            setCurrentAccount(account[0]);
          } else {
            setCurrentAccount("");
          }
        });
        if (ethereum.chainId == 3) {
          setCurrentAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.log(error);
      if (error.message == "ethereum is not defined")
        toast.error("Please install metamask", {
          position: "top-center",
        });
      else {
        toast.error(error.message, {
          position: "top-center",
        });
      }
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);







  const connectWallet = async () => {
    try {
      if (!window.ethereum)
        return toast.warn("Please install MetaMask.", {
          position: "top-center",
        });

      //  await ethereum.request({ method: "wallet_addEthereumChain",params:[
      //       network.ropsten
      // ]});
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(3).toString(16)}` }],
      });

      if (ethereum.chainId == 3) {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
      }

      ethereum.on("chainChanged", async (chainId) => {
        if (chainId == 3 && !currentAccount) {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          setCurrentAccount(accounts[0]);
        }
      });
    } catch (error) {
      console.log(error);
      toast.error(error.message, {
        position: "top-center",
      });
    }
  };


  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
      }}
    >
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Partnerverse NFT Market</p>
        <div className="flex mt-4">
          {" "}
          <Link href="/">
            <a className="mr-4 text-pink-500">Home</a>
          </Link>
          {currentAccount ? (
            <>
              <Link href="/create-item">
                <a className="mr-6 text-pink-500">Sell NFT</a>
              </Link>
              <Link href="/my-assets">
                <a className="mr-6 text-pink-500">My NFT</a>
              </Link>
              <Link href="/creator-dashboard">
                <a className="mr-6 text-pink-500">Dashboard</a>
              </Link>
            </>
          ) : (
            <>
              <h2
                className="mr-6 text-pink-500 cursor-pointer"
                onClick={connectWallet}
              >
                Login
              </h2>
            </>
          )}
        </div>
      </nav>
      {children}
      <ToastContainer />
    </TransactionContext.Provider>
  );
}

export default Connection;
