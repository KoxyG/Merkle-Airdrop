require('@openzeppelin/hardhat-upgrades');
const { ethers, defender} = require("hardhat");



async function main() {
  // Deploy the MerkleDistributorFactory contract
  const Factory = await ethers.getContractFactory("MerkleDistributorFactory");
  // const factory = await Factory.deploy();
  const factory = await defender.deployContract(Factory);
  // await factory.deployed();
  const deploy = await factory.waitForDeployment();
  // console.log("Factory contract deployed to:", factory.address);
  console.log("Factory contract deployed to:", deploy.getAddress());

  
  console.log("Distributor deployed");
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
