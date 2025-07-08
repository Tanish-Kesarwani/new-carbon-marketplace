// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./HackCarbonToken.sol";
import "./EmissionsRegistry.sol";
import "./RetirementCertificate.sol";

contract CarbonMarketplace is AccessControl {
    HackCarbonToken public carbonToken;
    EmissionsRegistry public emissionsRegistry;
    RetirementCertificate public retirementCertificate;
    
    struct CompanyProfile {
        bool isRegistered;
        uint256 totalEmissions;
        uint256 totalOffsets;
        bool hasNetZeroBadge;
    }
    
    mapping(address => CompanyProfile) public companies;
    
    event CreditsPurchased(address indexed buyer, uint256 amount, uint256 price);
    event NetZeroBadgeEarned(address indexed company);
    
    constructor(
        address _carbonToken,
        address _emissionsRegistry,
        address _retirementCertificate
    ) {
        carbonToken = HackCarbonToken(_carbonToken);
        emissionsRegistry = EmissionsRegistry(_emissionsRegistry);
        retirementCertificate = RetirementCertificate(_retirementCertificate);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function purchaseAndRetireCredits(
        uint256 amount,
        string memory reason
    ) public payable {
        require(amount > 0, "Amount must be greater than zero");
        
        // Transfer tokens and retire them
        carbonToken.transferFrom(address(this), msg.sender, amount);
        carbonToken.retireCarbonCredits(amount, reason);
        
        // Mint retirement certificate
        retirementCertificate.mintCertificate(
            msg.sender,
            amount,
            reason,
            "Project details here"
        );
        
        // Update company profile
        CompanyProfile storage profile = companies[msg.sender];
        profile.totalOffsets += amount;
        
        // Check for Net-Zero achievement
        if (profile.totalOffsets >= profile.totalEmissions) {
            profile.hasNetZeroBadge = true;
            emit NetZeroBadgeEarned(msg.sender);
        }
        
        emit CreditsPurchased(msg.sender, amount, msg.value);
    }
    
    function getCompanyProfile(address company) public view returns (CompanyProfile memory) {
        return companies[company];
    }
}