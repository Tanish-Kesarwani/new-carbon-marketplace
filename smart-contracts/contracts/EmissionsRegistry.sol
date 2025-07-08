// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EmissionsRegistry is AccessControl {
    bytes32 public constant COMPANY_ROLE = keccak256("COMPANY_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    struct EmissionLog {
        uint256 timestamp;
        uint256 amount;
        string category;
        string evidence;
        bool verified;
        address verifier;
    }
    
    mapping(address => EmissionLog[]) public companyEmissions;
    
    event EmissionLogged(address indexed company, uint256 amount, string category);
    event EmissionVerified(address indexed company, uint256 emissionIndex, address verifier);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function logEmission(
        uint256 amount,
        string memory category,
        string memory evidence
    ) public onlyRole(COMPANY_ROLE) {
        EmissionLog memory newLog = EmissionLog({
            timestamp: block.timestamp,
            amount: amount,
            category: category,
            evidence: evidence,
            verified: false,
            verifier: address(0)
        });
        
        companyEmissions[msg.sender].push(newLog);
        emit EmissionLogged(msg.sender, amount, category);
    }
    
    function verifyEmission(address company, uint256 emissionIndex) public onlyRole(AUDITOR_ROLE) {
        require(emissionIndex < companyEmissions[company].length, "Invalid emission index");
        
        EmissionLog storage log = companyEmissions[company][emissionIndex];
        require(!log.verified, "Emission already verified");
        
        log.verified = true;
        log.verifier = msg.sender;
        
        emit EmissionVerified(company, emissionIndex, msg.sender);
    }
    
    function getEmissionsHistory(address company) public view returns (EmissionLog[] memory) {
        return companyEmissions[company];
    }
}