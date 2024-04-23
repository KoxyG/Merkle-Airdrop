// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


error InvalidProof();

contract MerkleDistributor is ERC1155("") {
   
    bytes32 public immutable merkleRoot;
    uint256 public dropAmount;
    uint256 public nextID = 0;
    
   
   
    event Claimed(address indexed account, uint256 _dropAmount);

    function mint(address account, uint256 amount) internal {
        nextID++;
        _mint(account, nextID, amount, "");
    }
   

    mapping(address => bool) addressesClaimed;
   

    constructor(bytes32 merkleRoot_, uint256 dropAmount_) {
        merkleRoot = merkleRoot_;
        dropAmount = dropAmount_;
    }


    function claim(bytes32[] calldata merkleProof)
        public
    {
        require(!addressesClaimed[msg.sender], "Already claimed");
        bytes32 node = keccak256(abi.encodePacked(msg.sender));

        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();
        addressesClaimed[msg.sender] =  true;
        mint(msg.sender, dropAmount);
        emit Claimed(msg.sender, dropAmount);
    }
    
}