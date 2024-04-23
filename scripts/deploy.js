const { ethers } = require("hardhat");



async function main() {
  // Deploy the MerkleDistributorFactory contract
  const Factory = await ethers.getContractFactory("MerkleDistributorFactory");
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("Factory contract deployed to:", factory.address);
  
  console.log("Distributor deployed");
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
