const { MerkleTree } = require('merkletreejs')
const KECCAK256 = require('keccak256');
const { BigNumber } = require('ethers');
const fs = require('fs').promises;

//TRY TO DEPLOY WITH THE FACTORY CONTRACT

async function main() {
     try {
     //   [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] = await ethers.getSigners();
     //   walletAddresses = [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8].map((s) => s.address)
     const signers = await ethers.getSigners();
    console.log("Signers:", signers.map(signer => signer.address)); // Log signer addresses

    const walletAddresses = signers.map(signer => signer.address);
    console.log("Wallet addresses:", walletAddresses);
       leaves = walletAddresses.map(x => KECCAK256(x))
       tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true })
       const eventCoin = await ethers.getContractFactory('EventCoin', signers[0]); // Corrected contract name
       const token = await eventCoin.deploy(); // Corrected factory function
       console.log("Token deployed:", token); // Debugging
   
       MerkleDistributor = await ethers.getContractFactory('MerkleDistributor', signers[0]);
   
       distributor = await MerkleDistributor.deploy(
         token.address,
         tree.getHexRoot(),
         //drop amount in wei
         BigNumber.from('1000000000000000000')
       );
   
       // signer1 is the deployer
       await token.connect(signers[0]).mint(
         distributor.address,
         BigNumber.from('9000000000000000000')
       )
   
       console.log("EventCoin:", token.address); // Corrected contract name
       console.log("MerkleDistributor:", distributor.address);
       console.log("signer1:", signers[0].address);
   
       const indexedAddresses = {}
       walletAddresses.map((x, idx) => indexedAddresses[idx] = x)
   
       const serializedAddresses = JSON.stringify(indexedAddresses);
   
       // the addresses that it is being deployed with to create a tree.
       // serialized and made available to be used to create a proof in the frontend
       await fs.writeFile("client/src/walletAddresses.json", serializedAddresses);
     } catch (error) {
       console.error("Error deploying contracts:", error);
     }
   }
   
   // npx hardhat run --network localhost scripts/deploy.js
   
   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error(error);
       process.exit(1);
     });
   

// npx hardhat run --network localhost scripts/deploy.js

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });