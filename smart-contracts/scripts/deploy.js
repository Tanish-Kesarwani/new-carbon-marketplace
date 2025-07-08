const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy HackCarbonToken
  const HackCarbonToken = await hre.ethers.getContractFactory("HackCarbonToken");
  const hackCarbonToken = await HackCarbonToken.deploy();
  await hackCarbonToken.waitForDeployment();
  const hackCarbonTokenAddress = await hackCarbonToken.getAddress();
  console.log("HackCarbonToken deployed to:", hackCarbonTokenAddress);

  // Deploy EmissionsRegistry
  const EmissionsRegistry = await hre.ethers.getContractFactory("EmissionsRegistry");
  const emissionsRegistry = await EmissionsRegistry.deploy();
  await emissionsRegistry.waitForDeployment();
  const emissionsRegistryAddress = await emissionsRegistry.getAddress();
  console.log("EmissionsRegistry deployed to:", emissionsRegistryAddress);

  // Deploy RetirementCertificate
  const RetirementCertificate = await hre.ethers.getContractFactory("RetirementCertificate");
  const retirementCertificate = await RetirementCertificate.deploy();
  await retirementCertificate.waitForDeployment();
  const retirementCertificateAddress = await retirementCertificate.getAddress();
  console.log("RetirementCertificate deployed to:", retirementCertificateAddress);

  // Deploy CarbonMarketplace
  const CarbonMarketplace = await hre.ethers.getContractFactory("CarbonMarketplace");
  const carbonMarketplace = await CarbonMarketplace.deploy(
    hackCarbonTokenAddress,
    emissionsRegistryAddress,
    retirementCertificateAddress
  );
  await carbonMarketplace.waitForDeployment();
  const carbonMarketplaceAddress = await carbonMarketplace.getAddress();
  console.log("CarbonMarketplace deployed to:", carbonMarketplaceAddress);

  // Grant MINTER_ROLE to marketplace on HackCarbonToken
  const MINTER_ROLE = await hackCarbonToken.MINTER_ROLE();
  await hackCarbonToken.grantRole(MINTER_ROLE, carbonMarketplaceAddress);

  // Grant COMPANY_ROLE and AUDITOR_ROLE access (optional if not used now)
  const COMPANY_ROLE = await emissionsRegistry.COMPANY_ROLE();
  const AUDITOR_ROLE = await emissionsRegistry.AUDITOR_ROLE();

  // Grant MINTER_ROLE to marketplace on RetirementCertificate
  const CERT_MINTER_ROLE = await retirementCertificate.MINTER_ROLE();
  await retirementCertificate.grantRole(CERT_MINTER_ROLE, carbonMarketplaceAddress);

  console.log("✅ All contracts deployed and roles configured.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
