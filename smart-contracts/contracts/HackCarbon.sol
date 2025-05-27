// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HackCarbon is ERC20, Ownable {
    // Event emitted when carbon credits are retired (burned)
    event CarbonCreditsRetired(address indexed account, uint256 amount, string reason);
    
    constructor() ERC20("HackCarbon", "HCN") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    /**
     * @dev Allows the owner to mint new carbon credits
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mintCarbonCredits(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Allows users to retire (burn) their carbon credits
     * @param amount The amount of tokens to retire
     * @param reason The reason for retiring the credits
     */
    function retireCarbonCredits(uint256 amount, string memory reason) public {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to retire");
        
        _burn(msg.sender, amount);
        emit CarbonCreditsRetired(msg.sender, amount, reason);
    }
}
