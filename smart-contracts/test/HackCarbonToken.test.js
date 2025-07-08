const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HackCarbonToken", function () {
  let hackCarbonToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const HackCarbonToken = await ethers.getContractFactory("HackCarbonToken");
    hackCarbonToken = await HackCarbonToken.deploy();
    await hackCarbonToken.waitForDeployment(); // 🔁 Correct for Ethers v6
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(
        await hackCarbonToken.hasRole(await hackCarbonToken.DEFAULT_ADMIN_ROLE(), owner.address)
      ).to.equal(true);
    });

    it("Should grant the minter role to owner", async function () {
      expect(
        await hackCarbonToken.hasRole(await hackCarbonToken.MINTER_ROLE(), owner.address)
      ).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should allow minting by minter role", async function () {
      await hackCarbonToken.mintCarbonCredits(
        addr1.address,
        100,
        "Project1",
        "2023",
        "VCS",
        ethers.parseEther("1") // 🔁 Updated for Ethers v6
      );
      expect(await hackCarbonToken.balanceOf(addr1.address)).to.equal(100);
    });
  });

  describe("Retirement", function () {
    it("Should allow retiring credits", async function () {
      await hackCarbonToken.mintCarbonCredits(
        addr1.address,
        100,
        "Project1",
        "2023",
        "VCS",
        ethers.parseEther("1") // 🔁 Updated
      );
      await hackCarbonToken.connect(addr1).retireCarbonCredits(50, "Test retirement");
      expect(await hackCarbonToken.balanceOf(addr1.address)).to.equal(50);
    });
  });
});
