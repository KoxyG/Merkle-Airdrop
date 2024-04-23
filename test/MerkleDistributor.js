const { MerkleTree } = require('merkletreejs')
const KECCAK256 = require('keccak256');
const { expect } = require("chai");
const { web3 } = require("hardhat");

//deployment and first interaction.
describe('MerkleDistributor', () => {
  let signer1;

  beforeEach(async () => {
    

    walletAddresses = ["0x43bE1FCEeddeD2d2885f58b26C7444314b31664d", "0x7afe4313D301616526944F5C6A7764bF62FF5eBE", "0x893d9FfDF09e06BB3CD9eb57917bf0BF49359624", "0x4147D470176837Fa64F1670e94D0Cdb4B1D13A82"].map((s) => s.address)

    // Randomly select 5 addresses
    const selectedAddresses = shuffle(walletAddresses).slice(0, 2);

    const leaves = selectedAddresses.map(x => KECCAK256(x))

    tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true })

    const Factory = await ethers.getContractFactory('MerkleDistributorFactory', signer1);
    const factory = await Factory.deploy();
    await factory.deployed();

    //passing argument specicied in constructor of MerkleDistributor with drop amount of 500coins.
    distributor = await factory.deployDistributor(tree.getHexRoot(), 500);

    const accounts = await ethers.getSigners();
    signer1 = accounts[0];
  

    
  });

  function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

  // First Test
  describe('Claiming tokens', () => {
    it('allows successful claim and prevents duplicate claim', async () => {
      const accounts = await ethers.getSigners();
      const signer1 = accounts[0];
      

      // Generate proof for signer1
      const proof1 = tree.getHexProof(web3.utils.keccak256(signer1.address));

      // Claim tokens for signer1
      await distributor.connect(signer1).claim(proof1);
      expect(await token.balanceOf(signer1.address)).to.equal(500);

      // Attempt to claim tokens for signer1 again, should fail
      await expect(
        distributor.connect(signer1).claim(proof1)
      ).to.be.revertedWith('MerkleDistributor: Drop already claimed.');
    });

    it('prevents claim with invalid proof', async () => {
      const accounts = await ethers.getSigners();
      const signer3 = accounts[2];

      // Generate an invalid proof
      const invalidProof = ['0x'];

      // Attempt to claim with invalid proof, should fail
      await expect(
        distributor.connect(signer3).claim(invalidProof)
      ).to.be.revertedWith('MerkleDistributor: Invalid proof.');
    });

    it('emits Claimed event on successful claim', async () => {
      const accounts = await ethers.getSigners();
      const signer1 = accounts[0];

      // Generate proof for signer1
      const proof1 = tree.getHexProof(web3.utils.keccak256(signer1.address));

      // Expect Claimed event to be emitted on successful claim
      await expect(
        distributor.connect(signer1).claim(proof1)
      ).to.emit(distributor, 'Claimed').withArgs(signer1.address, 500);
    });
  });
})