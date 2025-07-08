/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RetirementCertificate is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct Certificate {
        uint256 creditAmount;
        uint256 retirementDate;
        string reason;
        string projectDetails;
    }

    mapping(uint256 => Certificate) public certificates;
    uint256 private _nextTokenId;

    constructor() ERC721("Carbon Retirement Certificate", "CRC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintCertificate(
        address to,
        uint256 creditAmount,
        string memory reason,
        string memory projectDetails
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        certificates[tokenId] = Certificate({
            creditAmount: creditAmount,
            retirementDate: block.timestamp,
            reason: reason,
            projectDetails: projectDetails
        });

        _mint(to, tokenId);
        return tokenId;
    }

    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }

    // 🔧 Required override due to multiple inheritance
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
