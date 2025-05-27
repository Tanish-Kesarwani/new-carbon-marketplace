// scripts/extractArtifacts.js
const fs = require('fs');
const path = require('path');

async function main() {
  // Path to the compiled contract artifact
  const artifactPath = path.join(__dirname, '../artifacts/contracts/HackCarbon.sol/HackCarbon.json');
  
  // Read the artifact file
  const artifactRaw = fs.readFileSync(artifactPath);
  const artifact = JSON.parse(artifactRaw);
  
  // Extract ABI and bytecode
  const abi = artifact.abi;
  const bytecode = artifact.bytecode;
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../deployment');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Write ABI to file
  fs.writeFileSync(
    path.join(outputDir, 'HackCarbon_abi.json'),
    JSON.stringify(abi, null, 2)
  );
  
  // Write bytecode to file
  fs.writeFileSync(
    path.join(outputDir, 'HackCarbon_bytecode.json'),
    JSON.stringify({ bytecode }, null, 2)
  );
  
  console.log('ABI and bytecode extracted successfully to the deployment directory!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });