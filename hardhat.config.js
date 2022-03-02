/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("dotenv").config();
 require("@nomiclabs/hardhat-ethers");
 const { API_URL, PRIVATE_KEY } = process.env;
 module.exports = {
   solidity: "0.8.7",
  
  //  defaultNetwork: "Polygon Mumbai",
   networks: {
     hardhat: {},
     ropsten:{
      url: "https://eth-ropsten.alchemyapi.io/v2/KGFvNnL9smRBOFsDHk8z0-lWJ-PwtbmH",
      accounts: [`0x${PRIVATE_KEY}`],
    }
    //  polygonMumbai: {
    //    url: API_URL,
    //    accounts: [`0x${PRIVATE_KEY}`],
    //  },

   },
 };