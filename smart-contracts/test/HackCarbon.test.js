// test/HackCarbon.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HackCarbon", function () {
  let hackCarbon;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    const HackCarbon = await ethers.getContractFactory("HackCarbon");
    hackCarbon = await HackCarbon.deploy();
    await hackCarbon.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hackCarbon.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hackCarbon.balanceOf(owner.address);
      expect(await hackCarbon.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name and symbol", async function () {
      expect(await hackCarbon.name()).to.equal("HackCarbon");
      expect(await hackCarbon.symbol()).to.equal("HCN");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("100", 18);
      await hackCarbon.mintCarbonCredits(addr1.address, mintAmount);
      
      expect(await hackCarbon.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should fail if non-owner tries to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("100", 18);
      
      await expect(
        hackCarbon.connect(addr1).mintCarbonCredits(addr2.address, mintAmount)
      ).to.be.reverted;
    });
  });

  describe("Retiring (Burning) Credits", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for testing retirement
      const mintAmount = ethers.parseUnits("1000", 18);
      await hackCarbon.mintCarbonCredits(addr1.address, mintAmount);
    });

    it("Should allow users to retire their carbon credits", async function () {
      const initialBalance = await hackCarbon.balanceOf(addr1.address);
      const burnAmount = ethers.parseUnits("500", 18);
      const reason = "Offsetting carbon footprint for May 2025";
      
      await expect(hackCarbon.connect(addr1).retireCarbonCredits(burnAmount, reason))
        .to.emit(hackCarbon, "CarbonCreditsRetired")
        .withArgs(addr1.address, burnAmount, reason);
      
      const finalBalance = await hackCarbon.balanceOf(addr1.address);
      expect(finalBalance).to.equal(initialBalance - burnAmount);
    });

    it("Should fail if user tries to retire more than their balance", async function () {
      const balance = await hackCarbon.balanceOf(addr1.address);
      const burnAmount = balance + ethers.parseUnits("1", 18);
      const reason = "Offsetting carbon footprint";
      
      await expect(
        hackCarbon.connect(addr1).retireCarbonCredits(burnAmount, reason)
      ).to.be.revertedWith("Insufficient balance to retire");
    });

    it("Should fail if user tries to retire zero tokens", async function () {
      const burnAmount = 0;
      const reason = "Offsetting carbon footprint";
      
      await expect(
        hackCarbon.connect(addr1).retireCarbonCredits(burnAmount, reason)
      ).to.be.revertedWith("Amount must be greater than zero");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Mint some tokens to owner for testing transfers
      const mintAmount = ethers.parseUnits("1000", 18);
      await hackCarbon.mintCarbonCredits(owner.address, mintAmount);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseUnits("500", 18);
      
      // Transfer from owner to addr1
      await hackCarbon.transfer(addr1.address, transferAmount);
      
      const addr1Balance = await hackCarbon.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });
  });
});