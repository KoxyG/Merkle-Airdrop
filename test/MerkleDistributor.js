const { MerkleTree } = require('merkletreejs')
const KECCAK256 = require('keccak256');
const { expect } = require("chai");

//deployment and first interaction.
describe('MerkleDistributor', () => {
  beforeEach(async () => {
    [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] = await ethers.getSigners();

    walletAddresses = [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8].map((s) => s.address)

    leaves = walletAddresses.map(x => KECCAK256(x))

    tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true })

    EventCoin = await ethers.getContractFactory('EventCoin', signer1);
    token = await EventCoin.deploy();

    MerkleDistributor = await ethers.getContractFactory('MerkleDistributor', signer1);

    //passing argument specicied in constructor of MerkleDistributor with drop amount of 500coins.
    distributor = await MerkleDistributor.deploy(token.address, tree.getHexRoot(), 500);

    //minting 4000 wei of tokens and send it to the deployer address
    await token.connect(signer1).mint(
      distributor.address,
      '4000'
    )
  });



  //FIRST TEST
  //8 accounts hashed as our leaves
  describe('8 account tree', () => {
    //An account to be able to claim just once and fail the other time
    it('successful and unsuccessful claim', async () => {
      expect(await token.balanceOf(signer1.address)).to.be.equal(0)

      //a proof is what is being passed to the merkle tree to check if the address is part of the tree
      const proof = tree.getHexProof(KECCAK256(signer1.address))

      await distributor.connect(signer1).claim(proof)

      expect(await token.balanceOf(signer1.address)).to.be.equal(500)

      //calling it again, and expecting it to fail and revert.
      expect(
          distributor.connect(signer1).claim(proof)
        ).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.'
        )

      //check token balance, it should still be 500
      expect(await token.balanceOf(signer1.address)).to.be.equal(500)

    })


    //TEST 2

    it('unsuccessful claim', async () => {
      //using an address that is not included in the tree to claim
      const generatedAddress = '0x4dE8dabfdc4D5A508F6FeA28C6f1B288bbdDc26e'

      //generate proof for that address
      const proof2 = tree.getHexProof(KECCAK256(generatedAddress))

      //expect it to revert while claiming with invalid proof
      expect(
          distributor.connect(signer1).claim(proof2)
        ).to.be.revertedWith(
          'MerkleDistributor: Invalid proof.'
        )
    })


    //TEST 3
    // checks for emitting an event
    it('emits a successful event', async () => {
      //generating a proof for the address
      const proof = tree.getHexProof(KECCAK256(signer1.address))

      //expecting it to emit an event with the address and the amount of coins claimed
      await expect(distributor.connect(signer1).claim(proof))
        .to.emit(distributor, 'Claimed')
        .withArgs(signer1.address, 500)
    })

  })
})