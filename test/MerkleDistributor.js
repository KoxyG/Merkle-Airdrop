const { MerkleTree } = require("merkletreejs");
const keccak256  = require("keccak256");
const { expect } = require("chai");
const { ethers } = require("hardhat");




//deployment and first interaction.
describe("MerkleDistributor", () => {
  // let signer1;
  let merkleTree;
  let distributor;
  let distributorAddress
  let whitelistAddress

  

  beforeEach(async () => {
    [signer1, signer2, signer3, signer4] = await ethers.getSigners();

    whitelistAddress = [signer1.address, signer2.address, signer3.address, signer4.address]

    const leaves = whitelistAddress.map(address => {
      return address
    })

    merkleTree = new MerkleTree(leaves, keccak256, {  hashLeaves: true, sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();
   

    const merkleDistributor = await ethers.getContractFactory("MerkleDistributor")
    const Distributor = await merkleDistributor.deploy();
    await Distributor.waitForDeployment();

    const Factory = await ethers.getContractFactory("MerkleDistributorFactory")
    const contract = await Factory.deploy();
    await contract.waitForDeployment();


    

    distributor = await contract.deployDistributor(merkleRoot, 500);
    await distributor;
    
    distributorAddress = await contract.deployedPolls(0); 

   
    
  });

  function shuffle(array) {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

 
  describe("Claiming tokens", () => {
     // First Test
    it("allows successful claim with claim events and prevents duplicate claim", async () => {

     // Create an instance of the distributor contract
     const deployedDistributor = await ethers.getContractAt("MerkleDistributor", distributorAddress);

      // Generate proof for signer1
      const leaf = keccak256(signer1.address);
      
      const proof1 = merkleTree.getHexProof(leaf);

      
      
      await deployedDistributor.claim(proof1, "1")
  
      expect(deployedDistributor).to.emit(deployedDistributor, "Claimed").withArgs(signer1.address, 500);
      // Attempt to claim tokens for signer1 again, should fail
      await expect(deployedDistributor.claim(proof1, "1"))
        .to.be.revertedWith("Already claimed");
    
    });

    // Second Test
    it("prevents claim with invalid address/proof", async () => {
      // Create an instance of the distributor contract
      const deployedDistributor = await ethers.getContractAt("MerkleDistributor", distributorAddress);
      
      const leaf = keccak256("0x0000000000000000000000000000000000000000");

        // Generate an invalid proof
      const invalidProof = merkleTree.getHexProof(leaf);

      // Attempt to claim with invalid proof, should fail
      await expect(
        deployedDistributor.claim(invalidProof, "1")
      ).to.be.revertedWith("Not Whitelisted");
    });

  });
});
