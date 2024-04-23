// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;

import "./MerkleDistributor.sol";

contract MerkleDistributorFactory  {
    address[] public deployedPolls;
    event DistributorDeployed(address indexed distributor, bytes32 indexed merkleRoot, uint256 dropAmount);

    function deployDistributor(bytes32 merkleRoot, uint256 dropAmount) external {
        MerkleDistributor distributor = new MerkleDistributor(merkleRoot, dropAmount);
        deployedPolls.push(address(distributor));
        emit DistributorDeployed(address(distributor), merkleRoot, dropAmount);
    }

    function getDeployedPolls() external view returns (address[] memory) {
        return deployedPolls;
    }
}
