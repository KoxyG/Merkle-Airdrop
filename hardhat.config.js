require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
// require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      evmVersion: "shanghai",
      optimizer: {
        enabled: true,
        runs: 1000,
      }, 
      
  },
  },
  networks: {
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io/" || "",
     
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
     
    },
  },
  etherscan: {
    apiKey: {
      scrollSepolia: process.env.SCROLL_API_KEY
    },
    customChains: [
      {
        network: 'scrollSepolia',
        chainId: 534351,
        urls: {
          apiURL: 'https://api-sepolia.scrollscan.com/api',
          browserURL: 'https://sepolia.scrollscan.com/',
        },
      },
    ],
  },
  paths: {
    artifacts: "./Abi/artifacts"
  }
    
}