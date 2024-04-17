// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";


error AlreadyClaimed();
error InvalidProof();

contract MerkleDistributor {
   
    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public dropAmount;

    event Claimed(address indexed account, uint256 _dropAmount);


    mapping(address => uint) private addressesClaimed;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    constructor(address token_, bytes32 merkleRoot_, uint256 dropAmount_) {
        token = token_;
        merkleRoot = merkleRoot_;
        dropAmount = dropAmount_;
    }

    function claim(bytes32[] calldata merkleProof)
        public
    {
        if (addressesClaimed[msg.sender] != 0) revert AlreadyClaimed();
      

        bytes32 node = keccak256(abi.encodePacked(msg.sender));

        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        // Mark it claimed and send the token.
        addressesClaimed[msg.sender] = 1;
        require(IERC20(token).transfer(msg.sender, dropAmount), "Transfer failed");

        emit Claimed(msg.sender, dropAmount);
}
}