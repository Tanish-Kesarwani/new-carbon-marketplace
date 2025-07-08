// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HackCarbonToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Metadata for carbon credits
    struct CreditMetadata {
        string projectId;
        string vintage;
        string standard;
        uint256 price;
    }
    
    mapping(uint256 => CreditMetadata) public creditMetadata;
    uint256 public nextCreditBatchId;
    
    event CarbonCreditsRetired(address indexed account, uint256 amount, string reason);
    event CreditBatchCreated(uint256 indexed batchId, CreditMetadata metadata);
    
    constructor() ERC20("HackCarbon", "HCN") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mintCarbonCredits(
        address to,
        uint256 amount,
        string memory projectId,
        string memory vintage,
        string memory standard,
        uint256 price
    ) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        
        creditMetadata[nextCreditBatchId] = CreditMetadata({
            projectId: projectId,
            vintage: vintage,
            standard: standard,
            price: price
        });
        
        emit CreditBatchCreated(nextCreditBatchId, creditMetadata[nextCreditBatchId]);
        nextCreditBatchId++;
    }
    
    function retireCarbonCredits(uint256 amount, string memory reason) public {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to retire");
        
        _burn(msg.sender, amount);
        emit CarbonCreditsRetired(msg.sender, amount, reason);
    }
}