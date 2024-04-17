require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

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
  paths: {
    artifacts: "./Abi/artifacts"
  }
    
}